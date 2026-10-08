/**
 * Centralized backend client for Menu domain:
 * - Categories
 * - Items, Variants, Images, Tags
 * - Menus & Tree Assignments
 * - GST Rates
 * - Modifier Groups & Options
 * - Preparation Stations
 * - Branch Menu Assignments
 */

import { apiFetch } from '@/lib/api/http';
import { getServerApiBaseUrl } from '@/lib/api/config';
import {
  apiPaths,
  restaurantGstRatePath,
  restaurantGstRatesListPath,
  restaurantGstRatesPath,
  restaurantMenuCategoryActivatePath,
  restaurantMenuCategoryDeactivatePath,
  restaurantMenuCategoryPath,
  restaurantMenuItemActivatePath,
  restaurantMenuItemDeactivatePath,
  restaurantMenuItemPath,
  restaurantMenuItemsListPath,
  restaurantMenuItemImageActivatePath,
  restaurantMenuItemImageDeactivatePath,
  restaurantMenuItemImagePath,
  restaurantMenuItemImagesListPath,
  restaurantMenuItemImagesPath,
  restaurantMenuItemImageUploadUrlPath,
  restaurantMenuItemTagPath,
  restaurantMenuItemTagsListPath,
  restaurantMenuItemTagsPath,
  restaurantMenuItemVariantActivatePath,
  restaurantMenuItemVariantDeactivatePath,
  restaurantMenuItemVariantPath,
  restaurantMenuItemVariantsListPath,
  restaurantMenuItemVariantsPath,
  restaurantMenuActivatePath,
  restaurantMenuCategoryAssignmentPath,
  restaurantMenuCategoryAssignmentsPath,
  restaurantMenuDeactivatePath,
  restaurantMenuPath,
  restaurantMenusListPath,
  restaurantMenusPath,
  restaurantMenuTreePath,
  restaurantModifierGroupOptionPath,
  restaurantModifierGroupOptionsListPath,
  restaurantModifierGroupOptionsPath,
  restaurantModifierGroupPath,
  restaurantModifierGroupsListPath,
  restaurantModifierGroupsPath,
  restaurantPreparationStationPath,
  restaurantPreparationStationsListPath,
  restaurantPreparationStationsPath,
} from '@/lib/api/paths';

function authOptions(
  token: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  body?: unknown,
) {
  return {
    baseUrl: getServerApiBaseUrl(),
    token,
    method,
    body,
  };
}

// -----------------------------------------------------------------------------
// GST Rates
// -----------------------------------------------------------------------------

export async function listBackendGstRates(
  token: string,
  query?: { code?: string; active_only?: boolean },
) {
  const path = restaurantGstRatesListPath(query);
  return apiFetch<unknown>(path, authOptions(token, 'GET'));
}

export async function getBackendGstRateById(token: string, id: string | number) {
  return apiFetch<unknown>(restaurantGstRatePath(id), authOptions(token, 'GET'));
}

export const DEFAULT_GST_RATE_SEEDS = [
  {
    code: 'GST_0',
    name: 'GST 0%',
    cgst_rate: 0,
    sgst_rate: 0,
    igst_rate: 0,
    total_rate: 0,
    effective_from: '2024-01-01T00:00:00.000Z',
  },
  {
    code: 'GST_5',
    name: 'GST 5%',
    cgst_rate: 2.5,
    sgst_rate: 2.5,
    igst_rate: 5,
    total_rate: 5,
    effective_from: '2024-01-01T00:00:00.000Z',
  },
  {
    code: 'GST_12',
    name: 'GST 12%',
    cgst_rate: 6,
    sgst_rate: 6,
    igst_rate: 12,
    total_rate: 12,
    effective_from: '2024-01-01T00:00:00.000Z',
  },
  {
    code: 'GST_18',
    name: 'GST 18%',
    cgst_rate: 9,
    sgst_rate: 9,
    igst_rate: 18,
    total_rate: 18,
    effective_from: '2024-01-01T00:00:00.000Z',
  },
  {
    code: 'GST_28',
    name: 'GST 28%',
    cgst_rate: 14,
    sgst_rate: 14,
    igst_rate: 28,
    total_rate: 28,
    effective_from: '2024-01-01T00:00:00.000Z',
  },
] as const;

export async function createBackendGstRate(token: string, body: unknown) {
  return apiFetch<unknown>(restaurantGstRatesPath(), authOptions(token, 'POST', body));
}

