import { NextResponse } from 'next/server';

import { getServerAuthSession } from '@/lib/auth/session';

export async function GET() {
  const session = await getServerAuthSession();
  if (!session) {
    return NextResponse.json({ success: true, data: { user: null } });
  }

  return NextResponse.json({
    success: true,
    data: { user: session.user },
  });
}
