/**
 * BFF: Floors collection
 * - GET  /api/floors  → GET  /api/v1/restaurant/branches/{branch_id}/floors
 * - POST /api/floors  → POST /api/v1/restaurant/branches/{branch_id}/floors
 */

import { createFloor, listFloors } from '@/lib/api/floors';
import type { CreateFloorInput } from '@/features/floor-table-setup/types/floor-table';
import {
  floorsApiError,
  jsonOk,
  requireAccessToken,
  resolveBranchId,
} from '@/lib/floors-api-route';

function parseBranchId(url: URL): number | undefined {
  const raw = url.searchParams.get('branch_id');
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

/** GET /api/floors */
export async function GET(request: Request) {
  const auth = await requireAccessToken();
  if (auth.error) return auth.error;

  const url = new URL(request.url);
  const scope = await resolveBranchId(parseBranchId(url));
  if (scope.error) return scope.error;

  try {
    const data = await listFloors(auth.token, scope.branchId);
    return jsonOk(data);
  } catch (err) {
    return floorsApiError(err, 'Unable to load floors.');
  }
}

/** POST /api/floors */
export async function POST(request: Request) {
  const auth = await requireAccessToken();
  if (auth.error) return auth.error;

  try {
    const body = (await request.json()) as CreateFloorInput & { branch_id?: number };
    const scope = await resolveBranchId(body.branch_id);
    if (scope.error) return scope.error;

    const payload = { ...body };
    delete payload.branch_id;
    const data = await createFloor(auth.token, scope.branchId, payload);
    return jsonOk(data, { status: 201 });
  } catch (err) {
    return floorsApiError(err, 'Unable to create floor.');
  }
}
