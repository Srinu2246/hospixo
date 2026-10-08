import { toCreateMenuCategoryPayload } from '@/features/menu/api/menu-categories-map';
import { toUpdateMenuItemImagePayload } from '@/features/menu/api/menu-item-images-map';
import {
  toCreateMenuItemTagPayload,
  toUpdateMenuItemTagPayload,
} from '@/features/menu/api/menu-item-tags-map';
import {
  toCreateMenuItemVariantPayload,
  toUpdateMenuItemVariantPayload,
} from '@/features/menu/api/menu-item-variants-map';
import {
  buildTagDefinitionsById,
  enrichMenuItemFromInput,
  mapMenuItemApi,
  unwrapMenuItemApi,
} from '@/features/menu/api/menu-items-map';
import type { MenuScope } from '@/features/menu/lib/menu-store';
import type {
  CreateCategoryInput,
  CreateMenuItemInput,
  ItemImage,
  ItemVariant,
  MenuCategory,
  MenuItem,
  MenuItemTag,
} from '@/features/menu/types/menu';
import type { MenuItemApi, MenuItemId } from '@/features/menu/types/menu-item-api';
import type { MenuItemImageId } from '@/features/menu/types/menu-item-image-api';
import type { MenuItemVariantId } from '@/features/menu/types/menu-item-variant-api';
import type { RestaurantMenu } from '@/features/menu/types/restaurant-menu';
import type { ModifierGroup } from '@/features/modifier-groups/types/modifier-group';
import type { PreparationStation } from '@/features/preparation-stations/types/preparation-station';
import {
  ApiRequestError,
  formatApiValidationDetails,
  resolveApiErrorMessage,
} from '@/lib/api/errors';
import type { ApiErrorPayload } from '@/types/api';
import { ApiError, clientApi } from '@/lib/client-api';
import { fetchGstRatesClient } from '@/features/gst-rates/api/gst-rates';

export type BranchMenuAssignmentRow = Readonly<{
  branchId: number;
  branchName: string;
  assignmentId: number | null;
  menuId: number | null;
  menuName: string | null;
  menuType: string | null;
  status: string | null;
}>;

export type BranchMenuAssignmentsPayload = Readonly<{
  assignments: readonly BranchMenuAssignmentRow[];
  menus: readonly RestaurantMenu[];
}>;

type MenuApiResponse<T> = {
  success?: boolean;
  data?: T;
};

