/**
 * BFF: Single table on a floor
 * - PATCH  /api/floors/{floorId}/tables/{tableId}
 * - DELETE /api/floors/{floorId}/tables/{tableId}
 */

import { deleteTable, updateTable } from '@/lib/api/floors';
import type { UpdateTableInput } from '@/features/floor-table-setup/types/floor-table';
import {
  floorsApiError,
  jsonError,
  jsonOk,
  requireAccessToken,
  resolveBranchId,
} from '@/lib/floors-api-route';

type RouteContext = Readonly<{
  params: Promise<{ floorId: string; tableId: string }>;
}>;

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** PATCH /api/floors/{floorId}/tables/{tableId} */
export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAccessToken();
  if (auth.error) return auth.error;

  const { floorId: floorIdRaw, tableId: tableIdRaw } = await context.params;
  const floorId = parseId(floorIdRaw);
  const tableId = parseId(tableIdRaw);
  if (floorId == null || tableId == null) {
    return jsonError('Invalid floor or table id.', 400);
  }

  try {
    const body = (await request.json()) as UpdateTableInput & { branch_id?: number };
    const scope = await resolveBranchId(body.branch_id);
    if (scope.error) return scope.error;

    const payload = { ...body };
    delete payload.branch_id;
    const data = await updateTable(auth.token, scope.branchId, floorId, tableId, payload);
    return jsonOk(data);
  } catch (err) {
    return floorsApiError(err, 'Unable to update table.');
  }
}

/** DELETE /api/floors/{floorId}/tables/{tableId} */
export async function DELETE(request: Request, context: RouteContext) {
  const auth = await requireAccessToken();
  if (auth.error) return auth.error;

  const { floorId: floorIdRaw, tableId: tableIdRaw } = await context.params;
  const floorId = parseId(floorIdRaw);
  const tableId = parseId(tableIdRaw);
  if (floorId == null || tableId == null) {
    return jsonError('Invalid floor or table id.', 400);
  }

  const url = new URL(request.url);
  const branchRaw = url.searchParams.get('branch_id');
  const branchId = branchRaw ? Number(branchRaw) : undefined;

  const scope = await resolveBranchId(branchId);
  if (scope.error) return scope.error;

  try {
    await deleteTable(auth.token, scope.branchId, floorId, tableId);
    return jsonOk({ ok: true });
  } catch (err) {
    return floorsApiError(err, 'Unable to delete table.');
  }
}