function unwrapApiList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (typeof data === 'object' && data !== null) {
    if ('items' in data && Array.isArray((data as { items: unknown[] }).items)) {
      return (data as { items: unknown[] }).items;
    }
    if ('data' in data && Array.isArray((data as { data: unknown[] }).data)) {
      return (data as { data: unknown[] }).data;
    }
  }
  return [];
}

export async function ensureBackendGstRates(token: string): Promise<unknown[]> {
  try {
    const existing = await listBackendGstRates(token);
    const list = unwrapApiList(existing);
    if (list.length > 0) return list;

    await Promise.all(
      DEFAULT_GST_RATE_SEEDS.map((seed) =>
        createBackendGstRate(token, seed).catch(() => {
          // ignore seed conflict
        }),
      ),
    );

    const refreshed = await listBackendGstRates(token);
    return unwrapApiList(refreshed);
  } catch {
    return [];
  }
}

// -----------------------------------------------------------------------------
// Modifier Groups
// -----------------------------------------------------------------------------

export async function listBackendModifierGroups(
  token: string,
  query?: { status?: 'active' | 'inactive' },
) {
  const path = restaurantModifierGroupsListPath(query);
  return apiFetch<unknown>(path, authOptions(token, 'GET'));
}

export async function getBackendModifierGroupById(token: string, id: string | number) {
  return apiFetch<unknown>(restaurantModifierGroupPath(id), authOptions(token, 'GET'));
}

export async function createBackendModifierGroup(token: string, body: unknown) {
  return apiFetch<unknown>(restaurantModifierGroupsPath(), authOptions(token, 'POST', body));
}

export async function updateBackendModifierGroupById(
  token: string,
  id: string | number,
  body: unknown,
) {
  return apiFetch<unknown>(restaurantModifierGroupPath(id), authOptions(token, 'PATCH', body));
}

export async function listBackendModifierOptions(
  token: string,
  groupId: string | number,
  query?: { status?: 'active' | 'inactive' },
) {
  const path = restaurantModifierGroupOptionsListPath(groupId, query);
  return apiFetch<unknown>(path, authOptions(token, 'GET'));
}

export async function createBackendModifierOption(
  token: string,
  groupId: string | number,
  body: unknown,
) {
  return apiFetch<unknown>(
    restaurantModifierGroupOptionsPath(groupId),
    authOptions(token, 'POST', body),
  );
}

export async function updateBackendModifierOptionById(
  token: string,
  groupId: string | number,
  optionId: string | number,
  body: unknown,
) {
  return apiFetch<unknown>(
    restaurantModifierGroupOptionPath(groupId, optionId),
    authOptions(token, 'PATCH', body),
  );
}

// -----------------------------------------------------------------------------
// Preparation Stations
// -----------------------------------------------------------------------------

export async function listBackendPreparationStations(
  token: string,
  query?: { status?: 'active' | 'inactive' },
) {
  const path = restaurantPreparationStationsListPath(query);
  return apiFetch<unknown>(path, authOptions(token, 'GET'));
}

export async function getBackendPreparationStationById(token: string, id: string | number) {
  return apiFetch<unknown>(restaurantPreparationStationPath(id), authOptions(token, 'GET'));
}

export async function createBackendPreparationStation(token: string, body: unknown) {
  return apiFetch<unknown>(restaurantPreparationStationsPath(), authOptions(token, 'POST', body));
}

export async function updateBackendPreparationStationById(
  token: string,
  id: string | number,
  body: unknown,
) {
  return apiFetch<unknown>(restaurantPreparationStationPath(id), authOptions(token, 'PATCH', body));
}

// -----------------------------------------------------------------------------
// Menu Categories
// -----------------------------------------------------------------------------

export async function listBackendMenuCategories(token: string) {
  return apiFetch<unknown>(apiPaths.restaurant.menuCategories, authOptions(token, 'GET'));
}

export async function getBackendMenuCategory(token: string, id: string | number) {
  return apiFetch<unknown>(restaurantMenuCategoryPath(id), authOptions(token, 'GET'));
}

export async function createBackendMenuCategory(token: string, body: unknown) {
  return apiFetch<unknown>(apiPaths.restaurant.menuCategories, authOptions(token, 'POST', body));
}

export async function updateBackendMenuCategory(token: string, id: string | number, body: unknown) {
  return apiFetch<unknown>(restaurantMenuCategoryPath(id), authOptions(token, 'PATCH', body));
}

