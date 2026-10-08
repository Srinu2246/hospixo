/**
 * BFF: Tables on a floor
 * - GET  /api/floors/{floorId}/tables  → list tables
 * - POST /api/floors/{floorId}/tables  → create table
 */

import { createTable, listTables } from '@/lib/api/floors';
import type { CreateTableInput } from '@/features/floor-table-setup/types/floor-table';
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

function parseBranchId(url: URL): number | undefined {
  const raw = url.searchParams.get('branch_id');
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

/** GET /api/floors/{floorId}/tables */
export async function GET(request: Request, context: RouteContext) {
  const auth = await requireAccessToken();
  if (auth.error) return auth.error;

  const { floorId: floorIdRaw } = await context.params;
  const floorId = parseFloorId(floorIdRaw);
  if (floorId == null) {
    return jsonError('Invalid floor id.', 400);
  }

  const url = new URL(request.url);
  const scope = await resolveBranchId(parseBranchId(url));
  if (scope.error) return scope.error;

  const status = url.searchParams.get('status');
  const query = status === 'active' || status === 'inactive' ? ({ status } as const) : undefined;

  try {
    const data = await listTables(auth.token, scope.branchId, floorId, query);
    return jsonOk(data);
  } catch (err) {
    return floorsApiError(err, 'Unable to load tables.');
  }
}

/** POST /api/floors/{floorId}/tables */
export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAccessToken();
  if (auth.error) return auth.error;

  const { floorId: floorIdRaw } = await context.params;
  const floorId = parseFloorId(floorIdRaw);
  if (floorId == null) {
    return jsonError('Invalid floor id.', 400);
  }

  try {
    const body = (await request.json()) as CreateTableInput & { branch_id?: number };
    const scope = await resolveBranchId(body.branch_id);
    if (scope.error) return scope.error;

    const payload = { ...body };
    delete payload.branch_id;
    const data = await createTable(auth.token, scope.branchId, floorId, payload);
    return jsonOk(data, { status: 201 });
  } catch (err) {
    return floorsApiError(err, 'Unable to create table.');
  }
}
