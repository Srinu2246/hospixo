import { NextResponse } from 'next/server';

import { performPlatformLogin } from '@/services/platform-auth.server';

export async function POST(request: Request) {
  const formData = await request.formData();
  const result = await performPlatformLogin(
    String(formData.get('email') ?? ''),
    String(formData.get('password') ?? ''),
    String(formData.get('domain') ?? ''),
  );

  if (!result.ok) {
    return NextResponse.json(result.state, { status: 422 });
  }

  return NextResponse.json({ redirectTo: result.redirectTo });
}
