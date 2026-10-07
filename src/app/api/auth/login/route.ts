import { NextResponse } from 'next/server';

import { performLogin } from '@/services/login.server';

export async function POST(request: Request) {
  let identifier = '';
  let password = '';

  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    const json = await request.json().catch(() => ({}));
    identifier = String(json.identifier ?? json.email ?? '');
    password = String(json.password ?? '');
  } else {
    const formData = await request.formData();
    identifier = String(formData.get('identifier') ?? formData.get('email') ?? '');
    password = String(formData.get('password') ?? '');
  }

  const result = await performLogin(identifier, password);

  if (!result.ok) {
    return NextResponse.json(result.state, { status: 422 });
  }

  return NextResponse.json({ redirectTo: result.redirectTo });
}
