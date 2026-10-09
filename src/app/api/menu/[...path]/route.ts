/**
 * Single-file BFF route handler for all menu-related endpoints:
 * - /api/menu/categories/...
 * - /api/menu/items/...
 * - /api/menu/item-tags/...
 * - /api/menu/menus/...
 * - /api/menu/gst-rates/...
 * - /api/menu/modifier-groups/...
 * - /api/menu/preparation-stations/...
 * - /api/menu/branch-assignments
 * - /api/menu/branches/...
 */

import { NextResponse } from 'next/server';

import { ApiRequestError, resolveApiErrorMessage } from '@/lib/api/errors';
import { jsonError, jsonOk } from '@/lib/api/route-response';
import {
  applyBranchUserMenuItemScope,
  resolveRestaurantMenuCreatePayload,
} from '@/lib/menu-bff-scope.server';
import { requireAccessToken } from '@/lib/users-api-route';
import { unwrapMenuItemApi } from '@/features/menu/api/menu-items-map';
import {
  buildCreateMenuItemApiPayload,
  buildUpdateMenuItemApiPayload,
  finalizeMenuItemApiPayloadForBackend,
  MenuItemCreateValidationError,
  sanitizeMenuItemTaxes,
} from '@/features/menu/lib/build-create-menu-item-payload';
import { proxyUploadMenuItemImage } from '@/features/menu/lib/menu-item-image-upload.server';
import type { CreateMenuItemInput } from '@/features/menu/types/menu';
import {
  buildCategoryNameById,
  mapMenuCategoryAssignmentsApi,
  mapMenuTreeApi,
  mapRestaurantMenuApi,
  mapRestaurantMenusApi,
  toCreateMenuCategoryAssignmentPayload,
  toUpdateMenuCategoryAssignmentPayload,
  toUpdateRestaurantMenuPayload,
  unwrapMenuCategoryAssignmentList,
  unwrapRestaurantMenuList,
} from '@/features/menu/api/restaurant-menus-map';

type ItemStatusFilter = 'active' | 'inactive';
type DietaryTypeFilter = 'veg' | 'non_veg' | 'egg' | 'vegan';
import type {
  MenuCategoryAssignmentApi,
  MenuTreeApi,
  RestaurantMenuApi,
} from '@/features/menu/types/restaurant-menu-api';
import {
  activateBackendMenuCategory,
  activateBackendMenuItem,
  activateBackendMenuItemImage,
  activateBackendMenuItemVariant,
  activateBackendRestaurantMenuById,
  assignBackendMenuCategory,
  assignBackendMenuToBranch,
  createBackendGstRate,
  ensureBackendGstRates,
  ensureBackendMenuCategories,
  createBackendMenuCategory,
  createBackendMenuItem,
  createBackendMenuItemImage,
  createBackendMenuItemImageUploadUrl,
  createBackendMenuItemTag,
  createBackendMenuItemVariant,
  createBackendModifierGroup,
  createBackendModifierOption,
  createBackendPreparationStation,
  createBackendRestaurantMenu,
  deactivateBackendMenuCategory,
  deactivateBackendMenuItem,
  deactivateBackendMenuItemImage,
  deactivateBackendMenuItemVariant,
  deactivateBackendRestaurantMenuById,
  deleteBackendMenuCategoryAssignment,
  getBackendGstRateById,
  getBackendMenuCategory,
  getBackendMenuItem,
  getBackendMenuItemImage,
  getBackendMenuItemTag,
  getBackendMenuItemVariant,
  getBackendModifierGroupById,
  getBackendPreparationStationById,
  getBackendRestaurantMenuById,
  getBackendRestaurantMenuTree,
  listBackendBranchMenuAssignments,
  listBackendGstRates,
  listBackendMenuCategories,
  listBackendMenuCategoryAssignments,
  listBackendMenuItemImages,
  listBackendMenuItems,
  listBackendMenuItemTags,
  listBackendMenuItemVariants,
  listBackendModifierGroups,
  listBackendModifierOptions,
  listBackendPreparationStations,
  listBackendRestaurantMenus,
  syncBackendBranchMenu,
  updateBackendMenuCategory,
  updateBackendMenuCategoryAssignment,
  updateBackendMenuItem,
  updateBackendMenuItemImage,
  updateBackendMenuItemTag,
  updateBackendMenuItemVariant,
  updateBackendModifierGroupById,
  updateBackendModifierOptionById,
  updateBackendPreparationStationById,
  updateBackendRestaurantMenuById,
} from '@/lib/api/menu';
import {
  activateBackendBranchMenuAssignment,
  activateBackendBranchMenuItemModifier,
  activateBackendBranchMenuItemOverride,
  activateBackendBranchMenuItemVariant,
  assignBackendBranchMenuByBranchId,
  deactivateBackendBranchMenuAssignment,
  deactivateBackendBranchMenuItemModifier,
  deactivateBackendBranchMenuItemOverride,
  deactivateBackendBranchMenuItemVariant,
  deleteBackendBranchMenuAssignment,
  getBackendBranchMenuAssignment,
  getBackendBranchMenuItemModifier,
  getBackendBranchMenuItemOverride,
  getBackendBranchMenuItemVariant,
  getBackendBranchMenuTree,
  listBackendBranchMenuItemModifiers,
  listBackendBranchMenuItemOverrides,
  listBackendBranchMenuItemVariants,
  listBackendBranchMenusByBranchId,
  syncBackendBranchMenuAssignment,
  syncBackendBranchMenuVariants,
  updateBackendBranchMenuAssignment,
  updateBackendBranchMenuItemModifier,
  updateBackendBranchMenuItemOverride,
  updateBackendBranchMenuItemVariant,
} from '@/lib/api/branch-menus';
import { toUpdateBranchMenuItemOverridePayload } from '@/features/menu/api/branch-menu-item-overrides-map';
import type {
  AssignBranchMenuApiRequest,
  UpdateBranchMenuApiRequest,
} from '@/features/menu/types/branch-menu-api';
import type {
  BranchMenuItemModifierOptionUpdateRequest,
  BranchMenuItemVariantUpdateRequest,
  UpdateBranchMenuItemOverrideApiRequest,
} from '@/features/menu/types/branch-menu-item-api';

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

