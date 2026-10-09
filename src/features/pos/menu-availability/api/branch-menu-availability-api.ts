import { clientApi } from '@/lib/client-api';
import { unwrapBffData } from '@/lib/bff-envelope';
import { resolveBranchMenuItemOverrideRoute } from '@/lib/menu-cache';
import { saveBranchItemOverride } from '@/features/menu/lib/menu-scope';
import type { BranchMenuAssignment, BranchMenuTree } from '@/features/menu/types/branch-menu';
import type { BranchMenuItemOverrideApi } from '@/features/menu/types/branch-menu-item-api';
import type { MenuCategory, MenuItem } from '@/features/pos/types/menu-availability';
import { mapLiveBranchMenuToCatalog } from '../lib/map-live-branch-menu';

export type BranchMenuAvailabilityResponse = {
  branchId: string;
  assignmentId: string | null;
  menuId: string | null;
  menuName: string | null;
  categories: MenuCategory[];
  items: MenuItem[];
  source: 'live' | 'fixture';
};

export async function fetchBranchMenuAvailability(
  branchId: string | number,
): Promise<BranchMenuAvailabilityResponse> {
  const branchIdStr = String(branchId);

  let assignments: BranchMenuAssignment[] = [];
  try {
    const rawAssignments = await clientApi.get<unknown>(
      `/menu/branches/${encodeURIComponent(branchIdStr)}/menus`,
    );
    const unwrapped = unwrapBffData<BranchMenuAssignment[] | { items: BranchMenuAssignment[] }>(
      rawAssignments,
    );
    assignments = Array.isArray(unwrapped) ? unwrapped : (unwrapped?.items ?? []);
  } catch {
    const catalog = mapLiveBranchMenuToCatalog({ branchId: branchIdStr });
    return {
      branchId: branchIdStr,
      assignmentId: null,
      menuId: null,
      menuName: null,
      categories: catalog.categories,
      items: catalog.items,
      source: 'fixture',
    };
  }

  const activeAssignments = assignments.filter(
    (a) => a.status?.toLowerCase() === 'active' || a.isDefault,
  );
  const targetAssignments = activeAssignments.length > 0 ? activeAssignments : assignments;
  const primaryAssignment = activeAssignments[0] ?? assignments[0];

  const allOverrides: BranchMenuItemOverrideApi[] = [];
  const allTrees: BranchMenuTree[] = [];
  let categoryCatalog: Array<{ id?: string | number; name?: string }> = [];
  let masterItems: Array<Record<string, unknown>> = [];

  try {
    // 1. Fetch categories and master items catalog concurrently
    const [categoriesRes, masterItemsRes] = await Promise.allSettled([
      clientApi.get<unknown>('/menu/categories'),
      clientApi.get<unknown>('/menu/items'),
    ]);

    if (categoriesRes.status === 'fulfilled') {
      const rawCats = unwrapBffData<
        | Array<{ id?: string | number; name?: string }>
        | { items: Array<{ id?: string | number; name?: string }> }
      >(categoriesRes.value);
      categoryCatalog = Array.isArray(rawCats) ? rawCats : (rawCats?.items ?? []);
    }

    if (masterItemsRes.status === 'fulfilled') {
      const rawItems = unwrapBffData<
        Array<Record<string, unknown>> | { items: Array<Record<string, unknown>> }
      >(masterItemsRes.value);
      masterItems = Array.isArray(rawItems) ? rawItems : (rawItems?.items ?? []);
    }

    // 2. Fetch overrides and trees across target assignments
    const assignmentPromises = targetAssignments.map(async (assignment) => {
      const aId = String(assignment.id);
      const [overridesRes, treeRes] = await Promise.allSettled([
        clientApi.get<unknown>(
          `/menu/branches/${encodeURIComponent(branchIdStr)}/menus/${encodeURIComponent(aId)}/items?page_size=100`,
        ),
        clientApi.get<unknown>(
          `/menu/branches/${encodeURIComponent(branchIdStr)}/menus/${encodeURIComponent(aId)}/tree`,
        ),
      ]);

      if (overridesRes.status === 'fulfilled') {
        const raw = unwrapBffData<
          BranchMenuItemOverrideApi[] | { items: BranchMenuItemOverrideApi[] }
        >(overridesRes.value);
        const list = Array.isArray(raw) ? raw : (raw?.items ?? []);
        allOverrides.push(...list);
      }

      if (treeRes.status === 'fulfilled') {
        const tree = unwrapBffData<BranchMenuTree>(treeRes.value);
        if (tree) allTrees.push(tree);
      }
    });

    await Promise.allSettled(assignmentPromises);
  } catch {
    // Graceful handling
  }

  const catalog = mapLiveBranchMenuToCatalog({
    trees: allTrees,
    tree: allTrees[0] ?? null,
    overrides: allOverrides,
    categoryCatalog,
    masterItems,
    branchId: branchIdStr,
  });

  return {
    branchId: branchIdStr,
    assignmentId: primaryAssignment ? String(primaryAssignment.id) : null,
    menuId: primaryAssignment?.menuId ? String(primaryAssignment.menuId) : null,
    menuName: primaryAssignment?.menuName ?? allTrees[0]?.menu?.name ?? null,
    categories: catalog.categories,
    items: catalog.items,
    source: catalog.source,
  };
}

export type UpdateMenuItemAvailabilityPayload = {
  branchId: string | number;
  assignmentId: string | number;
  itemOverrideId: string | number;
  isAvailable: boolean;
};

export async function updateBranchMenuItemAvailability(
  payload: UpdateMenuItemAvailabilityPayload,
): Promise<void> {
  const { branchId, assignmentId, itemOverrideId, isAvailable } = payload;
  const branchIdStr = String(branchId);
  const overrideIdStr = String(itemOverrideId);

  // 1. Persist locally first so UI is immediately accurate and never loses status
  saveBranchItemOverride(branchIdStr, overrideIdStr, {
    isAvailable,
    status: 'Available',
  });

  // 2. Attempt patch to backend
  try {
    await clientApi.patch(
      `/menu/branches/${encodeURIComponent(branchIdStr)}/menus/${encodeURIComponent(String(assignmentId))}/items/${encodeURIComponent(overrideIdStr)}`,
      {
        is_available: isAvailable,
        status: isAvailable ? 'active' : 'inactive',
      },
    );
  } catch {
    // If direct patch fails (e.g. overrideIdStr is a menuItemId without an override record yet),
    // attempt resolving the override route and retry
    try {
      const resolved = await resolveBranchMenuItemOverrideRoute(branchIdStr, overrideIdStr);
      if (resolved.ok) {
        await clientApi.patch(
          `/menu/branches/${encodeURIComponent(branchIdStr)}/menus/${encodeURIComponent(resolved.context.assignmentId)}/items/${encodeURIComponent(resolved.context.itemOverrideId)}`,
          {
            is_available: isAvailable,
            status: isAvailable ? 'active' : 'inactive',
          },
        );
      }
    } catch {
      // Local branch override is already saved
    }
  }
}

export async function batchUpdateBranchMenuItemAvailability(
  branchId: string | number,
  assignmentId: string | number,
  updates: Array<{ itemOverrideId: string | number; isAvailable: boolean }>,
): Promise<void> {
  await Promise.all(
    updates.map((update) =>
      updateBranchMenuItemAvailability({
        branchId,
        assignmentId,
        itemOverrideId: update.itemOverrideId,
        isAvailable: update.isAvailable,
      }),
    ),
  );
}
