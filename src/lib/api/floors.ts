import { apiFetch } from './http';
import { getServerApiBaseUrl } from './config';
import type {
  ApiDiningTable,
  ApiFloor,
  ApiFloorMap,
  ApiFloorSection,
  ApiTableCombination,
  ApiTableQr,
} from '@/types/floors';

type RequestOptions = Readonly<{
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH';
  body?: unknown;
}>;

function request<T>(token: string, path: string, options: RequestOptions = {}) {
  return apiFetch<T>(path, {
    baseUrl: getServerApiBaseUrl(),
    token,
    ...options,
  });
}

function floorPath(branchId: string | number, floorId?: string | number) {
  const path = `/api/v1/branches/${encodeURIComponent(String(branchId))}/floors`;
  return floorId == null ? path : `${path}/${encodeURIComponent(String(floorId))}`;
}

function sectionPath(
  branchId: string | number,
  floorId: string | number,
  sectionId?: string | number,
) {
  const path = `${floorPath(branchId, floorId)}/sections`;
  return sectionId == null ? path : `${path}/${encodeURIComponent(String(sectionId))}`;
}

function tablePath(
  branchId: string | number,
  floorId: string | number,
  sectionId: string | number,
  tableId?: string | number,
) {
  const path = `${sectionPath(branchId, floorId, sectionId)}/tables`;
  return tableId == null ? path : `${path}/${encodeURIComponent(String(tableId))}`;
}

function listPath<T>(data: unknown): { items: T[]; total: number } {
  if (Array.isArray(data)) return { items: data, total: data.length };
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    const items =
      (record.items as T[] | undefined) ??
      (record.floors as T[] | undefined) ??
      (record.sections as T[] | undefined) ??
      (record.tables as T[] | undefined) ??
      (record.combinations as T[] | undefined) ??
      [];
    return { items, total: typeof record.total === 'number' ? record.total : items.length };
  }
  return { items: [], total: 0 };
}

export async function listFloors(token: string, branchId: string | number) {
  const data = await request<unknown>(token, floorPath(branchId));
  return listPath<ApiFloor>(data);
}

export async function getFloor(token: string, branchId: string | number, floorId: string | number) {
  return request<ApiFloor>(token, floorPath(branchId, floorId));
}

export async function createFloor(token: string, branchId: string | number, body: unknown) {
  return request<ApiFloor>(token, floorPath(branchId), { method: 'POST', body });
}

export async function updateFloor(
  token: string,
  branchId: string | number,
  floorId: string | number,
  body: unknown,
) {
  return request<ApiFloor>(token, floorPath(branchId, floorId), { method: 'PATCH', body });
}

export async function archiveFloor(
  token: string,
  branchId: string | number,
  floorId: string | number,
  body: unknown,
) {
  return request<ApiFloor>(token, `${floorPath(branchId, floorId)}/archive`, {
    method: 'POST',
    body,
  });
}

export async function restoreFloor(
  token: string,
  branchId: string | number,
  floorId: string | number,
  body: unknown,
) {
  return request<ApiFloor>(token, `${floorPath(branchId, floorId)}/restore`, {
    method: 'POST',
    body,
  });
}

export async function reorderFloors(token: string, branchId: string | number, body: unknown) {
  return request<unknown>(token, `${floorPath(branchId)}/reorder`, { method: 'PUT', body });
}

export async function listSections(
  token: string,
  branchId: string | number,
  floorId: string | number,
) {
  const data = await request<unknown>(token, sectionPath(branchId, floorId));
  return listPath<ApiFloorSection>(data);
}

export async function createSection(
  token: string,
  branchId: string | number,
  floorId: string | number,
  body: unknown,
) {
  return request<ApiFloorSection>(token, sectionPath(branchId, floorId), { method: 'POST', body });
}

export async function updateSection(
  token: string,
  branchId: string | number,
  floorId: string | number,
  sectionId: string | number,
  body: unknown,
) {
  return request<ApiFloorSection>(token, sectionPath(branchId, floorId, sectionId), {
    method: 'PATCH',
    body,
  });
}

export async function archiveSection(
  token: string,
  branchId: string | number,
  floorId: string | number,
  sectionId: string | number,
  body: unknown,
) {
  return request<ApiFloorSection>(token, `${sectionPath(branchId, floorId, sectionId)}/archive`, {
    method: 'POST',
    body,
  });
}

export async function restoreSection(
  token: string,
  branchId: string | number,
  floorId: string | number,
  sectionId: string | number,
  body: unknown,
) {
  return request<ApiFloorSection>(token, `${sectionPath(branchId, floorId, sectionId)}/restore`, {
    method: 'POST',
    body,
  });
}

const SECTION_TABLES_PAGE_SIZE = 100;
const SECTION_TABLES_MAX_PAGES = 50;

