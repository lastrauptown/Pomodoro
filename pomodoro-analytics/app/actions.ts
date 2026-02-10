'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function saveSession(data: {
  duration: number;
  type: string;
  completed: boolean;
}) {
  try {
    const session = await prisma.session.create({
      data: {
        startTime: new Date(Date.now() - data.duration * 1000), // Approximate start time
        endTime: new Date(),
        duration: data.duration,
        type: data.type,
        completed: data.completed,
        pauseCount: 0 // We'll add pause tracking later
      },
    });
    return { success: true, id: session.id };
  } catch (error) {
    console.error('Failed to save session:', error);
    return { success: false, error: 'Database Error' };
  }
}