function handleRouteError(error: unknown, fallbackMessage = 'Request failed') {
  if (error instanceof MenuItemCreateValidationError) {
    return jsonError(error.message, error.status);
  }
  if (error instanceof ApiRequestError && error.status > 0) {
    const message = resolveApiErrorMessage(error, {
      fallback: fallbackMessage,
      codeMessages: {
        DUPLICATE_MENU_ITEM_CODE:
          'An item with this code already exists. Choose a different item code.',
        MENU_ITEM_CODE_ALREADY_EXISTS:
          'An item with this code already exists. Choose a different item code.',
      },
    });
    return NextResponse.json(
      {
        success: false,
        message,
        details: error.details ?? null,
      },
      { status: error.status, headers: { 'Content-Type': 'application/json; charset=utf-8' } },
    );
  }
  const msg = error instanceof Error ? error.message : fallbackMessage;
  return jsonError(msg, 500);
}

function stripEmptyMenuItemRelationArrays(payload: Record<string, unknown>): void {
  if (Array.isArray(payload.preparation_stations) && payload.preparation_stations.length === 0) {
    delete payload.preparation_stations;
  }
  if (Array.isArray(payload.modifier_groups) && payload.modifier_groups.length === 0) {
    delete payload.modifier_groups;
  }
  if (Array.isArray(payload.tag_ids) && payload.tag_ids.length === 0) {
    delete payload.tag_ids;
  }
}

function parseQuery(url: string) {
  return new URL(url).searchParams;
}

function menuPayloadToRecord(payload: unknown): Record<string, unknown> {
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    return { ...(payload as Record<string, unknown>) };
  }
  return {};
}

type ActiveInactiveFilter = 'active' | 'inactive';

function toSafeId(val: unknown): string {
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  return '';
}

function unwrapBackendList<T = unknown>(data: unknown): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as T[];
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const keys = [
      'items',
      'categories',
      'menus',
      'tags',
      'variants',
      'images',
      'stations',
      'groups',
      'rates',
    ] as const;
    for (const key of keys) {
      if (Array.isArray(obj[key])) return obj[key] as T[];
    }
    if (Array.isArray(obj.data)) return unwrapBackendList<T>(obj.data);
  }
  return [];
}

async function handleGetCategories(token: string, path: string[]) {
  if (path[0] !== 'categories') return null;
  if (path.length === 1) {
    const data = await listBackendMenuCategories(token);
    let list = unwrapBackendList(data);
    if (list.length === 0) {
      const seeded = await ensureBackendMenuCategories(token);
      list = unwrapBackendList(seeded);
    }
    return jsonOk(list);
  }
  if (path.length === 2) {
    const data = await getBackendMenuCategory(token, path[1]);
    return jsonOk(data);
  }
  return null;
}

async function handleGetItems(token: string, path: string[], searchParams: URLSearchParams) {
  if (path[0] !== 'items') return null;
  if (path.length === 1) {
    const status = searchParams.get('status') as ItemStatusFilter | null;
    const categoryId = searchParams.get('category_id');
    const dietaryType = searchParams.get('dietary_type') as DietaryTypeFilter | null;
    const data = await listBackendMenuItems(token, {
      status: status ?? undefined,
      category_id: categoryId ? Number(categoryId) : undefined,
      dietary_type: dietaryType ?? undefined,
    });
    return jsonOk(unwrapBackendList(data));
  }
  if (path.length === 2) {
    const data = await getBackendMenuItem(token, path[1]);
    return jsonOk(data);
  }
  if (path.length === 3 && path[2] === 'variants') {
    const status = searchParams.get('status') as ActiveInactiveFilter | null;
    const data = await listBackendMenuItemVariants(token, path[1], {
      status: status ?? undefined,
    });
    return jsonOk(unwrapBackendList(data));
  }
  if (path.length === 4 && path[2] === 'variants') {
    const data = await getBackendMenuItemVariant(token, path[1], path[3]);
    return jsonOk(data);
  }
  if (path.length === 3 && path[2] === 'images') {
    const status = searchParams.get('status') as ActiveInactiveFilter | null;
    const data = await listBackendMenuItemImages(token, path[1], {
      status: status ?? undefined,
    });
    return jsonOk(unwrapBackendList(data));
  }
  if (path.length === 4 && path[2] === 'images') {
    const data = await getBackendMenuItemImage(token, path[1], path[3]);
    return jsonOk(data);
  }
  return null;
}