function safeUnwrapArray<T>(payload: unknown): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as T[];
  if (typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items as T[];
    if (Array.isArray(obj.data)) return safeUnwrapArray<T>(obj.data);
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

function normalizeMenuCategory(raw: unknown): MenuCategory {
  const cat = (raw ?? {}) as Record<string, unknown>;
  const statusRaw = String(cat.status ?? '').toLowerCase();
  const status: MenuCategory['status'] = statusRaw === 'inactive' ? 'Inactive' : 'Active';
  return {
    id: String(cat.id ?? ''),
    name: String(cat.name ?? ''),
    parentId:
      cat.parentId != null
        ? String(cat.parentId)
        : cat.parent_id != null
          ? String(cat.parent_id)
          : undefined,
    status,
    description: cat.description != null ? String(cat.description) : undefined,
    displayOrder:
      typeof cat.displayOrder === 'number'
        ? cat.displayOrder
        : typeof cat.display_order === 'number'
          ? cat.display_order
          : undefined,
    scope: (cat.scope as 'company' | 'branch') ?? 'company',
    assignBranchId:
      cat.assignBranchId != null
        ? String(cat.assignBranchId)
        : cat.assign_branch_id != null
          ? String(cat.assign_branch_id)
          : undefined,
  };
}

function normalizeMenuItemTag(raw: unknown): MenuItemTag {
  const tag = (raw ?? {}) as Record<string, unknown>;
  const statusRaw = String(tag.status ?? '').toLowerCase();
  return {
    id: String(tag.id ?? ''),
    name: String(tag.name ?? ''),
    code: String(tag.code ?? ''),
    status: statusRaw === 'inactive' ? 'Inactive' : 'Active',
  };
}

function normalizeMenuItem(raw: unknown): MenuItem {
  const item = (raw ?? {}) as Record<string, unknown>;
  if ('categoryId' in item && typeof item.categoryId === 'string') {
    return item as unknown as MenuItem;
  }
  return mapMenuItemApi(item as unknown as MenuItemApi);
}

function normalizePreparationStation(raw: unknown): PreparationStation {
  const s = (raw ?? {}) as Record<string, unknown>;
  return {
    id: String(s.id ?? ''),
    name: String(s.name ?? ''),
    code: String(s.code ?? ''),
    status: String(s.status ?? 'active').toLowerCase() === 'inactive' ? 'inactive' : 'active',
    createdAt:
      s.createdAt != null
        ? String(s.createdAt)
        : s.created_at != null
          ? String(s.created_at)
          : undefined,
    updatedAt:
      s.updatedAt != null
        ? String(s.updatedAt)
        : s.updated_at != null
          ? String(s.updated_at)
          : undefined,
  };
}

function normalizeModifierGroup(raw: unknown): ModifierGroup {
  const g = (raw ?? {}) as Record<string, unknown>;
  return {
    id: String(g.id ?? ''),
    name: String(g.name ?? ''),
    minSelect: Number(g.minSelect ?? g.min_select ?? 0),
    maxSelect: Number(g.maxSelect ?? g.max_select ?? 1),
    isRequired: Boolean(g.isRequired ?? g.is_required ?? false),
    status: String(g.status ?? 'active').toLowerCase() === 'inactive' ? 'inactive' : 'active',
    createdAt:
      g.createdAt != null
        ? String(g.createdAt)
        : g.created_at != null
          ? String(g.created_at)
          : undefined,
    updatedAt:
      g.updatedAt != null
        ? String(g.updatedAt)
        : g.updated_at != null
          ? String(g.updated_at)
          : undefined,
  };
}

function normalizeItemVariant(raw: unknown): ItemVariant {
  const v = (raw ?? {}) as Record<string, unknown>;
  return {
    id: String(v.id ?? ''),
    size: String(v.size ?? v.name ?? ''),
    price: Number(v.price ?? v.price_adjustment ?? v.final_price ?? 0),
    status: String(v.status ?? 'active').toLowerCase() === 'inactive' ? 'Inactive' : 'Active',
  };
}

function normalizeItemImage(raw: unknown): ItemImage {
  const img = (raw ?? {}) as Record<string, unknown>;
  return {
    id: String(img.id ?? ''),
    url: String(img.url ?? img.image_url ?? ''),
    isPrimary: Boolean(img.isPrimary ?? img.is_primary ?? false),
    sortOrder:
      typeof img.sortOrder === 'number'
        ? img.sortOrder
        : typeof img.displayOrder === 'number'
          ? img.displayOrder
          : typeof img.sort_order === 'number'
            ? img.sort_order
            : undefined,
    storageKey:
      img.storageKey != null
        ? String(img.storageKey)
        : img.storage_key != null
          ? String(img.storage_key)
          : undefined,
    mimeType:
      img.mimeType != null
        ? String(img.mimeType)
        : img.mime_type != null
          ? String(img.mime_type)
          : undefined,
    status: String(img.status ?? 'active').toLowerCase() === 'inactive' ? 'Inactive' : 'Active',
  };
}

let inFlightCategories: Promise<readonly MenuCategory[]> | null = null;
let cachedCategories: readonly MenuCategory[] | null = null;

let inFlightTags: Promise<readonly MenuItemTag[]> | null = null;
let cachedTags: readonly MenuItemTag[] | null = null;

let inFlightItems: Promise<readonly MenuItem[]> | null = null;
let cachedItems: readonly MenuItem[] | null = null;

let inFlightGstPercentByRateId: Promise<Record<number, number>> | null = null;
let cachedGstPercentByRateId: Record<number, number> | null = null;

let inFlightPreparationStations: Promise<readonly PreparationStation[]> | null = null;
let cachedPreparationStations: readonly PreparationStation[] | null = null;

let inFlightModifierGroups: Promise<readonly ModifierGroup[]> | null = null;
let cachedModifierGroups: readonly ModifierGroup[] | null = null;

let inFlightBranchAssignments: Promise<BranchMenuAssignmentsPayload> | null = null;
let cachedBranchAssignments: BranchMenuAssignmentsPayload | null = null;

const inFlightVariantsByItemId = new Map<string, Promise<readonly ItemVariant[]>>();
const cachedVariantsByItemId = new Map<string, readonly ItemVariant[]>();

const inFlightImagesByItemId = new Map<string, Promise<readonly ItemImage[]>>();
const cachedImagesByItemId = new Map<string, readonly ItemImage[]>();

export function clearMenuCache(): void {
  inFlightCategories = null;
  cachedCategories = null;
  inFlightTags = null;
  cachedTags = null;
  inFlightItems = null;
  cachedItems = null;
  inFlightGstPercentByRateId = null;
  cachedGstPercentByRateId = null;
  inFlightPreparationStations = null;
  cachedPreparationStations = null;
  inFlightModifierGroups = null;
  cachedModifierGroups = null;
  inFlightBranchAssignments = null;
  cachedBranchAssignments = null;
  inFlightVariantsByItemId.clear();
  cachedVariantsByItemId.clear();
  inFlightImagesByItemId.clear();
  cachedImagesByItemId.clear();
}

export async function fetchBranchMenuAssignments(
  options: { forceRefresh?: boolean } = {},
): Promise<BranchMenuAssignmentsPayload> {
  if (!options.forceRefresh && cachedBranchAssignments !== null) {
    return cachedBranchAssignments;
  }
  if (!options.forceRefresh && inFlightBranchAssignments !== null) {
    return inFlightBranchAssignments;
  }

  inFlightBranchAssignments = (async () => {
    try {
      const response = await clientApi.get<MenuApiResponse<BranchMenuAssignmentsPayload>>(
        '/menu/branch-assignments',
      );
      const data = response.data ?? (response as unknown as BranchMenuAssignmentsPayload);
      const payload: BranchMenuAssignmentsPayload = {
        assignments: data?.assignments ?? [],
        menus: data?.menus ?? [],
      };
      cachedBranchAssignments = payload;
      return payload;
    } catch (err) {
      cachedBranchAssignments = null;
      throw err;
    } finally {
      inFlightBranchAssignments = null;
    }
  })();

  return inFlightBranchAssignments;
}

export async function syncBranchMenuForOutlet(branchId: string): Promise<void> {
  const data = await fetchBranchMenuAssignments();
  const assignment = data.assignments.find(
    (row) => String(row.branchId) === branchId && row.assignmentId != null,
  );
  if (!assignment?.assignmentId) return;

  await clientApi.post(`/menu/branches/${branchId}/sync`, {
    assignmentId: assignment.assignmentId,
  });
}

export async function fetchActivePreparationStations(
  options: {
    forceRefresh?: boolean;
  } = {},
): Promise<readonly PreparationStation[]> {
  if (!options.forceRefresh && cachedPreparationStations !== null) {
    return cachedPreparationStations;
  }
  if (!options.forceRefresh && inFlightPreparationStations !== null) {
    return inFlightPreparationStations;
  }

  inFlightPreparationStations = (async () => {
    try {
      const res = await clientApi.get<unknown>('/menu/preparation-stations?status=active');
      const items = safeUnwrapArray<unknown>(res).map(normalizePreparationStation);
      cachedPreparationStations = items;
      return items;
    } catch (err) {
      cachedPreparationStations = null;
      throw err;
    } finally {
      inFlightPreparationStations = null;
    }
  })();

  return inFlightPreparationStations;
}

export async function fetchActiveModifierGroups(
  options: {
    forceRefresh?: boolean;
  } = {},
): Promise<readonly ModifierGroup[]> {
  if (!options.forceRefresh && cachedModifierGroups !== null) {
    return cachedModifierGroups;
  }
  if (!options.forceRefresh && inFlightModifierGroups !== null) {
    return inFlightModifierGroups;
  }

  inFlightModifierGroups = (async () => {
    try {
      const res = await clientApi.get<unknown>('/menu/modifier-groups?status=active');
      const items = safeUnwrapArray<unknown>(res).map(normalizeModifierGroup);
      cachedModifierGroups = items;
      return items;
    } catch (err) {
      cachedModifierGroups = null;
      throw err;
    } finally {
      inFlightModifierGroups = null;
    }
  })();

  return inFlightModifierGroups;
}

export async function fetchMenuItemVariantsByItemId(
  itemId: string,
  options: { forceRefresh?: boolean } = {},
): Promise<readonly ItemVariant[]> {
  if (!options.forceRefresh && cachedVariantsByItemId.has(itemId)) {
    return cachedVariantsByItemId.get(itemId)!;
  }
  const inFlight = inFlightVariantsByItemId.get(itemId);
  if (!options.forceRefresh && inFlight) {
    return inFlight;
  }

  const promise = (async () => {
    try {
      const res = await clientApi.get<unknown>(
        `/menu/items/${encodeURIComponent(itemId)}/variants`,
      );
      const data = safeUnwrapArray<unknown>(res).map(normalizeItemVariant);
      cachedVariantsByItemId.set(itemId, data);
      return data;
    } catch (err) {
      cachedVariantsByItemId.delete(itemId);
      throw err;
    } finally {
      inFlightVariantsByItemId.delete(itemId);
    }
  })();

  inFlightVariantsByItemId.set(itemId, promise);
  return promise;
}

export async function fetchMenuItemImagesByItemId(
  itemId: string,
  options: { forceRefresh?: boolean } = {},
): Promise<readonly ItemImage[]> {
  if (!options.forceRefresh && cachedImagesByItemId.has(itemId)) {
    return cachedImagesByItemId.get(itemId)!;
  }
  const inFlight = inFlightImagesByItemId.get(itemId);
  if (!options.forceRefresh && inFlight) {
    return inFlight;
  }

  const promise = (async () => {
    try {
      const res = await clientApi.get<unknown>(`/menu/items/${encodeURIComponent(itemId)}/images`);
      const data = safeUnwrapArray<unknown>(res).map(normalizeItemImage);
      cachedImagesByItemId.set(itemId, data);
      return data;
    } catch (err) {
      cachedImagesByItemId.delete(itemId);
      throw err;
    } finally {
      inFlightImagesByItemId.delete(itemId);
    }
  })();

  inFlightImagesByItemId.set(itemId, promise);
  return promise;
}

async function fetchBranchNameById(): Promise<Record<string, string>> {
  return {};
}

async function fetchGstPercentByRateId(): Promise<Record<number, number>> {
  if (cachedGstPercentByRateId !== null) return cachedGstPercentByRateId;
  if (inFlightGstPercentByRateId !== null) return inFlightGstPercentByRateId;

  inFlightGstPercentByRateId = (async () => {
    try {
      const rates = await fetchGstRatesClient({ active_only: true });
      const map: Record<number, number> = {};
      for (const rate of rates) {
        const numericId = Number(rate.id);
        if (Number.isFinite(numericId) && typeof rate.totalRate === 'number') {
          map[numericId] = rate.totalRate;
        }
      }
      cachedGstPercentByRateId = map;
      return map;
    } catch {
      cachedGstPercentByRateId = {};
      return {};
    } finally {
      inFlightGstPercentByRateId = null;
    }
  })();

  return inFlightGstPercentByRateId;
}

export async function fetchMenuCategories(
  options: {
    forceRefresh?: boolean;
  } = {},
): Promise<readonly MenuCategory[]> {
  if (!options.forceRefresh && cachedCategories !== null) {
    return cachedCategories;
  }
  if (!options.forceRefresh && inFlightCategories !== null) {
    return inFlightCategories;
  }

  inFlightCategories = (async () => {
    try {
      const res = await clientApi.get<unknown>('/menu/categories');
      const items = safeUnwrapArray<unknown>(res).map(normalizeMenuCategory);
      cachedCategories = items;
      return items;
    } catch (err) {
      cachedCategories = null;
      throw err;
    } finally {
      inFlightCategories = null;
    }
  })();

  return inFlightCategories;
}

export async function fetchMenuItemTags(
  options: {
    forceRefresh?: boolean;
  } = {},
): Promise<readonly MenuItemTag[]> {
  if (!options.forceRefresh && cachedTags !== null) {
    return cachedTags;
  }
  if (!options.forceRefresh && inFlightTags !== null) {
    return inFlightTags;
  }

  inFlightTags = (async () => {
    try {
      const res = await clientApi.get<unknown>('/menu/item-tags?status=active');
      const items = safeUnwrapArray<unknown>(res).map(normalizeMenuItemTag);
      cachedTags = items;
      return items;
    } catch (err) {
      cachedTags = null;
      throw err;
    } finally {
      inFlightTags = null;
    }
  })();

  return inFlightTags;
}

export async function fetchMenuItems(
  options: {
    forceRefresh?: boolean;
  } = {},
): Promise<readonly MenuItem[]> {
  if (!options.forceRefresh && cachedItems !== null) {
    return cachedItems;
  }
  if (!options.forceRefresh && inFlightItems !== null) {
    return inFlightItems;
  }

  inFlightItems = (async () => {
    try {
      const res = await clientApi.get<unknown>('/menu/items');
      const items = safeUnwrapArray<unknown>(res).map(normalizeMenuItem);
      cachedItems = items;
      return items;
    } catch (err) {
      cachedItems = null;
      throw err;
    } finally {
      inFlightItems = null;
    }
  })();

  return inFlightItems;
}

type MenuMutationApiResponse<T> = Readonly<{
  success: boolean;
  data?: T;
  message?: string;
  status?: number;
  details?: unknown;
}>;

function extractBffErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const body = error.body as
      (ApiErrorPayload & { details?: ApiErrorPayload['detail'] }) | undefined;
    const detailSource = body?.detail ?? body?.details;
    const validation = formatApiValidationDetails(detailSource);
    if (validation) return validation;

    const resolved = resolveApiErrorMessage(
      new ApiRequestError(body?.message ?? error.message, error.status, detailSource),
      { fallback },
    );
    if (resolved !== fallback) return resolved;

    if (body?.message && !/^(bad request|request failed)$/i.test(body.message.trim())) {
      return body.message;
    }
    return error.message || fallback;
  }
  return resolveApiErrorMessage(error, { fallback });
}