export const DEFAULT_CATEGORY_SEEDS = [
  { name: 'Main Course', description: 'Main course dishes', scope: 'company' },
  { name: 'Starters', description: 'Appetizers and starters', scope: 'company' },
  { name: 'Breads', description: 'Indian breads and rotis', scope: 'company' },
  { name: 'Rice', description: 'Rice and biryanis', scope: 'company' },
  { name: 'Beverages', description: 'Drinks and beverages', scope: 'company' },
] as const;

export async function ensureBackendMenuCategories(token: string): Promise<unknown[]> {
  try {
    const existing = await listBackendMenuCategories(token);
    const list = unwrapApiList(existing);
    if (list.length > 0) return list;

    await Promise.all(
      DEFAULT_CATEGORY_SEEDS.map((seed) =>
        createBackendMenuCategory(token, seed)
          .catch(() => createBackendMenuCategory(token, { name: seed.name }))
          .catch(() => {
            // continue
          }),
      ),
    );

    const refreshed = await listBackendMenuCategories(token);
    return unwrapApiList(refreshed);
  } catch {
    return [];
  }
}

export async function activateBackendMenuCategory(token: string, id: string | number) {
  return apiFetch<unknown>(restaurantMenuCategoryActivatePath(id), authOptions(token, 'POST'));
}

export async function deactivateBackendMenuCategory(token: string, id: string | number) {
  return apiFetch<unknown>(restaurantMenuCategoryDeactivatePath(id), authOptions(token, 'POST'));
}

// -----------------------------------------------------------------------------
// Menu Items
// -----------------------------------------------------------------------------

export async function listBackendMenuItems(
  token: string,
  query?: {
    status?: 'active' | 'inactive';
    category_id?: number;
    dietary_type?: 'veg' | 'non_veg' | 'egg' | 'vegan';
  },
) {
  const path = restaurantMenuItemsListPath(query);
  return apiFetch<unknown>(path, authOptions(token, 'GET'));
}

export async function getBackendMenuItem(token: string, id: string | number) {
  return apiFetch<unknown>(restaurantMenuItemPath(id), authOptions(token, 'GET'));
}

export async function createBackendMenuItem(token: string, body: unknown) {
  return apiFetch<unknown>(apiPaths.restaurant.menuItems, authOptions(token, 'POST', body));
}

export async function updateBackendMenuItem(token: string, id: string | number, body: unknown) {
  return apiFetch<unknown>(restaurantMenuItemPath(id), authOptions(token, 'PATCH', body));
}

export async function activateBackendMenuItem(token: string, id: string | number) {
  return apiFetch<unknown>(restaurantMenuItemActivatePath(id), authOptions(token, 'POST'));
}

export async function deactivateBackendMenuItem(token: string, id: string | number) {
  return apiFetch<unknown>(restaurantMenuItemDeactivatePath(id), authOptions(token, 'POST'));
}

// -----------------------------------------------------------------------------
// Menu Item Variants
// -----------------------------------------------------------------------------

export async function listBackendMenuItemVariants(
  token: string,
  itemId: string | number,
  query?: { status?: 'active' | 'inactive' },
) {
  const path = restaurantMenuItemVariantsListPath(itemId, query);
  return apiFetch<unknown>(path, authOptions(token, 'GET'));
}

export async function getBackendMenuItemVariant(
  token: string,
  itemId: string | number,
  variantId: string | number,
) {
  return apiFetch<unknown>(
    restaurantMenuItemVariantPath(itemId, variantId),
    authOptions(token, 'GET'),
  );
}

export async function createBackendMenuItemVariant(
  token: string,
  itemId: string | number,
  body: unknown,
) {
  return apiFetch<unknown>(
    restaurantMenuItemVariantsPath(itemId),
    authOptions(token, 'POST', body),
  );
}

export async function updateBackendMenuItemVariant(
  token: string,
  itemId: string | number,
  variantId: string | number,
  body: unknown,
) {
  return apiFetch<unknown>(
    restaurantMenuItemVariantPath(itemId, variantId),
    authOptions(token, 'PATCH', body),
  );
}

export async function activateBackendMenuItemVariant(
  token: string,
  itemId: string | number,
  variantId: string | number,
) {
  return apiFetch<unknown>(
    restaurantMenuItemVariantActivatePath(itemId, variantId),
    authOptions(token, 'POST'),
  );
}

