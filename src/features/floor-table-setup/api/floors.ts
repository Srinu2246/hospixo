/**
 * Browser → platform BFF helpers for Floor & Table Set-up.
 * Never call BACKEND_API_URL from the client.
 */

import type {
  CreateFloorInput,
  CreateTableInput,
  FloorDto,
  FloorsListResponse,
  TableDto,
  TablesListResponse,
  UpdateFloorInput,
  UpdateTableInput,
} from '@/features/floor-table-setup/types/floor-table';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

async function readJson<T>(res: Response): Promise<T> {
  const payload = (await res.json().catch(() => null)) as
    ApiEnvelope<T> | { message?: string } | null;

  if (!res.ok) {
    const message =
      payload && typeof payload === 'object' && 'message' in payload && payload.message
        ? String(payload.message)
        : `Request failed (${res.status})`;
    throw new Error(message);
  }

  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return (payload as ApiEnvelope<T>).data;
  }

  return payload as T;
}

function qs(query?: Record<string, unknown>): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, String(value));
  }
  const s = params.toString();
  return s ? `?${s}` : '';
}

/** GET /api/floors */
export async function fetchFloors(query?: {
  branch_id?: number;
  status?: 'active' | 'inactive';
}): Promise<FloorsListResponse> {
  const res = await fetch(`/api/floors${qs(query)}`, {
    credentials: 'same-origin',
    cache: 'no-store',
  });
  return readJson<FloorsListResponse>(res);
}

/** POST /api/floors */
export async function createFloorRequest(
  body: CreateFloorInput & { branch_id?: number },
): Promise<FloorDto> {
  const res = await fetch('/api/floors', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return readJson<FloorDto>(res);
}

/** PATCH /api/floors/{floorId} */
export async function updateFloorRequest(
  floorId: number,
  body: UpdateFloorInput & { branch_id?: number },
): Promise<FloorDto> {
  const res = await fetch(`/api/floors/${floorId}`, {
    method: 'PATCH',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return readJson<FloorDto>(res);
}

/** DELETE /api/floors/{floorId} */
export async function deleteFloorRequest(
  floorId: number,
  query?: { branch_id?: number },
): Promise<void> {
  const res = await fetch(`/api/floors/${floorId}${qs(query)}`, {
    method: 'DELETE',
    credentials: 'same-origin',
  });
  await readJson<{ ok: true }>(res);
}

/** GET /api/floors/{floorId}/tables */
export async function fetchTables(
  floorId: number,
  query?: { branch_id?: number; status?: 'active' | 'inactive' },
): Promise<TablesListResponse> {
  const res = await fetch(`/api/floors/${floorId}/tables${qs(query)}`, {
    credentials: 'same-origin',
    cache: 'no-store',
  });
  return readJson<TablesListResponse>(res);
}

/** POST /api/floors/{floorId}/tables */
export async function createTableRequest(
  floorId: number,
  body: CreateTableInput & { branch_id?: number },
): Promise<TableDto> {
  const res = await fetch(`/api/floors/${floorId}/tables`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return readJson<TableDto>(res);
}

/** PATCH /api/floors/{floorId}/tables/{tableId} */
export async function updateTableRequest(
  floorId: number,
  tableId: number,
  body: UpdateTableInput & { branch_id?: number },
): Promise<TableDto> {
  const res = await fetch(`/api/floors/${floorId}/tables/${tableId}`, {
    method: 'PATCH',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return readJson<TableDto>(res);
}

/** DELETE /api/floors/{floorId}/tables/{tableId} */
export async function deleteTableRequest(
  floorId: number,
  tableId: number,
  query?: { branch_id?: number },
): Promise<void> {
  const res = await fetch(`/api/floors/${floorId}/tables/${tableId}${qs(query)}`, {
    method: 'DELETE',
    credentials: 'same-origin',
  });
  await readJson<{ ok: true }>(res);
}
