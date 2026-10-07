/**
 * Server-side Floors & Tables API client.
 * Called only from platform BFF routes — never from the browser.
 */

import { apiFetch } from '@/lib/api/http';
import { getServerApiBaseUrl } from '@/lib/api/config';
import {
  restaurantBranchFloorPath,
  restaurantBranchFloorTablePath,
  restaurantBranchFloorTablesListPath,
  restaurantBranchFloorTablesPath,
  restaurantBranchFloorsListPath,
  type RestaurantBranchFloorsListQuery,
  type RestaurantBranchTablesListQuery,
} from '@/lib/api/paths';
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

function withAuth(token: string) {
  return {
    baseUrl: getServerApiBaseUrl(),
    token,
  };
}

function normalizeListPayload<T>(payload: unknown): { items: T[]; total: number } {
  if (Array.isArray(payload)) {
    return { items: payload as T[], total: payload.length };
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.items)) {
      const total =
        typeof record.total === 'number'
          ? record.total
          : typeof record.count === 'number'
            ? record.count
            : record.items.length;
      return { items: record.items as T[], total };
    }
    if (Array.isArray(record.data)) {
      return { items: record.data as T[], total: record.data.length };
    }
  }

  return { items: [], total: 0 };
}

/** GET /api/v1/restaurant/branches/{branch_id}/floors */
export async function listFloors(
  token: string,
  branchId: number,
  query?: RestaurantBranchFloorsListQuery,
): Promise<FloorsListResponse> {
  const path = restaurantBranchFloorsListPath(branchId, query);
  const payload = await apiFetch<unknown>(path, { ...withAuth(token), method: 'GET' });
  const { items, total } = normalizeListPayload<FloorDto>(payload);
  return { items, total };
}

/** POST /api/v1/restaurant/branches/{branch_id}/floors */
export async function createFloor(
  token: string,
  branchId: number,
  body: CreateFloorInput,
): Promise<FloorDto> {
  const path = restaurantBranchFloorsListPath(branchId);
  return apiFetch<FloorDto>(path, { ...withAuth(token), method: 'POST', body });
}

/** GET /api/v1/restaurant/branches/{branch_id}/floors/{floor_id} */
export async function getFloor(
  token: string,
  branchId: number,
  floorId: number,
): Promise<FloorDto> {
  const path = restaurantBranchFloorPath(branchId, floorId);
  return apiFetch<FloorDto>(path, { ...withAuth(token), method: 'GET' });
}

/** PATCH /api/v1/restaurant/branches/{branch_id}/floors/{floor_id} */
export async function updateFloor(
  token: string,
  branchId: number,
  floorId: number,
  body: UpdateFloorInput,
): Promise<FloorDto> {
  const path = restaurantBranchFloorPath(branchId, floorId);
  return apiFetch<FloorDto>(path, { ...withAuth(token), method: 'PATCH', body });
}

/** DELETE /api/v1/restaurant/branches/{branch_id}/floors/{floor_id} */
export async function deleteFloor(token: string, branchId: number, floorId: number): Promise<void> {
  const path = restaurantBranchFloorPath(branchId, floorId);
  await apiFetch<void>(path, { ...withAuth(token), method: 'DELETE' });
}

/** GET /api/v1/restaurant/branches/{branch_id}/floors/{floor_id}/tables */
export async function listTables(
  token: string,
  branchId: number,
  floorId: number,
  query?: RestaurantBranchTablesListQuery,
): Promise<TablesListResponse> {
  const path = restaurantBranchFloorTablesListPath(branchId, floorId, query);
  const payload = await apiFetch<unknown>(path, { ...withAuth(token), method: 'GET' });
  const { items, total } = normalizeListPayload<TableDto>(payload);
  return { items, total };
}

/** POST /api/v1/restaurant/branches/{branch_id}/floors/{floor_id}/tables */
export async function createTable(
  token: string,
  branchId: number,
  floorId: number,
  body: CreateTableInput,
): Promise<TableDto> {
  const path = restaurantBranchFloorTablesPath(branchId, floorId);
  return apiFetch<TableDto>(path, { ...withAuth(token), method: 'POST', body });
}

/** PATCH /api/v1/restaurant/branches/{branch_id}/floors/{floor_id}/tables/{table_id} */
export async function updateTable(
  token: string,
  branchId: number,
  floorId: number,
  tableId: number,
  body: UpdateTableInput,
): Promise<TableDto> {
  const path = restaurantBranchFloorTablePath(branchId, floorId, tableId);
  return apiFetch<TableDto>(path, { ...withAuth(token), method: 'PATCH', body });
}

/** DELETE /api/v1/restaurant/branches/{branch_id}/floors/{floor_id}/tables/{table_id} */
export async function deleteTable(
  token: string,
  branchId: number,
  floorId: number,
  tableId: number,
): Promise<void> {
  const path = restaurantBranchFloorTablePath(branchId, floorId, tableId);
  await apiFetch<void>(path, { ...withAuth(token), method: 'DELETE' });
}
