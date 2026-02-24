import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUserId } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    const userId = getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 },
      );
    }

    const sessions = await prisma.$queryRaw<
      {
        startTime: Date;
        duration: number;
        type: string;
        completed: boolean;
        pauseCount: number;
      }[]
    >`SELECT startTime, duration, type, completed, pauseCount
         FROM Session
        WHERE userId = ${userId}
     ORDER BY startTime DESC
        LIMIT 50`;

    const summaryLines = sessions.map((s) => {
      const minutes = Math.round(s.duration / 60);
      const status = s.completed ? 'completed' : 'incomplete';
      return `${s.type} session, ${minutes} minutes, ${status}, pauses: ${s.pauseCount}`;
    });

    const summaryText =
      summaryLines.join('\n') || 'No sessions yet. Suggest a starter plan.';

    const prompt = `
You are a friendly productivity coach.

Here is this user's recent Pomodoro history (newest first):

${summaryText}

Based on this, give:
- 3 short bullet-point insights about their habits
- 3 specific recommendations (work/break lengths, best time of day, break ideas)
Keep it concise and encouraging.
`;

    if (apiKey) {
      try {
        const response = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' +
            apiKey,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          },
        );

        if (response.ok) {
          const data = await response.json();
          const text =
            data.candidates?.[0]?.content?.parts
              ?.map((p: { text?: string }) => p.text || '')
              .join('\n')
              .trim() || 'No tips available.';
          return NextResponse.json({ tips: text });
        }
      } catch {}
    }

    const morningCount = sessions.filter((s) => {
      const h = new Date(s.startTime).getHours();
      return h < 12;
    }).length;
    const afternoonCount = sessions.filter((s) => {
      const h = new Date(s.startTime).getHours();
      return h >= 12 && h < 18;
    }).length;
    const eveningCount = sessions.length - morningCount - afternoonCount;

    const topPeriod =
      morningCount >= afternoonCount && morningCount >= eveningCount
        ? 'morning'
        : afternoonCount >= eveningCount
        ? 'afternoon'
        : 'evening';

    const avgMinutes =
      sessions.length > 0
        ? Math.round(
            sessions.reduce((acc, s) => acc + s.duration, 0) /
              sessions.length /
              60,
          )
        : 25;

    const heuristic = [
      'Insights:',
      `• You have the most sessions in the ${topPeriod}.`,
      `• Your average session length is around ${avgMinutes} minutes.`,
      `• Keep breaks consistent to avoid losing momentum.`,
      '',
      'Recommendations:',
      `• Schedule focused work in the ${topPeriod} when your energy is highest.`,
      `• Try ${Math.max(20, Math.min(50, avgMinutes))} minutes work blocks with 5–10 minute breaks.`,
      '• Use long breaks after every 3–4 work sessions to reset.',
    ].join('\n');

    return NextResponse.json({ tips: heuristic });
  } catch (error) {
    console.error('AI tips API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