export async function createMenuCategoryViaBff(
  input: CreateCategoryInput,
  options: Readonly<{
    displayOrder?: number;
    scope?: MenuScope;
    assignBranchId?: number | null;
  }> = {},
): Promise<{ ok: true; data: MenuCategory } | { ok: false; message: string }> {
  try {
    const basePayload = toCreateMenuCategoryPayload(input, {
      displayOrder: options.displayOrder,
      scope: options.scope ?? 'company',
      assignBranchId: options.assignBranchId,
    });
    const payload =
      input.status === 'Inactive' ? { ...basePayload, status: 'Inactive' as const } : basePayload;

    const res = await clientApi.post<MenuMutationApiResponse<MenuCategory>>(
      '/menu/categories',
      payload,
    );
    const data = res?.data ?? (res as unknown as MenuCategory);
    if (!data?.id) {
      return { ok: false, message: res.message ?? 'Failed to create category.' };
    }
    clearMenuCache();
    return { ok: true, data };
  } catch (error) {
    return { ok: false, message: extractBffErrorMessage(error, 'Failed to create category.') };
  }
}

export async function activateMenuCategoryViaBff(
  categoryId: string,
): Promise<{ ok: true; data: MenuCategory } | { ok: false; message: string }> {
  try {
    const res = await clientApi.post<MenuMutationApiResponse<MenuCategory>>(
      `/menu/categories/${encodeURIComponent(categoryId)}/activate`,
      { categoryId, status: 'active' },
    );
    const data = res?.data ?? (res as unknown as MenuCategory);
    clearMenuCache();
    return { ok: true, data };
  } catch (error) {
    return { ok: false, message: extractBffErrorMessage(error, 'Failed to activate category.') };
  }
}

