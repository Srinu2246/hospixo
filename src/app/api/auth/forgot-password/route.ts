import { NextResponse } from 'next/server';

import { parseAuthJsonBody } from '@/features/auth/server/parseAuthJsonBody';
import { proxyAuthPost } from '@/features/auth/server/proxyAuthPost';
import { forgotPasswordSchema } from '@/features/auth/schemas/forgotPasswordSchema';
import { UPSTREAM_AUTH_PATHS } from '@/lib/constants/authApiPaths';

export async function POST(request: Request) {
  const parsed = await parseAuthJsonBody(request, forgotPasswordSchema);
  if (parsed instanceof NextResponse) {
    return parsed;
  }

  return proxyAuthPost(parsed.data, UPSTREAM_AUTH_PATHS.forgotPassword);
}
