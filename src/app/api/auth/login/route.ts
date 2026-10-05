import { NextResponse } from 'next/server';

import { ADMIN_ROUTES } from '@/constants/routes';
import { ADMIN_SESSION_COOKIE_NAME } from '@/constants/auth/session';
import { performAdminLogin } from '@/services/auth.server';

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  const result = performAdminLogin(email, password);

  if (!result.ok) {
    return NextResponse.json(result.state, { status: 422 });
  }

  const response = NextResponse.json({ redirectTo: ADMIN_ROUTES.dashboard });
  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, result.email, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}