export async function deactivateBackendMenuItemVariant(
  token: string,
  itemId: string | number,
  variantId: string | number,
) {
  return apiFetch<unknown>(
    restaurantMenuItemVariantDeactivatePath(itemId, variantId),
    authOptions(token, 'POST'),
  );
}

// -----------------------------------------------------------------------------
// Menu Item Images
// -----------------------------------------------------------------------------

export async function listBackendMenuItemImages(
  token: string,
  itemId: string | number,
  query?: { status?: 'active' | 'inactive' },
) {
  const path = restaurantMenuItemImagesListPath(itemId, query);
  return apiFetch<unknown>(path, authOptions(token, 'GET'));
}

export async function getBackendMenuItemImage(
  token: string,
  itemId: string | number,
  imageId: string | number,
) {
  return apiFetch<unknown>(restaurantMenuItemImagePath(itemId, imageId), authOptions(token, 'GET'));
}

export async function createBackendMenuItemImageUploadUrl(
  token: string,
  itemId: string | number,
  body: unknown,
) {
  return apiFetch<unknown>(
    restaurantMenuItemImageUploadUrlPath(itemId),
    authOptions(token, 'POST', body),
  );
}

export async function createBackendMenuItemImage(
  token: string,
  itemId: string | number,
  body: unknown,
) {
  return apiFetch<unknown>(restaurantMenuItemImagesPath(itemId), authOptions(token, 'POST', body));
}

export async function updateBackendMenuItemImage(
  token: string,
  itemId: string | number,
  imageId: string | number,
  body: unknown,
) {
  return apiFetch<unknown>(
    restaurantMenuItemImagePath(itemId, imageId),
    authOptions(token, 'PATCH', body),
  );
}

export async function activateBackendMenuItemImage(
  token: string,
  itemId: string | number,
  imageId: string | number,
) {
  return apiFetch<unknown>(
    restaurantMenuItemImageActivatePath(itemId, imageId),
    authOptions(token, 'POST'),
  );
}

export async function deactivateBackendMenuItemImage(
  token: string,
  itemId: string | number,
  imageId: string | number,
) {
  return apiFetch<unknown>(
    restaurantMenuItemImageDeactivatePath(itemId, imageId),
    authOptions(token, 'POST'),
  );
}

// -----------------------------------------------------------------------------
// Menu Item Tags
// -----------------------------------------------------------------------------

export async function listBackendMenuItemTags(
  token: string,
  query?: { status?: 'active' | 'inactive' },
) {
  const path = restaurantMenuItemTagsListPath(query);
  return apiFetch<unknown>(path, authOptions(token, 'GET'));
}

export async function getBackendMenuItemTag(token: string, tagId: string | number) {
  return apiFetch<unknown>(restaurantMenuItemTagPath(tagId), authOptions(token, 'GET'));
}

export async function createBackendMenuItemTag(token: string, body: unknown) {
  return apiFetch<unknown>(restaurantMenuItemTagsPath(), authOptions(token, 'POST', body));
}

export async function updateBackendMenuItemTag(
  token: string,
  tagId: string | number,
  body: unknown,
) {
  return apiFetch<unknown>(restaurantMenuItemTagPath(tagId), authOptions(token, 'PATCH', body));
}

// -----------------------------------------------------------------------------
// Restaurant Menus
// -----------------------------------------------------------------------------

export async function listBackendRestaurantMenus(
  token: string,
  query?: { status?: 'active' | 'inactive'; menu_type?: string },
) {
  const path = restaurantMenusListPath(query);
  return apiFetch<unknown>(path, authOptions(token, 'GET'));
}

export async function getBackendRestaurantMenuById(token: string, menuId: string | number) {
  return apiFetch<unknown>(restaurantMenuPath(menuId), authOptions(token, 'GET'));
}

export async function createBackendRestaurantMenu(token: string, body: unknown) {
  return apiFetch<unknown>(restaurantMenusPath(), authOptions(token, 'POST', body));
}

export async function updateBackendRestaurantMenuById(
  token: string,
  menuId: string | number,
  body: unknown,
) {
  return apiFetch<unknown>(restaurantMenuPath(menuId), authOptions(token, 'PATCH', body));
}

export async function activateBackendRestaurantMenuById(token: string, menuId: string | number) {
  try {
    return await apiFetch<unknown>(restaurantMenuActivatePath(menuId), authOptions(token, 'POST'));
  } catch {
    return await updateBackendRestaurantMenuById(token, menuId, { status: 'active' });
  }
}