async function handleGetTags(token: string, path: string[], searchParams: URLSearchParams) {
  if (path[0] !== 'item-tags') return null;
  if (path.length === 1) {
    const status = searchParams.get('status') as ActiveInactiveFilter | null;
    const data = await listBackendMenuItemTags(token, { status: status ?? undefined });
    return jsonOk(unwrapBackendList(data));
  }
  if (path.length === 2) {
    const data = await getBackendMenuItemTag(token, path[1]);
    return jsonOk(data);
  }
  return null;
}

async function handleGetMenus(token: string, path: string[], searchParams: URLSearchParams) {
  if (path[0] !== 'menus') return null;
  if (path.length === 1) {
    const status = searchParams.get('status') as ActiveInactiveFilter | null;
    const menuType = searchParams.get('menu_type');
    const data = await listBackendRestaurantMenus(token, {
      status: status ?? undefined,
      menu_type: menuType ?? undefined,
    });
    return jsonOk(mapRestaurantMenusApi(unwrapRestaurantMenuList(data)));
  }
  if (path.length === 2) {
    const data = await getBackendRestaurantMenuById(token, path[1]);
    return jsonOk(mapRestaurantMenuApi(data as RestaurantMenuApi));
  }
  if (path.length === 3 && path[2] === 'tree') {
    const data = await getBackendRestaurantMenuTree(token, path[1]);
    return jsonOk(mapMenuTreeApi(data as MenuTreeApi));
  }
  if (path.length === 3 && path[2] === 'category-assignments') {
    const rawCategories = await listBackendMenuCategories(token);
    const categories = unwrapBackendList<{ id?: string | number; name?: string }>(rawCategories);
    const categoryNameById = buildCategoryNameById(
      categories.map((cat) => ({
        id: String(cat.id ?? ''),
        name: String(cat.name ?? ''),
        status: 'Active' as const,
        scope: 'company' as const,
      })),
    );
    const data = await listBackendMenuCategoryAssignments(token, path[1]);
    const assignments = mapMenuCategoryAssignmentsApi(
      unwrapMenuCategoryAssignmentList(data) as MenuCategoryAssignmentApi[],
      categoryNameById,
    );
    return jsonOk(assignments);
  }
  if (path.length === 3 && path[2] === 'detail') {
    const treeData = (await getBackendRestaurantMenuTree(token, path[1])) as Record<
      string,
      unknown
    > | null;
    const menuData = treeData?.menu ?? (await getBackendRestaurantMenuById(token, path[1]));
    return jsonOk({
      session: menuData,
      tree: treeData,
      assignedItems: [],
    });
  }
  return null;
}

async function handleGetGstRates(token: string, path: string[], searchParams: URLSearchParams) {
  if (path[0] !== 'gst-rates') return null;
  if (path.length === 1) {
    const code = searchParams.get('code') ?? undefined;
    const activeOnly = searchParams.get('active_only') === 'true';
    const rawData = await listBackendGstRates(token, { code, active_only: activeOnly });
    let list = unwrapBackendList(rawData);
    if (list.length === 0) {
      const seeded = await ensureBackendGstRates(token);
      list = unwrapBackendList(seeded);
    }
    return jsonOk(list);
  }
  if (path.length === 2) {
    const data = await getBackendGstRateById(token, path[1]);
    return jsonOk(data);
  }
  return null;
}

async function handleGetModifierGroups(
  token: string,
  path: string[],
  searchParams: URLSearchParams,
) {
  if (path[0] !== 'modifier-groups') return null;
  if (path.length === 1) {
    const status = searchParams.get('status') as ActiveInactiveFilter | null;
    const data = await listBackendModifierGroups(token, { status: status ?? undefined });
    return jsonOk(unwrapBackendList(data));
  }
  if (path.length === 2) {
    const data = await getBackendModifierGroupById(token, path[1]);
    return jsonOk(data);
  }
  if (path.length === 3 && path[2] === 'options') {
    const status = searchParams.get('status') as ActiveInactiveFilter | null;
    const data = await listBackendModifierOptions(token, path[1], {
      status: status ?? undefined,
    });
    return jsonOk(unwrapBackendList(data));
  }
  return null;
}

