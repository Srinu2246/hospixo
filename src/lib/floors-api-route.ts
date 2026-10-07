/**
 * Shared helpers for Floor & Table Set-up BFF routes (`/api/floors`, …).
 */

import type { NextResponse } from 'next/server';

import { ApiRequestError, getUserFriendlyErrorMessage } from '@/lib/api/errors';
import { jsonError, jsonOk } from '@/lib/api/route-response';
import { getServerAuthSession } from '@/lib/auth/session';
import { getServerToken } from '@/server/auth';

/** Require session cookie; returns token or a 401 response. */
export async function requireAccessToken(): Promise<
  { token: string; error: null } | { token: null; error: NextResponse }
> {
  const token = await getServerToken();
  if (!token) {
    return { token: null, error: jsonError('Sign in required.', 401) };
  }
  return { token, error: null };
}

/** Resolve branch_id from query/body or signed-in session. */
export async function resolveBranchId(
  explicitBranchId: number | null | undefined,
): Promise<{ branchId: number; error: null } | { branchId: null; error: NextResponse }> {
  if (explicitBranchId != null && Number.isFinite(explicitBranchId) && explicitBranchId > 0) {
    return { branchId: explicitBranchId, error: null };
  }

  const session = await getServerAuthSession();
  const branchId = session?.user?.branch_id ?? null;

  if (branchId == null || !Number.isFinite(branchId) || branchId <= 0) {
    return {
      branchId: null,
      error: jsonError('A branch context is required for floor and table setup.', 400),
    };
  }

  return { branchId, error: null };
}

/** Map backend/lib errors to BFF JSON responses. */
export function floorsApiError(err: unknown, fallback: string) {
  const message = getUserFriendlyErrorMessage(err, fallback);
  if (err instanceof ApiRequestError) {
    const status = err.status >= 400 && err.status < 600 ? err.status : 502;
    return jsonError(message, status);
  }
  return jsonError(message, 500);
}

export { jsonError, jsonOk };
