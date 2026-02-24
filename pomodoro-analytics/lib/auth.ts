import { headers } from 'next/headers';
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

export function getCurrentUserId(req?: Request): number | null {
  let cookieHeader = '';
  if (req) {
    cookieHeader = req.headers.get('cookie') || '';
  } else {
    const h = headers();
    // In some runtimes, headers() may not have get(); guard it
    try {
      // @ts-ignore
      cookieHeader = (typeof h.get === 'function' ? h.get('cookie') : '') || '';
    } catch {
      cookieHeader = '';
    }
  }
  const parts = cookieHeader.split(';').map((p) => p.trim());
  const target = parts.find((p) => p.startsWith(COOKIE_NAME + '='));
  if (!target) return null;
  const token = decodeURIComponent(target.slice(COOKIE_NAME.length + 1));
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, getSecret()) as TokenPayload;
    return decoded.userId;
  } catch {
    return null;
  }
}
