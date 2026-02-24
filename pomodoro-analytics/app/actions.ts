'use server';

import { PrismaClient } from '@prisma/client';
import { getCurrentUserId } from '@/lib/auth';

const prisma = new PrismaClient();

export async function saveSession(data: {
  duration: number;
  type: string;
  completed: boolean;
}) {
  try {
    const userId = getCurrentUserId();

    const session = await prisma.session.create({
      data: {
        startTime: new Date(Date.now() - data.duration * 1000),
        endTime: new Date(),
        duration: data.duration,
        type: data.type,
        completed: data.completed,
        pauseCount: 0,
        userId: userId ?? null,
      },
    });
    return { success: true, id: session.id };
  } catch (error) {
    console.error('Failed to save session:', error);
    return { success: false, error: 'Database Error' };
  }
}
