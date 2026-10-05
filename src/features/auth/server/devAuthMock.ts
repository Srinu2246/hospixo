import { NextResponse } from 'next/server';

import { UPSTREAM_AUTH_PATHS } from '@/lib/constants/authApiPaths';

export function devAuthMockResponse(upstreamPath: string, body: unknown): NextResponse | null {
  switch (upstreamPath) {
    case UPSTREAM_AUTH_PATHS.login:
    case UPSTREAM_AUTH_PATHS.pinLogin: {
      void body;
      return NextResponse.json({
        token: `dev_mock_${Date.now()}`,
      });
    }
    case UPSTREAM_AUTH_PATHS.otpSend:
    case UPSTREAM_AUTH_PATHS.forgotPassword: {
      void body;
      return NextResponse.json({ ok: true });
    }
    default:
      return null;
  }
}
