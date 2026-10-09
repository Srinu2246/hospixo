import 'server-only';

import { apiFetch } from '@/lib/api/http';
import { getServerApiBaseUrl } from '@/lib/api/config';
import {
  apiPaths,
  restaurantBranchMenuItemsListPath,
  restaurantBranchMenuTreePath,
  restaurantBranchMenusListPath,
} from '@/lib/api/paths';

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
      let total = record.items.length;
      if (typeof record.total === 'number') {
        total = record.total;
      } else if (typeof record.count === 'number') {
        total = record.count;
      }
      return { items: record.items as T[], total };
    }
    if (Array.isArray(record.data)) {
      return { items: record.data as T[], total: record.data.length };
    }
  }
  return { items: [], total: 0 };
}

type BranchMenuAssignment = Readonly<{
  id: number | string;
  status?: string;
  is_active?: boolean;
}>;

export type BranchMenuItemOverride = Readonly<Record<string, unknown>>;

function toSafeString(val: unknown): string {
  if (typeof val === 'string' || typeof val === 'number') {
    return String(val).trim();
  }
  return '';
}

function addDeduplicated(
  item: BranchMenuItemOverride,
  allOverrides: BranchMenuItemOverride[],
  seenIds: Set<string>,
  seenNames: Set<string>,
  id: string,
  name: string,
): void {
  if ((id && !seenIds.has(id)) || (name && !seenNames.has(name))) {
    if (id) seenIds.add(id);
    if (name) seenNames.add(name);
    allOverrides.push(item);
  }
}

async function fetchAssignmentItems(
  token: string,
  branchId: number,
  assignmentId: number | string,
): Promise<BranchMenuItemOverride[]> {
  try {
    const itemsPath = restaurantBranchMenuItemsListPath(branchId, assignmentId, {
      page_size: 100,
    });
    const itemsPayload = await apiFetch<unknown>(itemsPath, {
      ...withAuth(token),
      method: 'GET',
    });
    return normalizeListPayload<BranchMenuItemOverride>(itemsPayload).items;
  } catch {
    return [];
  }
}

async function fetchAssignmentTreeItems(
  token: string,
  branchId: number,
  assignmentId: number | string,
): Promise<BranchMenuItemOverride[]> {
  try {
    const treePath = restaurantBranchMenuTreePath(branchId, assignmentId);
    const treePayload = await apiFetch<unknown>(treePath, { ...withAuth(token), method: 'GET' });
    const tree =
      (
        treePayload as {
          data?: {
            categories?: Array<{ name?: string; items?: Array<Record<string, unknown>> }>;
          };
        }
      )?.data ??
      (treePayload as {
        categories?: Array<{ name?: string; items?: Array<Record<string, unknown>> }>;
      });
    const extracted: BranchMenuItemOverride[] = [];
    for (const cat of tree?.categories ?? []) {
      for (const treeItem of cat?.items ?? []) {
        extracted.push({
          ...treeItem,
          category_name: treeItem.category_name ?? cat.name,
        });
      }
    }
    return extracted;
  } catch {
    return [];
  }
}

/** Active menu assignment for a branch, if any. */
export async function getActiveBranchMenuAssignmentId(
  token: string,
  branchId: number,
): Promise<number | string | null> {
  const path = restaurantBranchMenusListPath(branchId, { status: 'active' });
  const payload = await apiFetch<unknown>(path, { ...withAuth(token), method: 'GET' });
  const { items } = normalizeListPayload<BranchMenuAssignment>(payload);
  const active =
    items.find((item) => item.status === 'active' || item.is_active === true) ?? items[0];
  return active?.id ?? null;
}

/** Menu item overrides for branch POS dine-in across all branch assignments and catalog. */
export async function listBranchMenuItems(
  token: string,
  branchId: number,
): Promise<readonly BranchMenuItemOverride[]> {
  const menusPath = restaurantBranchMenusListPath(branchId);
  let assignments: BranchMenuAssignment[] = [];
  try {
    const menusPayload = await apiFetch<unknown>(menusPath, { ...withAuth(token), method: 'GET' });
    const normalized = normalizeListPayload<BranchMenuAssignment>(menusPayload);
    assignments = normalized.items;
  } catch {
    assignments = [];
  }

  const activeAssignments = assignments.filter(
    (a) => a.status === 'active' || a.is_active === true,
  );
  const targetAssignments = activeAssignments.length > 0 ? activeAssignments : assignments;

  const allOverrides: BranchMenuItemOverride[] = [];
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();

  // 1. Fetch overrides and trees across all assignments in parallel
  const assignmentData = await Promise.all(
    targetAssignments.map(async (assignment) => {
      const [items, treeItems] = await Promise.all([
        fetchAssignmentItems(token, branchId, assignment.id),
        fetchAssignmentTreeItems(token, branchId, assignment.id),
      ]);
      return { items, treeItems };
    }),
  );

  for (const { items, treeItems } of assignmentData) {
    for (const item of items) {
      const record = item as Record<string, unknown>;
      const id = toSafeString(record.id ?? record.menu_item_id ?? record.item_override_id);
      const nestedItem =
        record.menu_item && typeof record.menu_item === 'object'
          ? (record.menu_item as Record<string, unknown>)
          : null;
      const name = toSafeString(
        record.display_name ?? record.name ?? record.item_name ?? nestedItem?.name,
      ).toLowerCase();
      addDeduplicated(item, allOverrides, seenIds, seenNames, id, name);
    }

    for (const treeItem of treeItems) {
      const id = toSafeString(treeItem.id ?? treeItem.menu_item_id ?? treeItem.item_override_id);
      const name = toSafeString(treeItem.name ?? treeItem.item_name).toLowerCase();
      addDeduplicated(treeItem, allOverrides, seenIds, seenNames, id, name);
    }
  }

  // 2. Fetch master restaurant catalog items (/restaurant/menu/items) to ensure catalog items like Mojito are in Dine-In
  try {
    const catalogPayload = await apiFetch<unknown>(apiPaths.restaurant.menuItems, {
      ...withAuth(token),
      method: 'GET',
    });
    const { items: masterItems } = normalizeListPayload<Record<string, unknown>>(catalogPayload);
    for (const master of masterItems) {
      if (
        master.scope === 'branch' &&
        master.assign_branch_id != null &&
        Number(master.assign_branch_id) !== branchId
      ) {
        continue;
      }
      const id = toSafeString(master.id);
      const name = toSafeString(master.name).toLowerCase();
      if (id && !seenIds.has(id) && (!name || !seenNames.has(name))) {
        seenIds.add(id);
        if (name) seenNames.add(name);
        allOverrides.push(master);
      }
    }
  } catch {
    // Continue
  }

  return allOverrides;
}
