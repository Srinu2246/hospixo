import { NextResponse } from 'next/server';

import { parseAuthJsonBody } from '@/features/auth/server/parseAuthJsonBody';
import { proxyAuthPost } from '@/features/auth/server/proxyAuthPost';
import { loginSchema } from '@/features/auth/schemas/loginSchema';
import { UPSTREAM_AUTH_PATHS } from '@/lib/constants/authApiPaths';

export async function POST(request: Request) {
  const parsed = await parseAuthJsonBody(request, loginSchema);
  if (parsed instanceof NextResponse) {
    return parsed;
  }

  return proxyAuthPost(parsed.data, UPSTREAM_AUTH_PATHS.login);
}