async function handleGetStations(token: string, path: string[], searchParams: URLSearchParams) {
  if (path[0] !== 'preparation-stations') return null;
  if (path.length === 1) {
    const status = searchParams.get('status') as ActiveInactiveFilter | null;
    const data = await listBackendPreparationStations(token, { status: status ?? undefined });
    return jsonOk(unwrapBackendList(data));
  }
  if (path.length === 2) {
    const data = await getBackendPreparationStationById(token, path[1]);
    return jsonOk(data);
  }
  return null;
}

async function handleGetBranchMenus(token: string, path: string[], searchParams: URLSearchParams) {
  const branchId = path[1];
  if (path.length === 3 && path[2] === 'menus') {
    const status = searchParams.get('status') as ActiveInactiveFilter | null;
    const data = await listBackendBranchMenusByBranchId(token, branchId, {
      status: status ?? undefined,
    });
    return jsonOk(data);
  }
  if (path.length === 4 && path[2] === 'menus') {
    const data = await getBackendBranchMenuAssignment(token, branchId, path[3]);
    return jsonOk(data);
  }
  if (path.length === 5 && path[2] === 'menus' && path[4] === 'tree') {
    const categoryIdRaw = searchParams.get('category_id');
    const category_id =
      categoryIdRaw && Number.isFinite(Number(categoryIdRaw)) ? Number(categoryIdRaw) : undefined;
    const data = await getBackendBranchMenuTree(token, branchId, path[3], { category_id });
    return jsonOk(data);
  }
  if (path.length === 5 && path[2] === 'menus' && path[4] === 'items') {
    const status = searchParams.get('status') as ActiveInactiveFilter | null;
    const page = searchParams.get('page');
    const pageSize = searchParams.get('page_size');
    const data = await listBackendBranchMenuItemOverrides(token, branchId, path[3], {
      status: status ?? undefined,
      page: page && Number.isFinite(Number(page)) ? Number(page) : undefined,
      page_size: pageSize && Number.isFinite(Number(pageSize)) ? Number(pageSize) : undefined,
    });
    return jsonOk(data);
  }
  if (path.length === 6 && path[2] === 'menus' && path[4] === 'items') {
    const data = await getBackendBranchMenuItemOverride(token, branchId, path[3], path[5]);
    return jsonOk(data);
  }
  if (path.length === 7 && path[2] === 'menus' && path[4] === 'items' && path[6] === 'variants') {
    const status = searchParams.get('status') as ActiveInactiveFilter | null;
    const page = searchParams.get('page');
    const pageSize = searchParams.get('page_size');
    const data = await listBackendBranchMenuItemVariants(token, branchId, path[3], path[5], {
      status: status ?? undefined,
      page: page && Number.isFinite(Number(page)) ? Number(page) : undefined,
      page_size: pageSize && Number.isFinite(Number(pageSize)) ? Number(pageSize) : undefined,
    });
    return jsonOk(data);
  }
  if (path.length === 8 && path[2] === 'menus' && path[4] === 'items' && path[6] === 'variants') {
    const data = await getBackendBranchMenuItemVariant(token, branchId, path[3], path[5], path[7]);
    return jsonOk(data);
  }
  if (path.length === 7 && path[2] === 'menus' && path[4] === 'items' && path[6] === 'modifiers') {
    const status = searchParams.get('status') as ActiveInactiveFilter | null;
    const page = searchParams.get('page');
    const pageSize = searchParams.get('page_size');
    const data = await listBackendBranchMenuItemModifiers(token, branchId, path[3], path[5], {
      status: status ?? undefined,
      page: page && Number.isFinite(Number(page)) ? Number(page) : undefined,
      page_size: pageSize && Number.isFinite(Number(pageSize)) ? Number(pageSize) : undefined,
    });
    return jsonOk(data);
  }
  if (path.length === 8 && path[2] === 'menus' && path[4] === 'items' && path[6] === 'modifiers') {
    const data = await getBackendBranchMenuItemModifier(token, branchId, path[3], path[5], path[7]);
    return jsonOk(data);
  }
  return null;
}

async function handleGetBranches(token: string, path: string[], searchParams: URLSearchParams) {
  if (path[0] === 'branch-assignments') {
    const data = await listBackendBranchMenuAssignments(token);
    return jsonOk(data);
  }
  if (path[0] === 'branches') {
    const branchId = path[1];
    if (!branchId) return jsonError('Branch id is required', 422);
    return handleGetBranchMenus(token, path, searchParams);
  }
  return null;
}