export async function deactivateBackendRestaurantMenuById(token: string, menuId: string | number) {
  try {
    return await apiFetch<unknown>(
      restaurantMenuDeactivatePath(menuId),
      authOptions(token, 'POST'),
    );
  } catch {
    return await updateBackendRestaurantMenuById(token, menuId, { status: 'inactive' });
  }
}

export async function getBackendRestaurantMenuTree(token: string, menuId: string | number) {
  return apiFetch<unknown>(restaurantMenuTreePath(menuId), authOptions(token, 'GET'));
}

export async function listBackendMenuCategoryAssignments(token: string, menuId: string | number) {
  return apiFetch<unknown>(
    restaurantMenuCategoryAssignmentsPath(menuId),
    authOptions(token, 'GET'),
  );
}

export async function assignBackendMenuCategory(
  token: string,
  menuId: string | number,
  body: unknown,
) {
  return apiFetch<unknown>(
    restaurantMenuCategoryAssignmentsPath(menuId),
    authOptions(token, 'POST', body),
  );
}

export async function updateBackendMenuCategoryAssignment(
  token: string,
  menuId: string | number,
  assignmentId: string | number,
  body: unknown,
) {
  return apiFetch<unknown>(
    restaurantMenuCategoryAssignmentPath(menuId, assignmentId),
    authOptions(token, 'PATCH', body),
  );
}

export async function deleteBackendMenuCategoryAssignment(
  token: string,
  menuId: string | number,
  assignmentId: string | number,
) {
  const path = restaurantMenuCategoryAssignmentPath(menuId, assignmentId);
  const response = await fetch(new URL(path, getServerApiBaseUrl()), {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(response.statusText || 'Failed to delete category assignment');
  }
}

// -----------------------------------------------------------------------------
// Branch Menu Assignments
// -----------------------------------------------------------------------------

function restaurantBranchMenusPath(branchId: number | string, assignmentId?: number | string) {
  const base = `/api/v1/restaurant/branches/${encodeURIComponent(String(branchId))}/menus`;
  return assignmentId == null ? base : `${base}/${encodeURIComponent(String(assignmentId))}`;
}

export async function listBackendBranchMenuAssignments(token: string) {
  const { listBranchMenuAssignmentRows } = await import('@/lib/api/branch-menu-assignments');
  const { mapRestaurantMenusApi, unwrapRestaurantMenuList } =
    await import('@/features/menu/api/restaurant-menus-map');

  const [assignments, menusRaw] = await Promise.all([
    listBranchMenuAssignmentRows(token),
    listBackendRestaurantMenus(token, { status: 'active' }),
  ]);

  const menus = mapRestaurantMenusApi(unwrapRestaurantMenuList(menusRaw));

  return { assignments, menus };
}

export async function assignBackendMenuToBranch(token: string, branchId: number, menuId: number) {
  const created = await apiFetch<Record<string, unknown>>(
    restaurantBranchMenusPath(branchId),
    authOptions(token, 'POST', {
      menu_id: menuId,
      is_default: true,
      display_order: 0,
    }),
  );

  const rawId = created?.id ?? created?.assignment_id ?? created?.branch_menu_id;
  const assignmentId = typeof rawId === 'string' || typeof rawId === 'number' ? rawId : undefined;
  if (assignmentId != null) {
    try {
      await apiFetch<unknown>(
        `${restaurantBranchMenusPath(branchId, assignmentId)}/sync`,
        authOptions(token, 'POST'),
      );
    } catch {
      // Ignore initial sync failure
    }
    try {
      await apiFetch<unknown>(
        `${restaurantBranchMenusPath(branchId, assignmentId)}/activate`,
        authOptions(token, 'POST'),
      );
    } catch {
      // Ignore activation failure
    }
  }

  return created;
}

export async function syncBackendBranchMenu(token: string, branchId: number, assignmentId: number) {
  return apiFetch<unknown>(
    `${restaurantBranchMenusPath(branchId, assignmentId)}/sync`,
    authOptions(token, 'POST'),
  );
}

export async function unassignBackendBranchMenu(
  token: string,
  branchId: string | number,
  assignmentId: string | number,
) {
  const path = restaurantBranchMenusPath(branchId, assignmentId);
  const response = await fetch(new URL(path, getServerApiBaseUrl()), {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(response.statusText || 'Failed to unassign branch menu');
  }
}
