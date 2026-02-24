import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/analytics', '/session-summary', '/ai', '/profile'];
const COOKIE_NAME = 'pomodoro_session';

export function middleware(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;
    if (!PROTECTED_PATHS.includes(pathname)) {
      return NextResponse.next();
    }
    const session = req.cookies.get(COOKIE_NAME)?.value;
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/analytics', '/session-summary', '/ai', '/profile'],
};