// -----------------------------------------------------------------------------
// GET Handler
// -----------------------------------------------------------------------------

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireAccessToken();
  if (auth.error) return auth.error;
  const token = auth.token;

  const { path } = await context.params;
  const searchParams = parseQuery(request.url);

  try {
    const res =
      (await handleGetCategories(token, path)) ??
      (await handleGetItems(token, path, searchParams)) ??
      (await handleGetTags(token, path, searchParams)) ??
      (await handleGetMenus(token, path, searchParams)) ??
      (await handleGetGstRates(token, path, searchParams)) ??
      (await handleGetModifierGroups(token, path, searchParams)) ??
      (await handleGetStations(token, path, searchParams)) ??
      (await handleGetBranches(token, path, searchParams));

    if (res) return res;
    return jsonError(`Route not found: ${path.join('/')}`, 404);
  } catch (error) {
    return handleRouteError(error);
  }
}

async function handlePostCategories(token: string, path: string[], body: unknown) {
  if (path[0] !== 'categories') return null;
  if (path.length === 1) {
    const data = await createBackendMenuCategory(token, body);
    return jsonOk(data, { status: 201 });
  }
  if (path.length === 3 && path[2] === 'activate') {
    const data = await activateBackendMenuCategory(token, path[1]);
    return jsonOk(data);
  }
  if (path.length === 3 && path[2] === 'deactivate') {
    const data = await deactivateBackendMenuCategory(token, path[1]);
    return jsonOk(data);
  }
  return null;
}

async function createMenuItemWithActivation(token: string, body: unknown) {
  const isUiInput =
    body &&
    typeof body === 'object' &&
    ('categoryId' in body || 'basePrice' in body || 'dietary' in body);

  let itemPayload: unknown = body;
  if (isUiInput) {
    const built = await buildCreateMenuItemApiPayload(token, body as CreateMenuItemInput, []);
    itemPayload = await applyBranchUserMenuItemScope(menuPayloadToRecord(built));
  } else if (itemPayload && typeof itemPayload === 'object') {
    const payloadObj = itemPayload as Record<string, unknown>;
    if (Array.isArray(payloadObj.taxes)) {
      payloadObj.taxes = sanitizeMenuItemTaxes(
        payloadObj.taxes as Array<{ gst_rate_id?: unknown; is_inclusive?: boolean }>,
      );
    }
    stripEmptyMenuItemRelationArrays(payloadObj);
    itemPayload = finalizeMenuItemApiPayloadForBackend(payloadObj);
  }

  const scopedItemPayload = await applyBranchUserMenuItemScope(menuPayloadToRecord(itemPayload));
  let data = await createBackendMenuItem(token, scopedItemPayload);

  const unwrapped = unwrapMenuItemApi(data) ?? (data as Record<string, unknown>);
  const itemIdStr = toSafeId(unwrapped?.id);
  if (itemIdStr && unwrapped.status !== 'active') {
    try {
      const activated = await activateBackendMenuItem(token, itemIdStr);
      if (activated) data = activated;
    } catch {
      // Keep the created item
    }
  }
  return jsonOk(data, { status: 201 });
}

async function handlePostItems(token: string, path: string[], body: unknown) {
  if (path[0] !== 'items') return null;
  if (path.length === 1) {
    return createMenuItemWithActivation(token, body);
  }
  if (path.length === 3 && path[2] === 'activate') {
    const data = await activateBackendMenuItem(token, path[1]);
    return jsonOk(data);
  }
  if (path.length === 3 && path[2] === 'deactivate') {
    const data = await deactivateBackendMenuItem(token, path[1]);
    return jsonOk(data);
  }
  if (path.length === 3 && path[2] === 'variants') {
    const data = await createBackendMenuItemVariant(token, path[1], body);
    return jsonOk(data, { status: 201 });
  }
  if (path.length === 5 && path[2] === 'variants' && path[4] === 'activate') {
    const data = await activateBackendMenuItemVariant(token, path[1], path[3]);
    return jsonOk(data);
  }
  if (path.length === 5 && path[2] === 'variants' && path[4] === 'deactivate') {
    const data = await deactivateBackendMenuItemVariant(token, path[1], path[3]);
    return jsonOk(data);
  }
  if (path.length === 4 && path[2] === 'images' && path[3] === 'upload-url') {
    const data = await createBackendMenuItemImageUploadUrl(token, path[1], body);
    return jsonOk(data);
  }
  if (path.length === 3 && path[2] === 'images') {
    const data = await createBackendMenuItemImage(token, path[1], body);
    return jsonOk(data, { status: 201 });
  }
  if (path.length === 5 && path[2] === 'images' && path[4] === 'activate') {
    const data = await activateBackendMenuItemImage(token, path[1], path[3]);
    return jsonOk(data);
  }
  if (path.length === 5 && path[2] === 'images' && path[4] === 'deactivate') {
    const data = await deactivateBackendMenuItemImage(token, path[1], path[3]);
    return jsonOk(data);
  }
  return null;
}

