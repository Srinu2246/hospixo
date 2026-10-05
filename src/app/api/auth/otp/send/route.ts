import { NextResponse } from 'next/server';

import { parseAuthJsonBody } from '@/features/auth/server/parseAuthJsonBody';
import { proxyAuthPost } from '@/features/auth/server/proxyAuthPost';
import { otpLoginSchema } from '@/features/auth/schemas/otpLoginSchema';
import { UPSTREAM_AUTH_PATHS } from '@/lib/constants/authApiPaths';

export async function POST(request: Request) {
  const parsed = await parseAuthJsonBody(request, otpLoginSchema);
  if (parsed instanceof NextResponse) {
    return parsed;
  }

  return proxyAuthPost(parsed.data, UPSTREAM_AUTH_PATHS.otpSend);
}
