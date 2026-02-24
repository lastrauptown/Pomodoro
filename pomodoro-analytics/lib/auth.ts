import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'pomodoro_session';

type TokenPayload = {
  userId: number;
  email: string;
};

function getSecret() {
  return process.env.AUTH_SECRET || 'dev-secret-change-in-env';
}

export function createSessionToken(userId: number, email: string) {
  return jwt.sign({ userId, email } as TokenPayload, getSecret(), {
    expiresIn: '30d',
  });
}

export function getSessionCookieName() {
  return COOKIE_NAME;
}

export function getCurrentUserId(): number | null {
  const cookie = cookies().get(COOKIE_NAME);
  if (!cookie?.value) return null;
  try {
    const decoded = jwt.verify(cookie.value, getSecret()) as TokenPayload;
    return decoded.userId;
  } catch {
    return null;
  }
}