async function handlePostMenus(token: string, path: string[], body: unknown) {
  if (path[0] !== 'menus') return null;
  if (path.length === 1) {
    const menuPayload = await resolveRestaurantMenuCreatePayload(body);
    const data = await createBackendRestaurantMenu(token, menuPayload);
    return jsonOk(mapRestaurantMenuApi(data as RestaurantMenuApi), { status: 201 });
  }
  if (path.length === 3 && path[2] === 'activate') {
    const data = await activateBackendRestaurantMenuById(token, path[1]);
    return jsonOk(data);
  }
  if (path.length === 3 && path[2] === 'deactivate') {
    const data = await deactivateBackendRestaurantMenuById(token, path[1]);
    return jsonOk(data);
  }
  if (path.length === 3 && path[2] === 'category-assignments') {
    const assignmentPayload =
      body && typeof body === 'object' && 'categoryId' in body
        ? toCreateMenuCategoryAssignmentPayload(
            body as { categoryId: string; displayOrder?: number },
          )
        : body;
    const data = await assignBackendMenuCategory(token, path[1], assignmentPayload);
    const rawCategories = await listBackendMenuCategories(token);
    const categories = unwrapBackendList<{ id?: string | number; name?: string }>(rawCategories);
    const categoryNameById = buildCategoryNameById(
      categories.map((cat) => ({
        id: String(cat.id ?? ''),
        name: String(cat.name ?? ''),
        status: 'Active' as const,
        scope: 'company' as const,
      })),
    );
    return jsonOk(
      mapMenuCategoryAssignmentsApi([data as MenuCategoryAssignmentApi], categoryNameById)[0],
      { status: 201 },
    );
  }
  return null;
}

async function handlePostConfigs(token: string, path: string[], body: unknown) {
  const resource = path[0];
  if (resource === 'item-tags' && path.length === 1) {
    const data = await createBackendMenuItemTag(token, body);
    return jsonOk(data, { status: 201 });
  }
  if (resource === 'gst-rates' && path.length === 1) {
    const data = await createBackendGstRate(token, body);
    return jsonOk(data, { status: 201 });
  }
  if (resource === 'modifier-groups') {
    if (path.length === 1) {
      const data = await createBackendModifierGroup(token, body);
      return jsonOk(data, { status: 201 });
    }
    if (path.length === 3 && path[2] === 'options') {
      const data = await createBackendModifierOption(token, path[1], body);
      return jsonOk(data, { status: 201 });
    }
  }
  if (resource === 'preparation-stations' && path.length === 1) {
    const data = await createBackendPreparationStation(token, body);
    return jsonOk(data, { status: 201 });
  }
  return null;
}

async function handlePostBranches(token: string, path: string[], body: Record<string, unknown>) {
  if (path[0] === 'branch-assignments') {
    const branchId = Number(body.branchId);
    const menuId = Number(body.menuId);
    const data = await assignBackendMenuToBranch(token, branchId, menuId);
    return jsonOk(data);
  }
  if (path[0] === 'branches' && path.length >= 3) {
    const branchId = path[1];

    if (path.length === 3 && path[2] === 'sync') {
      const assignmentId = Number(body.assignmentId ?? 0);
      const data = await syncBackendBranchMenu(token, Number(branchId), assignmentId);
      return jsonOk(data);
    }
    if (path.length === 3 && path[2] === 'menus') {
      const data = await assignBackendBranchMenuByBranchId(
        token,
        branchId,
        body as AssignBranchMenuApiRequest,
      );
      return jsonOk(data, { status: 201 });
    }
    if (path.length === 5 && path[2] === 'menus') {
      const assignmentId = path[3];
      const action = path[4];
      if (action === 'sync') {
        const data = await syncBackendBranchMenuAssignment(token, branchId, assignmentId);
        return jsonOk(data);
      }
      if (action === 'sync-variants') {
        const data = await syncBackendBranchMenuVariants(token, branchId, assignmentId);
        return jsonOk(data);
      }
      if (action === 'activate') {
        const data = await activateBackendBranchMenuAssignment(token, branchId, assignmentId);
        return jsonOk(data);
      }
      if (action === 'deactivate') {
        const data = await deactivateBackendBranchMenuAssignment(token, branchId, assignmentId);
        return jsonOk(data);
      }
    }
    if (path.length === 7 && path[2] === 'menus' && path[4] === 'items') {
      const assignmentId = path[3];
      const itemOverrideId = path[5];
      const action = path[6];
      if (action === 'activate') {
        const data = await activateBackendBranchMenuItemOverride(
          token,
          branchId,
          assignmentId,
          itemOverrideId,
        );
        return jsonOk(data);
      }
      if (action === 'deactivate') {
        const data = await deactivateBackendBranchMenuItemOverride(
          token,
          branchId,
          assignmentId,
          itemOverrideId,
        );
        return jsonOk(data);
      }
    }
    if (path.length === 9 && path[2] === 'menus' && path[4] === 'items' && path[6] === 'variants') {
      const assignmentId = path[3];
      const itemOverrideId = path[5];
      const variantOverrideId = path[7];
      const action = path[8];
      if (action === 'activate') {
        const data = await activateBackendBranchMenuItemVariant(
          token,
          branchId,
          assignmentId,
          itemOverrideId,
          variantOverrideId,
        );
        return jsonOk(data);
      }
      if (action === 'deactivate') {
        const data = await deactivateBackendBranchMenuItemVariant(
          token,
          branchId,
          assignmentId,
          itemOverrideId,
          variantOverrideId,
        );
        return jsonOk(data);
      }
    }
    if (
      path.length === 9 &&
      path[2] === 'menus' &&
      path[4] === 'items' &&
      path[6] === 'modifiers'
    ) {
      const assignmentId = path[3];
      const itemOverrideId = path[5];
      const modifierOverrideId = path[7];
      const action = path[8];
      if (action === 'activate') {
        const data = await activateBackendBranchMenuItemModifier(
          token,
          branchId,
          assignmentId,
          itemOverrideId,
          modifierOverrideId,
        );
        return jsonOk(data);
      }
      if (action === 'deactivate') {
        const data = await deactivateBackendBranchMenuItemModifier(
          token,
          branchId,
          assignmentId,
          itemOverrideId,
          modifierOverrideId,
        );
        return jsonOk(data);
      }
    }
  }
  return null;
}

