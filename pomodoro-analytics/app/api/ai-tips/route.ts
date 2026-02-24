import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUserId } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing GEMINI_API_KEY in environment' },
        { status: 500 },
      );
    }

    const userId = getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 },
      );
    }

    const sessions = await prisma.session.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
      take: 50,
    });

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

    if (!response.ok) {
      const text = await response.text();
      console.error('Gemini error response:', text);
      return NextResponse.json(
        { error: 'AI request failed' },
        { status: 500 },
      );
    }

    const data = await response.json();

    const text =
      data.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text || '')
        .join('\n')
        .trim() || 'No tips available.';

    return NextResponse.json({ tips: text });
  } catch (error) {
    console.error('AI tips API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
