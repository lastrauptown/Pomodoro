import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUserId } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const userId = getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.max(1, Math.min(100, Number(searchParams.get('limit') || 20)));

    const rows = await prisma.$queryRaw<
      {
        id: number;
        startTime: Date;
        endTime: Date | null;
        type: string;
        duration: number;
        completed: boolean;
        pauseCount: number;
      }[]
    >`SELECT id, startTime, endTime, type, duration, completed, pauseCount
         FROM Session
        WHERE userId = ${userId}
     ORDER BY createdAt DESC
        LIMIT ${limit}`;

    const sessions = rows.map((r) => ({
      id: r.id,
      startTime: r.startTime,
      endTime: r.endTime,
      type: r.type,
      duration: r.duration,
      completed: r.completed,
      pauseCount: r.pauseCount,
    }));

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('sessions route error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getCurrentUserId(request);
    const body = await request.json().catch(() => ({}));
    const duration = Number(body.duration) || 0;
    const type = String(body.type || 'work');
    const completed = Boolean(body.completed);

    const startTime = new Date(Date.now() - duration * 1000);
    const endTime = new Date();

    await prisma.$executeRawUnsafe(
      'INSERT INTO Session (startTime, endTime, duration, type, completed, pauseCount, userId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      startTime,
      endTime,
      duration,
      type,
      completed ? 1 : 0,
      0,
      userId ?? null,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('sessions POST error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