export async function deactivateMenuCategoryViaBff(
  categoryId: string,
): Promise<{ ok: true; data: MenuCategory } | { ok: false; message: string }> {
  try {
    const res = await clientApi.post<MenuMutationApiResponse<MenuCategory>>(
      `/menu/categories/${encodeURIComponent(categoryId)}/deactivate`,
      { categoryId, status: 'inactive' },
    );
    const data = res?.data ?? (res as unknown as MenuCategory);
    clearMenuCache();
    return { ok: true, data };
  } catch (error) {
    return { ok: false, message: extractBffErrorMessage(error, 'Failed to deactivate category.') };
  }
}

export async function createMenuItemViaBff(
  input: CreateMenuItemInput,
  options: Readonly<{
    categoryName?: string;
    tagDefinitions?: readonly MenuItemTag[];
  }> = {},
): Promise<{ ok: true; data: MenuItem } | { ok: false; message: string }> {
  try {
    const { images: rawImages, ...restInput } = input;
    const cleanImages = rawImages?.filter((img) => !img.url.startsWith('blob:'));
    const cleanInput: CreateMenuItemInput = {
      ...restInput,
      imageFiles: undefined,
      image: restInput.image && !restInput.image.startsWith('blob:') ? restInput.image : undefined,
      images: cleanImages && cleanImages.length > 0 ? cleanImages : undefined,
    };

    const res = await clientApi.post<MenuMutationApiResponse<MenuItemApi>>(
      '/menu/items',
      cleanInput,
    );
    const rawData = res.data ?? (res as unknown as MenuItemApi);
    if (!rawData) {
      return { ok: false, message: res.message ?? 'Failed to create menu item.' };
    }

    const itemApi = unwrapMenuItemApi(rawData) ?? (rawData as MenuItemApi);
    if (!itemApi || !itemApi.id) {
      return { ok: false, message: res.message ?? 'Failed to create menu item.' };
    }

    const tagDefinitionsById = buildTagDefinitionsById(options.tagDefinitions ?? []);
    const needsBranchLookup = input.scope === 'branch' && input.assignBranchId != null;
    const needsGstLookup = !input.gst && (itemApi.taxes?.length ?? 0) > 0;
    const [branchNameById, gstPercentByRateId] = await Promise.all([
      needsBranchLookup ? fetchBranchNameById() : Promise.resolve({} as Record<string, string>),
      needsGstLookup ? fetchGstPercentByRateId() : Promise.resolve({} as Record<number, number>),
    ]);
    const mapped = mapMenuItemApi(
      itemApi,
      options.categoryName ?? '',
      tagDefinitionsById,
      branchNameById,
      gstPercentByRateId,
    );
    const data = enrichMenuItemFromInput(mapped, input, options.categoryName ?? '');
    clearMenuCache();
    return { ok: true, data };
  } catch (error) {
    return { ok: false, message: extractBffErrorMessage(error, 'Failed to create menu item.') };
  }
}

