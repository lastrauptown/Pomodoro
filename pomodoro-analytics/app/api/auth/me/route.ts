import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUserId } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const userId = getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ user: null });
    }

    const rows = await prisma.$queryRaw<
      {
        id: number;
        email: string;
        name: string | null;
        workDuration: number | null;
        shortBreakDuration: number | null;
        longBreakDuration: number | null;
        bestFocusTime: string | null;
        interruptionTrend: string | null;
        lastAnalysisDate: Date | null;
      }[]
    >`SELECT u.id,
            u.email,
            u.name,
            us.workDuration,
            us.shortBreakDuration,
            us.longBreakDuration,
            us.bestFocusTime,
            us.interruptionTrend,
            us.lastAnalysisDate
       FROM User u
  LEFT JOIN UserSettings us ON us.userId = u.id
      WHERE u.id = ${userId}
      LIMIT 1`;

    if (rows.length === 0) {
      return NextResponse.json({ user: null });
    }

    const row = rows[0];

    return NextResponse.json({
      user: {
        id: row.id,
        email: row.email,
        name: row.name,
        settings:
          row.workDuration === null
            ? null
            : {
                workDuration: row.workDuration,
                shortBreakDuration: row.shortBreakDuration,
                longBreakDuration: row.longBreakDuration,
                bestFocusTime: row.bestFocusTime,
                interruptionTrend: row.interruptionTrend,
                lastAnalysisDate: row.lastAnalysisDate,
              },
      },
    });
  } catch (error) {
    console.error('Me endpoint error', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
