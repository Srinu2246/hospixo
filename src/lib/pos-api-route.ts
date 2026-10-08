/**
 * Shared helpers for POS BFF routes (`/api/pos/*`, `/api/kitchen/*`).
 */

import type { NextResponse } from 'next/server';

import { parseBranchRouteSearchParams } from '@/lib/api/branch-tenancy';
import { ApiRequestError, getUserFriendlyErrorMessage } from '@/lib/api/errors';
import { jsonError, jsonOk } from '@/lib/api/route-response';
import { resolveFloorRequestContext, type FloorRequestOptions } from '@/lib/floors-server';
import { getServerToken } from '@/server/auth';

export async function requirePosAccessToken(): Promise<
  { token: string; error: null } | { token: null; error: NextResponse }
> {
  const token = await getServerToken();
  if (!token) {
    return { token: null, error: jsonError('Sign in required.', 401) };
  }
  return { token, error: null };
}

export function floorOptionsFromSearchParams(searchParams: {
  outlet?: string | null;
  branch_id?: string | null;
}): FloorRequestOptions {
  const branchId = parseBranchRouteSearchParams({
    outlet: searchParams.outlet ?? undefined,
    branch_id: searchParams.branch_id ?? undefined,
  });
  return branchId != null ? { activeBranchId: branchId, preferredBranchId: branchId } : {};
}

export async function resolvePosBranchContext(options: FloorRequestOptions = {}) {
  const auth = await requirePosAccessToken();
  if (auth.error) return { token: null as null, branchId: null, error: auth.error };

  const ctx = await resolveFloorRequestContext(options);
  if (!ctx.token) {
    return { token: null as null, branchId: null, error: jsonError('Sign in required.', 401) };
  }
  if (ctx.branchId == null) {
    return {
      token: ctx.token,
      branchId: null,
      error: jsonError(ctx.error ?? 'A branch context is required.', 400),
    };
  }

  return { token: ctx.token, branchId: ctx.branchId, error: null as null };
}

export function posApiError(err: unknown, fallback: string) {
  const message = getUserFriendlyErrorMessage(err, fallback);
  if (err instanceof ApiRequestError) {
    const status = err.status >= 400 && err.status < 600 ? err.status : 502;
    return jsonError(message, status);
  }
  return jsonError(message, 500);
}

export { jsonError, jsonOk };