export async function updateMenuItemViaBff(
  itemId: MenuItemId,
  updates: Partial<CreateMenuItemInput>,
  existingItem: MenuItem,
  options: Readonly<{
    categoryName?: string;
    tagDefinitions?: readonly MenuItemTag[];
  }> = {},
): Promise<{ ok: true; data: MenuItem } | { ok: false; message: string }> {
  try {
    const res = await clientApi.patch<MenuMutationApiResponse<MenuItemApi>>(
      `/menu/items/${encodeURIComponent(itemId)}`,
      updates,
    );
    const rawData = res.data ?? (res as unknown as MenuItemApi);

    const rawItem = unwrapMenuItemApi(rawData) ?? rawData;
    const tagDefinitionsById = buildTagDefinitionsById(options.tagDefinitions ?? []);
    const effectiveScope = updates.scope ?? existingItem.scope;
    const effectiveBranchId =
      updates.assignBranchId !== undefined ? updates.assignBranchId : existingItem.assignBranchId;
    const branchChanged =
      updates.assignBranchId !== undefined &&
      String(updates.assignBranchId ?? '') !== String(existingItem.assignBranchId ?? '');
    const needsBranchLookup =
      effectiveScope === 'branch' &&
      effectiveBranchId != null &&
      (branchChanged || !existingItem.assignBranchName);

    const branchNameById = needsBranchLookup
      ? await fetchBranchNameById()
      : existingItem.assignBranchId != null && existingItem.assignBranchName
        ? { [String(existingItem.assignBranchId)]: existingItem.assignBranchName }
        : {};

    const resolvedCategoryName = options.categoryName || existingItem.categoryName;
    const mapped = mapMenuItemApi(
      rawItem,
      resolvedCategoryName,
      tagDefinitionsById,
      branchNameById,
      {},
    );
    const hasStatusInResponse =
      typeof rawItem.status === 'string' ||
      typeof (rawItem as { is_active?: boolean }).is_active === 'boolean';

    const data: MenuItem = {
      ...existingItem,
      ...mapped,
      status: hasStatusInResponse ? mapped.status : existingItem.status,
      categoryName: resolvedCategoryName,
      onlineDisplayName:
        updates.onlineDisplayName?.trim() ||
        updates.name?.trim() ||
        existingItem.onlineDisplayName ||
        mapped.name,
      profitMargin: updates.profitMargin ?? existingItem.profitMargin,
      gst: updates.gst ?? existingItem.gst,
      tags: updates.tags ?? (Array.isArray(rawItem.tag_ids) ? mapped.tags : existingItem.tags),
      tagIds:
        updates.tagIds ?? (Array.isArray(rawItem.tag_ids) ? mapped.tagIds : existingItem.tagIds),
      variants: updates.variants ?? existingItem.variants,
      modifiers: updates.modifiers ?? existingItem.modifiers,
      preparationStations:
        updates.preparationStations ??
        (Array.isArray(rawItem.preparation_stations)
          ? mapped.preparationStations
          : existingItem.preparationStations),
      modifierGroups:
        updates.modifierGroups ??
        (Array.isArray(rawItem.modifier_groups)
          ? mapped.modifierGroups
          : existingItem.modifierGroups),
      image: updates.image ?? existingItem.image,
      description: updates.description ?? existingItem.description,
      orderTypes: updates.orderTypes ?? existingItem.orderTypes,
      exposeIn: updates.exposeIn ?? existingItem.exposeIn,
    };
    clearMenuCache();
    return { ok: true, data };
  } catch (error) {
    return { ok: false, message: extractBffErrorMessage(error, 'Failed to update menu item.') };
  }
}