export async function listSectionTables(
  token: string,
  branchId: string | number,
  floorId: string | number,
  sectionId: string | number,
) {
  const base = tablePath(branchId, floorId, sectionId);
  const allItems: ApiDiningTable[] = [];
  const seenIds = new Set<string>();

  for (let page = 1; page <= SECTION_TABLES_MAX_PAGES; page += 1) {
    const query = `?page=${page}&page_size=${SECTION_TABLES_PAGE_SIZE}`;
    const data = await request<unknown>(token, `${base}${query}`);
    const batch = listPath<ApiDiningTable>(data);
    if (batch.items.length === 0) break;

    let added = 0;
    for (const table of batch.items) {
      const id = String(table.id ?? '');
      if (id && seenIds.has(id)) continue;
      if (id) seenIds.add(id);
      allItems.push(table);
      added += 1;
    }

    if (added === 0) break;
  }

  return { items: allItems, total: allItems.length };
}

export async function getTable(
  token: string,
  branchId: string | number,
  floorId: string | number,
  sectionId: string | number,
  tableId: string | number,
) {
  return request<ApiDiningTable>(token, tablePath(branchId, floorId, sectionId, tableId));
}

export async function createTable(
  token: string,
  branchId: string | number,
  floorId: string | number,
  sectionId: string | number,
  body: unknown,
) {
  return request<ApiDiningTable>(token, tablePath(branchId, floorId, sectionId), {
    method: 'POST',
    body,
  });
}

export async function bulkCreateTables(
  token: string,
  branchId: string | number,
  floorId: string | number,
  sectionId: string | number,
  body: unknown,
) {
  const data = await request<unknown>(token, `${tablePath(branchId, floorId, sectionId)}/bulk`, {
    method: 'POST',
    body,
  });
  return listPath<ApiDiningTable>(data);
}

export async function bulkUpdateTables(
  token: string,
  branchId: string | number,
  floorId: string | number,
  sectionId: string | number,
  body: unknown,
) {
  const data = await request<unknown>(token, `${tablePath(branchId, floorId, sectionId)}/bulk`, {
    method: 'PATCH',
    body,
  });
  return listPath<ApiDiningTable>(data);
}

export async function updateTable(
  token: string,
  branchId: string | number,
  floorId: string | number,
  sectionId: string | number,
  tableId: string | number,
  body: unknown,
) {
  return request<ApiDiningTable>(token, tablePath(branchId, floorId, sectionId, tableId), {
    method: 'PATCH',
    body,
  });
}

export async function moveTable(
  token: string,
  branchId: string | number,
  floorId: string | number,
  sectionId: string | number,
  tableId: string | number,
  body: unknown,
) {
  return request<ApiDiningTable>(
    token,
    `${tablePath(branchId, floorId, sectionId, tableId)}/move`,
    {
      method: 'POST',
      body,
    },
  );
}

export async function archiveTable(
  token: string,
  branchId: string | number,
  floorId: string | number,
  sectionId: string | number,
  tableId: string | number,
  body: unknown,
) {
  return request<ApiDiningTable>(
    token,
    `${tablePath(branchId, floorId, sectionId, tableId)}/archive`,
    {
      method: 'POST',
      body,
    },
  );
}

export async function restoreTable(
  token: string,
  branchId: string | number,
  floorId: string | number,
  sectionId: string | number,
  tableId: string | number,
  body: unknown,
) {
  return request<ApiDiningTable>(
    token,
    `${tablePath(branchId, floorId, sectionId, tableId)}/restore`,
    {
      method: 'POST',
      body,
    },
  );
}

export async function rotateTableQr(
  token: string,
  branchId: string | number,
  floorId: string | number,
  sectionId: string | number,
  tableId: string | number,
) {
  return request<ApiTableQr>(
    token,
    `${tablePath(branchId, floorId, sectionId, tableId)}/qr/rotate`,
    {
      method: 'POST',
    },
  );
}

export async function reorderTables(
  token: string,
  branchId: string | number,
  floorId: string | number,
  sectionId: string | number,
  body: unknown,
) {
  const data = await request<unknown>(token, `${tablePath(branchId, floorId, sectionId)}/reorder`, {
    method: 'PUT',
    body,
  });
  return listPath<ApiDiningTable>(data);
}

export async function getFloorMap(
  token: string,
  branchId: string | number,
  floorId: string | number,
  sectionId: string | number,
) {
  return request<ApiFloorMap>(token, `${sectionPath(branchId, floorId, sectionId)}/floor-map`);
}

export async function combineTables(
  token: string,
  branchId: string | number,
  floorId: string | number,
  sectionId: string | number,
  body: unknown,
) {
  return request<ApiTableCombination>(
    token,
    `${sectionPath(branchId, floorId, sectionId)}/table-combinations`,
    { method: 'POST', body },
  );
}

export async function listTableCombinations(
  token: string,
  branchId: string | number,
  floorId: string | number,
  sectionId: string | number,
) {
  const data = await request<unknown>(
    token,
    `${sectionPath(branchId, floorId, sectionId)}/table-combinations`,
  );
  return listPath<ApiTableCombination>(data);
}

export async function splitTableCombination(
  token: string,
  branchId: string | number,
  floorId: string | number,
  sectionId: string | number,
  combinationId: string | number,
) {
  return request<ApiTableCombination>(
    token,
    `${sectionPath(branchId, floorId, sectionId)}/table-combinations/${encodeURIComponent(String(combinationId))}/split`,
    { method: 'POST' },
  );
}
