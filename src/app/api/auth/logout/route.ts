import { NextResponse } from 'next/server';

import { AUTH_ROUTES } from '@/constants/routes';
import { ADMIN_SESSION_COOKIE_NAME } from '@/constants/auth/session';
import { invalidateServerAuthSession } from '@/lib/auth/session';

export async function POST() {
  await invalidateServerAuthSession();
  const response = NextResponse.json({ redirectTo: AUTH_ROUTES.login });
  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}