function mergeStatusToggledMenuItem(
  rawData: unknown,
  targetStatus: 'Available' | 'Hidden',
  existingItem?: MenuItem,
  options: Readonly<{
    categoryName?: string;
    tagDefinitions?: readonly MenuItemTag[];
  }> = {},
): MenuItem | null {
  const rawItem = unwrapMenuItemApi(rawData);
  const hasFullItem =
    rawItem != null &&
    rawItem.id != null &&
    typeof rawItem.name === 'string' &&
    rawItem.name.trim().length > 0;

  if (!hasFullItem) {
    return existingItem ? { ...existingItem, status: targetStatus } : null;
  }

  const tagDefinitionsById = buildTagDefinitionsById(options.tagDefinitions ?? []);
  const branchNameById =
    existingItem?.assignBranchId != null && existingItem.assignBranchName
      ? { [String(existingItem.assignBranchId)]: existingItem.assignBranchName }
      : {};
  const resolvedCategoryName = options.categoryName || existingItem?.categoryName || '';
  const mapped = mapMenuItemApi(
    rawItem,
    resolvedCategoryName,
    tagDefinitionsById,
    branchNameById,
    {},
  );

  if (!existingItem) {
    return { ...mapped, status: targetStatus };
  }

  return {
    ...existingItem,
    ...mapped,
    status: targetStatus,
    categoryName: resolvedCategoryName || mapped.categoryName,
    onlineDisplayName: existingItem.onlineDisplayName || mapped.name,
    profitMargin:
      rawItem.profit_margin_percent != null ? mapped.profitMargin : existingItem.profitMargin,
    gst: Array.isArray(rawItem.taxes) && rawItem.taxes.length > 0 ? mapped.gst : existingItem.gst,
    tags: Array.isArray(rawItem.tag_ids) ? mapped.tags : existingItem.tags,
    tagIds: Array.isArray(rawItem.tag_ids) ? mapped.tagIds : existingItem.tagIds,
    preparationStations: Array.isArray(rawItem.preparation_stations)
      ? mapped.preparationStations
      : existingItem.preparationStations,
    modifierGroups: Array.isArray(rawItem.modifier_groups)
      ? mapped.modifierGroups
      : existingItem.modifierGroups,
    variants: existingItem.variants,
    modifiers: existingItem.modifiers,
    images: existingItem.images,
    image: existingItem.image,
    description: rawItem.description !== undefined ? mapped.description : existingItem.description,
    orderTypes:
      rawItem.allow_delivery !== undefined ||
      rawItem.allow_takeaway !== undefined ||
      rawItem.allow_dine_in !== undefined
        ? mapped.orderTypes
        : existingItem.orderTypes,
    exposeIn: rawItem.expose_captain_app !== undefined ? mapped.exposeIn : existingItem.exposeIn,
  };
}

