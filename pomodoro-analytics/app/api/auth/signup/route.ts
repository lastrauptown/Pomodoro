import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createSessionToken, getSessionCookieName } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email: string = (body.email || '').toLowerCase().trim();
    const password: string = body.password || '';
    const name: string | undefined = body.name?.trim() || undefined;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 },
      );
    }

    const existing = await prisma.$queryRaw<
      { id: number }[]
    >`SELECT id FROM User WHERE email = ${email} LIMIT 1`;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Email is already registered' },
        { status: 400 },
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    await prisma.$executeRawUnsafe(
      'INSERT INTO User (email, password, name) VALUES (?, ?, ?)',
      email,
      hashed,
      name ?? null,
    );

    const rows = await prisma.$queryRaw<
      { id: number; email: string; name: string | null }[]
    >`SELECT id, email, name FROM User WHERE email = ${email} ORDER BY id DESC LIMIT 1`;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 },
      );
    }

    const user = rows[0];

    await prisma.$executeRawUnsafe(
      'INSERT INTO UserSettings (userId) VALUES (?)',
      user.id,
    );

    const token = createSessionToken(user.id, user.email);

    const response = NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    response.cookies.set(getSessionCookieName(), token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error: any) {
    console.error('Signup error', error);
    const message =
      typeof error?.message === 'string' ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