// -----------------------------------------------------------------------------
// POST Handler
// -----------------------------------------------------------------------------

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAccessToken();
  if (auth.error) return auth.error;
  const token = auth.token;

  const { path } = await context.params;
  const resource = path[0];

  if (resource === 'items' && path.length === 4 && path[2] === 'images' && path[3] === 'upload') {
    try {
      const formData = await request.formData();
      const file = formData.get('file');
      if (!(file instanceof File)) {
        return jsonError('Image file is required.', 422);
      }

      const sortOrderRaw = formData.get('sort_order');
      const sortOrder =
        typeof sortOrderRaw === 'string' && sortOrderRaw.trim() ? Number(sortOrderRaw) : undefined;
      const isPrimaryRaw = formData.get('is_primary');
      const isPrimary = isPrimaryRaw === '1' || isPrimaryRaw === 'true';

      const data = await proxyUploadMenuItemImage(token, path[1], file, {
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : undefined,
        isPrimary,
      });
      return jsonOk(data, { status: 201 });
    } catch (error) {
      return handleRouteError(error, 'Failed to upload menu item image.');
    }
  }

  const body = await request.json().catch(() => ({}));

  try {
    const res =
      (await handlePostCategories(token, path, body)) ??
      (await handlePostItems(token, path, body)) ??
      (await handlePostMenus(token, path, body)) ??
      (await handlePostConfigs(token, path, body)) ??
      (await handlePostBranches(token, path, body as Record<string, unknown>));

    if (res) return res;
    return jsonError(`Route not found: ${path.join('/')}`, 404);
  } catch (error) {
    return handleRouteError(error);
  }
}

async function handlePatchCategories(token: string, path: string[], body: unknown) {
  if (path[0] === 'categories' && path.length === 2) {
    const data = await updateBackendMenuCategory(token, path[1], body);
    return jsonOk(data);
  }
  return null;
}

async function handlePatchItems(token: string, path: string[], body: unknown) {
  if (path[0] !== 'items') return null;
  if (path.length === 2) {
    const isUiInput =
      body &&
      typeof body === 'object' &&
      ('categoryId' in body ||
        'basePrice' in body ||
        'dietary' in body ||
        'orderTypes' in body ||
        'gst' in body ||
        'code' in body);

    let updatePayload: unknown = isUiInput
      ? await buildUpdateMenuItemApiPayload(token, body as Partial<CreateMenuItemInput>, [])
      : body;
    if (updatePayload && typeof updatePayload === 'object' && !Array.isArray(updatePayload)) {
      updatePayload = await applyBranchUserMenuItemScope(updatePayload as Record<string, unknown>);
    }

    const data = await updateBackendMenuItem(token, path[1], updatePayload);
    return jsonOk(data);
  }
  if (path.length === 4 && path[2] === 'variants') {
    const data = await updateBackendMenuItemVariant(token, path[1], path[3], body);
    return jsonOk(data);
  }
  if (path.length === 4 && path[2] === 'images') {
    const data = await updateBackendMenuItemImage(token, path[1], path[3], body);
    return jsonOk(data);
  }
  return null;
}

