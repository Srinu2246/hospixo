import { NextResponse, type NextRequest } from 'next/server';

import { homePathForRole, parseSidebarSession } from '@/lib/auth/session';

const SESSION_COOKIE = 'session';
const PROFILE_COOKIE = 'hospixo_profile';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const isLogin = pathname === '/login' || pathname.startsWith('/login/');
  const isGuestMenu = pathname === '/guest-menu' || pathname.endsWith('/guest-menu');

  if (!hasSession) {
    if (isLogin || isGuestMenu) return NextResponse.next();

    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    return NextResponse.redirect(url);
  }

  if (isLogin || pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = homeForRequest(request);
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

function homeForRequest(request: NextRequest): string {
  const raw = request.cookies.get(PROFILE_COOKIE)?.value;
  const session = raw ? parseSidebarSession(raw) : null;
  return session ? homePathForRole(session.role) : '/branch-manager/dashboard';
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
