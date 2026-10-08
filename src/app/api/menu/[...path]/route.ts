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
  toCreateRestaurantMenuPayload,
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
  unassignBackendBranchMenu,
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

function unwrapBackendList<T = unknown>(data: unknown): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as T[];
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items as T[];
    if (Array.isArray(obj.data)) return unwrapBackendList<T>(obj.data);
    if (Array.isArray(obj.categories)) return obj.categories as T[];
    if (Array.isArray(obj.menus)) return obj.menus as T[];
    if (Array.isArray(obj.tags)) return obj.tags as T[];
    if (Array.isArray(obj.variants)) return obj.variants as T[];
    if (Array.isArray(obj.images)) return obj.images as T[];
    if (Array.isArray(obj.stations)) return obj.stations as T[];
    if (Array.isArray(obj.groups)) return obj.groups as T[];
    if (Array.isArray(obj.rates)) return obj.rates as T[];
  }
  return [];
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
  const resource = path[0];

  try {
    // Categories
    if (resource === 'categories') {
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
    }

    // Items
    if (resource === 'items') {
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
      // items/[itemId]/variants
      if (path.length === 3 && path[2] === 'variants') {
        const status = searchParams.get('status') as 'active' | 'inactive' | null;
        const data = await listBackendMenuItemVariants(token, path[1], {
          status: status ?? undefined,
        });
        return jsonOk(unwrapBackendList(data));
      }
      if (path.length === 4 && path[2] === 'variants') {
        const data = await getBackendMenuItemVariant(token, path[1], path[3]);
        return jsonOk(data);
      }
      // items/[itemId]/images
      if (path.length === 3 && path[2] === 'images') {
        const status = searchParams.get('status') as 'active' | 'inactive' | null;
        const data = await listBackendMenuItemImages(token, path[1], {
          status: status ?? undefined,
        });
        return jsonOk(unwrapBackendList(data));
      }
      if (path.length === 4 && path[2] === 'images') {
        const data = await getBackendMenuItemImage(token, path[1], path[3]);
        return jsonOk(data);
      }
    }

    // Item tags
    if (resource === 'item-tags') {
      if (path.length === 1) {
        const status = searchParams.get('status') as 'active' | 'inactive' | null;
        const data = await listBackendMenuItemTags(token, { status: status ?? undefined });
        return jsonOk(unwrapBackendList(data));
      }
      if (path.length === 2) {
        const data = await getBackendMenuItemTag(token, path[1]);
        return jsonOk(data);
      }
    }

    // Menus
    if (resource === 'menus') {
      if (path.length === 1) {
        const status = searchParams.get('status') as 'active' | 'inactive' | null;
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
        const categories = unwrapBackendList<{ id?: string | number; name?: string }>(
          rawCategories,
        );
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
    }

    // GST Rates
    if (resource === 'gst-rates') {
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
    }

    // Modifier Groups
    if (resource === 'modifier-groups') {
      if (path.length === 1) {
        const status = searchParams.get('status') as 'active' | 'inactive' | null;
        const data = await listBackendModifierGroups(token, { status: status ?? undefined });
        return jsonOk(unwrapBackendList(data));
      }
      if (path.length === 2) {
        const data = await getBackendModifierGroupById(token, path[1]);
        return jsonOk(data);
      }
      if (path.length === 3 && path[2] === 'options') {
        const status = searchParams.get('status') as 'active' | 'inactive' | null;
        const data = await listBackendModifierOptions(token, path[1], {
          status: status ?? undefined,
        });
        return jsonOk(unwrapBackendList(data));
      }
    }

    // Preparation Stations
    if (resource === 'preparation-stations') {
      if (path.length === 1) {
        const status = searchParams.get('status') as 'active' | 'inactive' | null;
        const data = await listBackendPreparationStations(token, { status: status ?? undefined });
        return jsonOk(unwrapBackendList(data));
      }
      if (path.length === 2) {
        const data = await getBackendPreparationStationById(token, path[1]);
        return jsonOk(data);
      }
    }

    // Branch assignments
    if (resource === 'branch-assignments') {
      const data = await listBackendBranchMenuAssignments(token);
      return jsonOk(data);
    }

    return jsonError(`Route not found: ${path.join('/')}`, 404);
  } catch (error) {
    return handleRouteError(error);
  }
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
    // Categories
    if (resource === 'categories') {
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
    }

    // Items
    if (resource === 'items') {
      if (path.length === 1) {
        const isUiInput =
          body &&
          typeof body === 'object' &&
          ('categoryId' in body || 'basePrice' in body || 'dietary' in body);

        let itemPayload: unknown = body;
        if (isUiInput) {
          itemPayload = await buildCreateMenuItemApiPayload(token, body as CreateMenuItemInput, []);
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

        let data = await createBackendMenuItem(token, itemPayload);

        const unwrapped = unwrapMenuItemApi(data) ?? (data as Record<string, unknown>);
        if (unwrapped?.id && unwrapped.status !== 'active') {
          try {
            const activated = await activateBackendMenuItem(token, String(unwrapped.id));
            if (activated) data = activated;
          } catch {
            // Keep the created item
          }
        }
        return jsonOk(data, { status: 201 });
      }
      if (path.length === 3 && path[2] === 'activate') {
        const data = await activateBackendMenuItem(token, path[1]);
        return jsonOk(data);
      }
      if (path.length === 3 && path[2] === 'deactivate') {
        const data = await deactivateBackendMenuItem(token, path[1]);
        return jsonOk(data);
      }
      // items/[itemId]/variants
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
      // items/[itemId]/images
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
    }

    // Item tags
    if (resource === 'item-tags') {
      if (path.length === 1) {
        const data = await createBackendMenuItemTag(token, body);
        return jsonOk(data, { status: 201 });
      }
    }

    // Menus
    if (resource === 'menus') {
      if (path.length === 1) {
        const menuPayload =
          body && typeof body === 'object' && 'menuType' in body
            ? toCreateRestaurantMenuPayload(
                body as Parameters<typeof toCreateRestaurantMenuPayload>[0],
              )
            : body;
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
        const categories = unwrapBackendList<{ id?: string | number; name?: string }>(
          rawCategories,
        );
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
    }

    // GST Rates
    if (resource === 'gst-rates') {
      if (path.length === 1) {
        const data = await createBackendGstRate(token, body);
        return jsonOk(data, { status: 201 });
      }
    }

    // Modifier Groups
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

    // Preparation Stations
    if (resource === 'preparation-stations') {
      if (path.length === 1) {
        const data = await createBackendPreparationStation(token, body);
        return jsonOk(data, { status: 201 });
      }
    }

    // Branch assignments
    if (resource === 'branch-assignments') {
      const branchId = Number(body.branchId);
      const menuId = Number(body.menuId);
      const data = await assignBackendMenuToBranch(token, branchId, menuId);
      return jsonOk(data);
    }

    // Branches sync
    if (resource === 'branches' && path.length === 3 && path[2] === 'sync') {
      const branchId = Number(path[1]);
      const assignmentId = Number(body.assignmentId ?? 0);
      const data = await syncBackendBranchMenu(token, branchId, assignmentId);
      return jsonOk(data);
    }

    return jsonError(`Route not found: ${path.join('/')}`, 404);
  } catch (error) {
    return handleRouteError(error);
  }
}

// -----------------------------------------------------------------------------
// PATCH Handler
// -----------------------------------------------------------------------------

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAccessToken();
  if (auth.error) return auth.error;
  const token = auth.token;

  const { path } = await context.params;
  const resource = path[0];
  const body = await request.json().catch(() => ({}));

  try {
    // Categories
    if (resource === 'categories' && path.length === 2) {
      const data = await updateBackendMenuCategory(token, path[1], body);
      return jsonOk(data);
    }

    // Items
    if (resource === 'items') {
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

        const updatePayload = isUiInput
          ? await buildUpdateMenuItemApiPayload(token, body as Partial<CreateMenuItemInput>, [])
          : body;

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
    }

    // Item tags
    if (resource === 'item-tags' && path.length === 2) {
      const data = await updateBackendMenuItemTag(token, path[1], body);
      return jsonOk(data);
    }

    // Menus
    if (resource === 'menus') {
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
            ? toUpdateRestaurantMenuPayload(
                body as Parameters<typeof toUpdateRestaurantMenuPayload>[0],
              )
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
    }

    // Modifier Groups
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

    // Preparation Stations
    if (resource === 'preparation-stations' && path.length === 2) {
      const data = await updateBackendPreparationStationById(token, path[1], body);
      return jsonOk(data);
    }

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
      await unassignBackendBranchMenu(token, path[1], path[3]);
      return jsonOk({ deleted: true });
    }

    return jsonError(`Route not found: ${path.join('/')}`, 404);
  } catch (error) {
    return handleRouteError(error);
  }
}
