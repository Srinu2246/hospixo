/**
 * BFF: Branch tables overview (operational floor map)
 * GET /api/pos/branch-tables → aggregates floors + tables for branch POS
 */

import { getBranchTablesOverview } from '@/features/pos/api/branch-tables.server';
import {
  floorsApiError,
  jsonOk,
  requireAccessToken,
  resolveBranchId,
} from '@/lib/floors-api-route';

function parseFloorId(url: URL): number | null {
  const raw = url.searchParams.get('floor_id');
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function GET(request: Request) {
  const auth = await requireAccessToken();
  if (auth.error) return auth.error;

  const url = new URL(request.url);
  const scope = await resolveBranchId(undefined);
  if (scope.error) return scope.error;

  const floorId = parseFloorId(url);

  try {
    const data = await getBranchTablesOverview({
      token: auth.token,
      branchId: scope.branchId,
      floorId,
    });
    return jsonOk(data);
  } catch (err) {
    return floorsApiError(err, 'Unable to load branch tables.');
  }
}
