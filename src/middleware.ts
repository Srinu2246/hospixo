import { NextResponse, type NextRequest } from 'next/server';

import { normalizeRoleKey } from '@/app/sidebar';
import { homePathForRole, parseSidebarSession } from '@/lib/auth/session';

const SESSION_COOKIE = 'session';
const PROFILE_COOKIE = 'hospixo_profile';

/** Operational roles should not land on the branch sales dashboard. */
function isBranchSalesDashboard(pathname: string): boolean {
  return (
    pathname === '/branch-manager/dashboard' ||
    pathname === '/branch/dashboard' ||
    pathname.endsWith('/branch-manager/dashboard')
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const isLogin = pathname === '/login' || pathname.startsWith('/login/');

  if (!hasSession) {
    if (isLogin) return NextResponse.next();

    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    return NextResponse.redirect(url);
  }

  const home = homeForRequest(request);

  if (isLogin || pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = home;
    url.search = '';
    return NextResponse.redirect(url);
  }

  // Kitchen / captain / cashier: bounce off branch sales dashboard onto their first sidebar route.
  const roleKey = roleKeyForRequest(request);
  if (
    isBranchSalesDashboard(pathname) &&
    (roleKey === 'kitchen' ||
      roleKey === 'chef' ||
      roleKey === 'waiter' ||
      roleKey === 'cashier') &&
    home !== pathname
  ) {
    const url = request.nextUrl.clone();
    url.pathname = home;
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

function roleKeyForRequest(request: NextRequest): string {
  const raw = request.cookies.get(PROFILE_COOKIE)?.value;
  const session = raw ? parseSidebarSession(raw) : null;
  return session ? normalizeRoleKey(session.role) : '';
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
