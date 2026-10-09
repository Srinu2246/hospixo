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

type BranchMenuAssignment = Readonly<{
  id: number | string;
  status?: string;
  is_active?: boolean;
}>;

export type BranchMenuItemOverride = Readonly<Record<string, unknown>>;

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

  // 1. Fetch overrides and trees across all assignments
  for (const assignment of targetAssignments) {
    try {
      const itemsPath = restaurantBranchMenuItemsListPath(branchId, assignment.id, {
        page_size: 100,
      });
      const itemsPayload = await apiFetch<unknown>(itemsPath, {
        ...withAuth(token),
        method: 'GET',
      });
      const { items } = normalizeListPayload<BranchMenuItemOverride>(itemsPayload);
      for (const item of items) {
        const record = item as Record<string, unknown>;
        const id = String(record.id ?? record.menu_item_id ?? record.item_override_id ?? '').trim();
        const nestedItem =
          record.menu_item && typeof record.menu_item === 'object'
            ? (record.menu_item as Record<string, unknown>)
            : null;
        const name = String(
          record.display_name ?? record.name ?? record.item_name ?? nestedItem?.name ?? '',
        )
          .trim()
          .toLowerCase();

        if ((id && !seenIds.has(id)) || (name && !seenNames.has(name))) {
          if (id) seenIds.add(id);
          if (name) seenNames.add(name);
          allOverrides.push(item);
        }
      }
    } catch {
      // Continue to next assignment
    }

    try {
      const treePath = restaurantBranchMenuTreePath(branchId, assignment.id);
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
      for (const cat of tree?.categories ?? []) {
        for (const treeItem of cat?.items ?? []) {
          const id = String(
            treeItem.id ?? treeItem.menu_item_id ?? treeItem.item_override_id ?? '',
          ).trim();
          const name = String(treeItem.name ?? treeItem.item_name ?? '')
            .trim()
            .toLowerCase();
          if ((id && !seenIds.has(id)) || (name && !seenNames.has(name))) {
            if (id) seenIds.add(id);
            if (name) seenNames.add(name);
            allOverrides.push({
              ...treeItem,
              category_name: treeItem.category_name ?? cat.name,
            });
          }
        }
      }
    } catch {
      // Continue
    }
  }

  // 2. Fetch master restaurant catalog items (/restaurant/items) to ensure catalog items like Mojito are in Dine-In
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
      const id = String(master.id ?? '').trim();
      const name = String(master.name ?? '')
        .trim()
        .toLowerCase();
      if (id && !seenIds.has(id) && (!name || !seenNames.has(name))) {
        if (id) seenIds.add(id);
        if (name) seenNames.add(name);
        allOverrides.push(master);
      }
    }
  } catch {
    // Continue
  }

  return allOverrides;
}
