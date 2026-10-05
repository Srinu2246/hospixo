import { NextResponse } from 'next/server';

import { devAuthMockResponse } from '@/features/auth/server/devAuthMock';
import { getApiBaseUrl, isAuthDevMockEnabled } from '@/lib/env/getApiBaseUrl';

export async function proxyAuthPost(body: unknown, upstreamPath: string): Promise<NextResponse> {
  const upstreamBase = getApiBaseUrl();

  if (!upstreamBase) {
    if (isAuthDevMockEnabled()) {
      const mock = devAuthMockResponse(upstreamPath, body);
      if (mock) {
        return mock;
      }
    }

    return NextResponse.json(
      {
        message:
          'Authentication service is not configured. Set API_URL, API_BASE_URL, or NEXT_PUBLIC_API_BASE_URL in .env.local.',
      },
      { status: 503 },
    );
  }

  const upstreamUrl = `${upstreamBase}${upstreamPath.startsWith('/') ? upstreamPath : `/${upstreamPath}`}`;

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json(
      { message: 'Unable to reach authentication service.' },
      { status: 502 },
    );
  }

  const contentType = upstreamResponse.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const payload: unknown = await upstreamResponse.json();
    return NextResponse.json(payload, { status: upstreamResponse.status });
  }

  const text = await upstreamResponse.text();
  return NextResponse.json(
    { message: text || `Upstream responded with status ${upstreamResponse.status}` },
    { status: upstreamResponse.status },
  );
}
