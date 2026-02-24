import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUserId } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const userId = getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const workDuration = Number(body.workDuration) || 25;
    const shortBreakDuration = Number(body.shortBreakDuration) || 5;
    const longBreakDuration = Number(body.longBreakDuration) || 15;

    await prisma.$executeRawUnsafe(
      'INSERT INTO UserSettings (userId, workDuration, shortBreakDuration, longBreakDuration) VALUES (?, ?, ?, ?) ' +
        'ON DUPLICATE KEY UPDATE workDuration = VALUES(workDuration), shortBreakDuration = VALUES(shortBreakDuration), longBreakDuration = VALUES(longBreakDuration)',
      userId,
      workDuration,
      shortBreakDuration,
      longBreakDuration,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile settings update error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