async function handlePatchMenus(token: string, path: string[], body: unknown) {
  if (path[0] !== 'menus') return null;
  if (path.length === 3 && path[2] === 'activate') {
    const data = await activateBackendRestaurantMenuById(token, path[1]);
    return jsonOk(data);
  }
  if (path.length === 3 && path[2] === 'deactivate') {
    const data = await deactivateBackendRestaurantMenuById(token, path[1]);
    return jsonOk(data);
  }
  if (path.length === 2) {
    const menuPayload =
      body && typeof body === 'object' && ('menuType' in body || 'displayOrder' in body)
        ? toUpdateRestaurantMenuPayload(body as Parameters<typeof toUpdateRestaurantMenuPayload>[0])
        : body;
    const data = await updateBackendRestaurantMenuById(token, path[1], menuPayload);
    return jsonOk(mapRestaurantMenuApi(data as RestaurantMenuApi));
  }
  if (path.length === 4 && path[2] === 'category-assignments') {
    const assignmentPayload =
      body && typeof body === 'object' && ('displayOrder' in body || 'status' in body)
        ? toUpdateMenuCategoryAssignmentPayload(
            body as Parameters<typeof toUpdateMenuCategoryAssignmentPayload>[0],
          )
        : body;
    const data = await updateBackendMenuCategoryAssignment(
      token,
      path[1],
      path[3],
      assignmentPayload,
    );
    return jsonOk(data);
  }
  return null;
}

async function handlePatchConfigs(token: string, path: string[], body: unknown) {
  const resource = path[0];
  if (resource === 'item-tags' && path.length === 2) {
    const data = await updateBackendMenuItemTag(token, path[1], body);
    return jsonOk(data);
  }
  if (resource === 'modifier-groups') {
    if (path.length === 2) {
      const data = await updateBackendModifierGroupById(token, path[1], body);
      return jsonOk(data);
    }
    if (path.length === 4 && path[2] === 'options') {
      const data = await updateBackendModifierOptionById(token, path[1], path[3], body);
      return jsonOk(data);
    }
  }
  if (resource === 'preparation-stations' && path.length === 2) {
    const data = await updateBackendPreparationStationById(token, path[1], body);
    return jsonOk(data);
  }
  return null;
}

async function handlePatchBranches(token: string, path: string[], body: unknown) {
  if (path[0] !== 'branches') return null;
  if (path.length === 4 && path[2] === 'menus') {
    const data = await updateBackendBranchMenuAssignment(
      token,
      path[1],
      path[3],
      body as UpdateBranchMenuApiRequest,
    );
    return jsonOk(data);
  }
  if (path.length === 6 && path[2] === 'menus' && path[4] === 'items') {
    const isUiInput =
      body &&
      typeof body === 'object' &&
      !('selling_price' in body) &&
      !('is_available' in body) &&
      ('basePrice' in body ||
        'orderTypes' in body ||
        (body as { status?: string }).status === 'Available' ||
        (body as { status?: string }).status === 'Hidden');
    const updatePayload = isUiInput
      ? toUpdateBranchMenuItemOverridePayload(body as Partial<CreateMenuItemInput>)
      : (body as UpdateBranchMenuItemOverrideApiRequest);
    const data = await updateBackendBranchMenuItemOverride(
      token,
      path[1],
      path[3],
      path[5],
      updatePayload,
    );
    return jsonOk(data);
  }
  if (path.length === 8 && path[2] === 'menus' && path[4] === 'items' && path[6] === 'variants') {
    const data = await updateBackendBranchMenuItemVariant(
      token,
      path[1],
      path[3],
      path[5],
      path[7],
      body as BranchMenuItemVariantUpdateRequest,
    );
    return jsonOk(data);
  }
  if (path.length === 8 && path[2] === 'menus' && path[4] === 'items' && path[6] === 'modifiers') {
    const data = await updateBackendBranchMenuItemModifier(
      token,
      path[1],
      path[3],
      path[5],
      path[7],
      body as BranchMenuItemModifierOptionUpdateRequest,
    );
    return jsonOk(data);
  }
  return null;
}

// -----------------------------------------------------------------------------
// PATCH Handler
// -----------------------------------------------------------------------------

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAccessToken();
  if (auth.error) return auth.error;
  const token = auth.token;

  const { path } = await context.params;
  const body = await request.json().catch(() => ({}));

  try {
    const res =
      (await handlePatchCategories(token, path, body)) ??
      (await handlePatchItems(token, path, body)) ??
      (await handlePatchMenus(token, path, body)) ??
      (await handlePatchConfigs(token, path, body)) ??
      (await handlePatchBranches(token, path, body));

    if (res) return res;
    return jsonError(`Route not found: ${path.join('/')}`, 404);
  } catch (error) {
    return handleRouteError(error);
  }
}

// -----------------------------------------------------------------------------
// DELETE Handler
// -----------------------------------------------------------------------------

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAccessToken();
  if (auth.error) return auth.error;
  const token = auth.token;

  const { path } = await context.params;
  const resource = path[0];

  try {
    if (resource === 'menus' && path.length === 4 && path[2] === 'category-assignments') {
      await deleteBackendMenuCategoryAssignment(token, path[1], path[3]);
      return jsonOk({ deleted: true });
    }

    if (resource === 'branches' && path.length === 4 && path[2] === 'menus') {
      await deleteBackendBranchMenuAssignment(token, path[1], path[3]);
      return jsonOk({ deleted: true });
    }

    return jsonError(`Route not found: ${path.join('/')}`, 404);
  } catch (error) {
    return handleRouteError(error);
  }
}
