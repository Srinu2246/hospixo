/**
 * BFF: Single floor
 * - PATCH  /api/floors/{floorId}  → PATCH  backend floor
 * - DELETE /api/floors/{floorId}  → DELETE backend floor
 */

import { deleteFloor, updateFloor } from '@/lib/api/floors';
import type { UpdateFloorInput } from '@/features/floor-table-setup/types/floor-table';
import {
  floorsApiError,
  jsonError,
  jsonOk,
  requireAccessToken,
  resolveBranchId,
} from '@/lib/floors-api-route';

type RouteContext = Readonly<{ params: Promise<{ floorId: string }> }>;

function parseFloorId(raw: string): number | null {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** PATCH /api/floors/{floorId} */
export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAccessToken();
  if (auth.error) return auth.error;

  const { floorId: floorIdRaw } = await context.params;
  const floorId = parseFloorId(floorIdRaw);
  if (floorId == null) {
    return jsonError('Invalid floor id.', 400);
  }

  try {
    const body = (await request.json()) as UpdateFloorInput & { branch_id?: number };
    const scope = await resolveBranchId(body.branch_id);
    if (scope.error) return scope.error;

    const payload = { ...body };
    delete payload.branch_id;
    const data = await updateFloor(auth.token, scope.branchId, floorId, payload);
    return jsonOk(data);
  } catch (err) {
    return floorsApiError(err, 'Unable to update floor.');
  }
}

/** DELETE /api/floors/{floorId} */
export async function DELETE(request: Request, context: RouteContext) {
  const auth = await requireAccessToken();
  if (auth.error) return auth.error;

  const { floorId: floorIdRaw } = await context.params;
  const floorId = parseFloorId(floorIdRaw);
  if (floorId == null) {
    return jsonError('Invalid floor id.', 400);
  }

  const url = new URL(request.url);
  const branchRaw = url.searchParams.get('branch_id');
  const branchId = branchRaw ? Number(branchRaw) : undefined;

  const scope = await resolveBranchId(branchId);
  if (scope.error) return scope.error;

  try {
    await deleteFloor(auth.token, scope.branchId, floorId);
    return jsonOk({ ok: true });
  } catch (err) {
    return floorsApiError(err, 'Unable to delete floor.');
  }
}