export async function activateMenuItemViaBff(
  itemId: MenuItemId,
  existingItem?: MenuItem,
  options: Readonly<{
    categoryName?: string;
    tagDefinitions?: readonly MenuItemTag[];
  }> = {},
): Promise<{ ok: true; data: MenuItem } | { ok: false; message: string }> {
  try {
    const res = await clientApi.post<MenuMutationApiResponse<MenuItemApi>>(
      `/menu/items/${encodeURIComponent(itemId)}/activate`,
      { itemId, status: 'active' },
    );
    const data = mergeStatusToggledMenuItem(res.data ?? res, 'Available', existingItem, options);
    if (!data) {
      return { ok: false, message: res.message ?? 'Failed to activate menu item.' };
    }
    clearMenuCache();
    return { ok: true, data };
  } catch (error) {
    return { ok: false, message: extractBffErrorMessage(error, 'Failed to activate menu item.') };
  }
}

export async function deactivateMenuItemViaBff(
  itemId: MenuItemId,
  existingItem?: MenuItem,
  options: Readonly<{
    categoryName?: string;
    tagDefinitions?: readonly MenuItemTag[];
  }> = {},
): Promise<{ ok: true; data: MenuItem } | { ok: false; message: string }> {
  try {
    const res = await clientApi.post<MenuMutationApiResponse<MenuItemApi>>(
      `/menu/items/${encodeURIComponent(itemId)}/deactivate`,
      { itemId, status: 'inactive' },
    );
    const data = mergeStatusToggledMenuItem(res.data ?? res, 'Hidden', existingItem, options);
    if (!data) {
      return { ok: false, message: res.message ?? 'Failed to deactivate menu item.' };
    }
    clearMenuCache();
    return { ok: true, data };
  } catch (error) {
    return { ok: false, message: extractBffErrorMessage(error, 'Failed to deactivate menu item.') };
  }
}

export async function createMenuItemVariantViaBff(
  itemId: MenuItemId,
  variant: Pick<ItemVariant, 'size' | 'price'> & {
    displayOrder?: number;
    sku?: string;
    isDefault?: boolean;
  },
  idempotencyKey?: string,
): Promise<{ ok: true; data: ItemVariant } | { ok: false; message: string }> {
  try {
    const payload = toCreateMenuItemVariantPayload(variant);
    const res = await clientApi.post<MenuMutationApiResponse<ItemVariant>>(
      `/menu/items/${encodeURIComponent(itemId)}/variants`,
      payload,
      idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined,
    );
    const data = res.data ?? (res as unknown as ItemVariant);
    if (!data) {
      return { ok: false, message: res.message ?? 'Failed to create menu item variant.' };
    }
    cachedVariantsByItemId.delete(itemId);
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      message: extractBffErrorMessage(error, 'Failed to create menu item variant.'),
    };
  }
}

export async function updateMenuItemVariantViaBff(
  itemId: MenuItemId,
  variantId: MenuItemVariantId,
  updates: Partial<Pick<ItemVariant, 'size' | 'price'>> & {
    displayOrder?: number;
    sku?: string | null;
    isDefault?: boolean;
  },
): Promise<{ ok: true; data: ItemVariant } | { ok: false; message: string }> {
  try {
    const payload = toUpdateMenuItemVariantPayload(updates);
    const res = await clientApi.patch<MenuMutationApiResponse<ItemVariant>>(
      `/menu/items/${encodeURIComponent(itemId)}/variants/${encodeURIComponent(variantId)}`,
      payload,
    );
    const data = res.data ?? (res as unknown as ItemVariant);
    cachedVariantsByItemId.delete(itemId);
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      message: extractBffErrorMessage(error, 'Failed to update menu item variant.'),
    };
  }
}

