import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUserId } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const sessions = await prisma.session.findMany({
      where: {
        userId,
        startTime: {
          gte: sevenDaysAgo,
        },
      },
    });

    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

    const weeklyStats: Record<
      (typeof dayLabels)[number],
      { sessions: number; morning: number; afternoon: number; evening: number }
    > = {
      Mon: { sessions: 0, morning: 0, afternoon: 0, evening: 0 },
      Tue: { sessions: 0, morning: 0, afternoon: 0, evening: 0 },
      Wed: { sessions: 0, morning: 0, afternoon: 0, evening: 0 },
      Thu: { sessions: 0, morning: 0, afternoon: 0, evening: 0 },
      Fri: { sessions: 0, morning: 0, afternoon: 0, evening: 0 },
      Sat: { sessions: 0, morning: 0, afternoon: 0, evening: 0 },
      Sun: { sessions: 0, morning: 0, afternoon: 0, evening: 0 },
    };

    const periods = {
      morning: 0,
      afternoon: 0,
      evening: 0,
    };

    sessions.forEach((s) => {
      const d = new Date(s.startTime);
      const dayIndex = d.getDay();
      const label = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex] as
        | 'Sun'
        | 'Mon'
        | 'Tue'
        | 'Wed'
        | 'Thu'
        | 'Fri'
        | 'Sat';

      const stats = weeklyStats[label];
      stats.sessions += 1;

      const hour = d.getHours();
      if (hour < 12) {
        stats.morning += 1;
        periods.morning += 1;
      } else if (hour < 18) {
        stats.afternoon += 1;
        periods.afternoon += 1;
      } else {
        stats.evening += 1;
        periods.evening += 1;
      }
    });

    const weekly = dayLabels.map((label) => {
      const stats = weeklyStats[label];
      const maxCount = Math.max(stats.morning, stats.afternoon, stats.evening);

      let dominantPeriod: 'MORNING' | 'AFTERNOON' | 'EVENING' | null = null;
      if (maxCount > 0) {
        if (maxCount === stats.morning) dominantPeriod = 'MORNING';
        else if (maxCount === stats.afternoon) dominantPeriod = 'AFTERNOON';
        else if (maxCount === stats.evening) dominantPeriod = 'EVENING';
      }

      return {
        day: label,
        sessions: stats.sessions,
        dominantPeriod,
      };
    });

    return NextResponse.json({ weekly, periods });
  } catch (error) {
    console.error('analytics-summary error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