export async function activateMenuItemVariantViaBff(
  itemId: MenuItemId,
  variantId: MenuItemVariantId,
): Promise<{ ok: true; data: ItemVariant } | { ok: false; message: string }> {
  try {
    const res = await clientApi.post<MenuMutationApiResponse<ItemVariant>>(
      `/menu/items/${encodeURIComponent(itemId)}/variants/${encodeURIComponent(variantId)}/activate`,
      { itemId, variantId, status: 'active' },
    );
    const data = res.data ?? (res as unknown as ItemVariant);
    cachedVariantsByItemId.delete(itemId);
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      message: extractBffErrorMessage(error, 'Failed to activate menu item variant.'),
    };
  }
}

export async function deactivateMenuItemVariantViaBff(
  itemId: MenuItemId,
  variantId: MenuItemVariantId,
): Promise<{ ok: true; data: ItemVariant } | { ok: false; message: string }> {
  try {
    const res = await clientApi.post<MenuMutationApiResponse<ItemVariant>>(
      `/menu/items/${encodeURIComponent(itemId)}/variants/${encodeURIComponent(variantId)}/deactivate`,
      { itemId, variantId, status: 'inactive' },
    );
    const data = res.data ?? (res as unknown as ItemVariant);
    cachedVariantsByItemId.delete(itemId);
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      message: extractBffErrorMessage(error, 'Failed to deactivate menu item variant.'),
    };
  }
}

export async function updateMenuItemImageViaBff(
  itemId: MenuItemId,
  imageId: MenuItemImageId,
  updates: {
    url?: string;
    storageKey?: string;
    mimeType?: string;
    sortOrder?: number;
    isPrimary?: boolean;
    status?: ItemImage['status'];
  },
): Promise<{ ok: true; data: ItemImage } | { ok: false; message: string }> {
  try {
    const payload = toUpdateMenuItemImagePayload(updates);
    const res = await clientApi.patch<MenuMutationApiResponse<ItemImage>>(
      `/menu/items/${encodeURIComponent(itemId)}/images/${encodeURIComponent(imageId)}`,
      payload,
    );
    const data = res.data ?? (res as unknown as ItemImage);
    cachedImagesByItemId.delete(itemId);
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      message: extractBffErrorMessage(error, 'Failed to update menu item image.'),
    };
  }
}

export async function activateMenuItemImageViaBff(
  itemId: MenuItemId,
  imageId: MenuItemImageId,
): Promise<{ ok: true; data: ItemImage } | { ok: false; message: string }> {
  try {
    const res = await clientApi.post<MenuMutationApiResponse<ItemImage>>(
      `/menu/items/${encodeURIComponent(itemId)}/images/${encodeURIComponent(imageId)}/activate`,
      { itemId, imageId, status: 'active' },
    );
    const data = res.data ?? (res as unknown as ItemImage);
    cachedImagesByItemId.delete(itemId);
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      message: extractBffErrorMessage(error, 'Failed to activate menu item image.'),
    };
  }
}

export async function deactivateMenuItemImageViaBff(
  itemId: MenuItemId,
  imageId: MenuItemImageId,
): Promise<{ ok: true; data: ItemImage } | { ok: false; message: string }> {
  try {
    const res = await clientApi.post<MenuMutationApiResponse<ItemImage>>(
      `/menu/items/${encodeURIComponent(itemId)}/images/${encodeURIComponent(imageId)}/deactivate`,
      { itemId, imageId, status: 'inactive' },
    );
    const data = res.data ?? (res as unknown as ItemImage);
    cachedImagesByItemId.delete(itemId);
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      message: extractBffErrorMessage(error, 'Failed to deactivate menu item image.'),
    };
  }
}

export async function createMenuItemTagViaBff(input: {
  name: string;
  code: string;
}): Promise<{ ok: true; data: MenuItemTag } | { ok: false; message: string }> {
  try {
    const payload = toCreateMenuItemTagPayload(input);
    const res = await clientApi.post<MenuMutationApiResponse<MenuItemTag>>(
      '/menu/item-tags',
      payload,
    );
    const data = res.data ?? (res as unknown as MenuItemTag);
    cachedTags = null;
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      message: extractBffErrorMessage(error, 'Failed to create menu item tag.'),
    };
  }
}

export async function updateMenuItemTagViaBff(
  tagId: string,
  updates: { name?: string; code?: string; status?: MenuItemTag['status'] },
): Promise<{ ok: true; data: MenuItemTag } | { ok: false; message: string }> {
  try {
    const payload = toUpdateMenuItemTagPayload(updates);
    const res = await clientApi.patch<MenuMutationApiResponse<MenuItemTag>>(
      `/menu/item-tags/${encodeURIComponent(tagId)}`,
      payload,
    );
    const data = res.data ?? (res as unknown as MenuItemTag);
    cachedTags = null;
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      message: extractBffErrorMessage(error, 'Failed to update menu item tag.'),
    };
  }
}
