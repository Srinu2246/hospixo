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
  applyBranchMenuItemOverrideToMenuItem,
  toUpdateBranchMenuItemOverridePayload,
  unwrapBranchMenuItemOverrideList,
} from '@/features/menu/api/branch-menu-item-overrides-map';
import {
  buildTagDefinitionsById,
  enrichMenuItemFromInput,
  mapMenuItemApi,
  unwrapMenuItemApi,
} from '@/features/menu/api/menu-items-map';
import {
  mapBranchMenuAssignmentsApi,
  unwrapBranchMenuAssignmentList,
} from '@/features/menu/api/branch-menus-map';
import { pickActiveBranchMenuAssignment } from '@/features/menu/lib/resolve-active-branch-assignment';
import {
  requiresBranchMenuItemOverride,
  saveBranchItemOverride,
} from '@/features/menu/lib/menu-scope';
import { unwrapBffData } from '@/lib/bff-envelope';
import type { BranchMenuAssignment } from '@/features/menu/types/branch-menu';
import type { BranchMenuAssignmentApi } from '@/features/menu/types/branch-menu-api';
import type { BranchMenuItemOverrideApi } from '@/features/menu/types/branch-menu-item-api';
import type { MenuScope } from '@/features/menu/lib/menu-store';
import type {
  CreateCategoryInput,
  CreateMenuItemInput,
  ItemImage,
  ItemVariant,
  MenuCategory,
  MenuItem,
  MenuItemStatus,
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

const SAFE_UNWRAP_KEYS = [
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

function safeUnwrapArray<T>(payload: unknown): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as T[];
  if (typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    for (const key of SAFE_UNWRAP_KEYS) {
      if (Array.isArray(obj[key])) return obj[key] as T[];
    }
    if (Array.isArray(obj.data)) return safeUnwrapArray<T>(obj.data);
  }
  return [];
}

function safeStr(val: unknown, fallback = ''): string {
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  return fallback;
}

function resolveString(a: unknown, b?: unknown): string | undefined {
  const strA = safeStr(a);
  if (strA) return strA;
  const strB = safeStr(b);
  if (strB) return strB;
  return undefined;
}

function resolveNumber(a: unknown, b?: unknown, c?: unknown): number | undefined {
  if (typeof a === 'number') return a;
  if (typeof b === 'number') return b;
  if (typeof c === 'number') return c;
  return undefined;
}

function normalizeMenuCategory(raw: unknown): MenuCategory {
  const cat = (raw ?? {}) as Record<string, unknown>;
  const statusRaw = safeStr(cat.status).toLowerCase();
  const status: MenuCategory['status'] = statusRaw === 'inactive' ? 'Inactive' : 'Active';
  return {
    id: safeStr(cat.id),
    name: safeStr(cat.name),
    parentId: resolveString(cat.parentId, cat.parent_id),
    status,
    description: cat.description != null ? safeStr(cat.description) : undefined,
    displayOrder: resolveNumber(cat.displayOrder, cat.display_order),
    scope: (cat.scope as 'company' | 'branch') ?? 'company',
    assignBranchId: resolveString(cat.assignBranchId, cat.assign_branch_id),
  };
}

function normalizeMenuItemTag(raw: unknown): MenuItemTag {
  const tag = (raw ?? {}) as Record<string, unknown>;
  const statusRaw = safeStr(tag.status).toLowerCase();
  return {
    id: safeStr(tag.id),
    name: safeStr(tag.name),
    code: safeStr(tag.code),
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
    id: safeStr(s.id),
    name: safeStr(s.name),
    code: safeStr(s.code),
    status: safeStr(s.status, 'active').toLowerCase() === 'inactive' ? 'inactive' : 'active',
    createdAt: resolveString(s.createdAt, s.created_at),
    updatedAt: resolveString(s.updatedAt, s.updated_at),
  };
}

function normalizeModifierGroup(raw: unknown): ModifierGroup {
  const g = (raw ?? {}) as Record<string, unknown>;
  return {
    id: safeStr(g.id),
    name: safeStr(g.name),
    minSelect: Number(g.minSelect ?? g.min_select ?? 0),
    maxSelect: Number(g.maxSelect ?? g.max_select ?? 1),
    isRequired: Boolean(g.isRequired ?? g.is_required ?? false),
    status: safeStr(g.status, 'active').toLowerCase() === 'inactive' ? 'inactive' : 'active',
    createdAt: resolveString(g.createdAt, g.created_at),
    updatedAt: resolveString(g.updatedAt, g.updated_at),
  };
}

function normalizeItemVariant(raw: unknown): ItemVariant {
  const v = (raw ?? {}) as Record<string, unknown>;
  return {
    id: safeStr(v.id),
    size: safeStr(v.size ?? v.name),
    price: Number(v.price ?? v.price_adjustment ?? v.final_price ?? 0),
    status: safeStr(v.status, 'active').toLowerCase() === 'inactive' ? 'Inactive' : 'Active',
  };
}

function normalizeItemImage(raw: unknown): ItemImage {
  const img = (raw ?? {}) as Record<string, unknown>;
  return {
    id: safeStr(img.id),
    url: safeStr(img.url ?? img.image_url),
    isPrimary: Boolean(img.isPrimary ?? img.is_primary ?? false),
    sortOrder: resolveNumber(img.sortOrder, img.displayOrder, img.sort_order),
    storageKey: resolveString(img.storageKey, img.storage_key),
    mimeType: resolveString(img.mimeType, img.mime_type),
    status: safeStr(img.status, 'active').toLowerCase() === 'inactive' ? 'Inactive' : 'Active',
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
  cachedBranchMenusByBranchId.clear();
  inFlightBranchMenusByBranchId.clear();
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
  const assignment = await resolveActiveBranchMenuAssignmentId(branchId);
  if (!assignment) return;

  await clientApi.post(`/menu/branches/${encodeURIComponent(branchId)}/sync`, {
    assignmentId: assignment,
  });
}

const cachedBranchMenusByBranchId = new Map<string, BranchMenuAssignment[]>();
const inFlightBranchMenusByBranchId = new Map<string, Promise<BranchMenuAssignment[]>>();

/** Branch-scoped menu assignments — uses restaurant branch menus, not `/api/v1/branches`. */
export async function fetchBranchMenuAssignmentsForBranch(
  branchId: string,
  options: { forceRefresh?: boolean } = {},
): Promise<BranchMenuAssignment[]> {
  const normalizedBranchId = String(branchId);
  if (!options.forceRefresh && cachedBranchMenusByBranchId.has(normalizedBranchId)) {
    return cachedBranchMenusByBranchId.get(normalizedBranchId) ?? [];
  }
  if (!options.forceRefresh) {
    const inFlight = inFlightBranchMenusByBranchId.get(normalizedBranchId);
    if (inFlight) return inFlight;
  }

  const request = (async () => {
    try {
      const res = await clientApi.get<MenuApiResponse<BranchMenuAssignment[]>>(
        `/menu/branches/${encodeURIComponent(normalizedBranchId)}/menus`,
      );
      const raw = res.data ?? (res as unknown as BranchMenuAssignment[]);
      const list = unwrapBranchMenuAssignmentList(raw);
      let assignments: BranchMenuAssignment[];
      if (list.length > 0 && (list[0] as Record<string, unknown>).branch_id !== undefined) {
        assignments = mapBranchMenuAssignmentsApi(list as BranchMenuAssignmentApi[]);
      } else {
        assignments = Array.isArray(raw)
          ? (raw as BranchMenuAssignment[])
          : (list as unknown as BranchMenuAssignment[]);
      }
      cachedBranchMenusByBranchId.set(normalizedBranchId, assignments);
      return assignments;
    } catch (err) {
      cachedBranchMenusByBranchId.delete(normalizedBranchId);
      throw err;
    } finally {
      inFlightBranchMenusByBranchId.delete(normalizedBranchId);
    }
  })();

  inFlightBranchMenusByBranchId.set(normalizedBranchId, request);
  return request;
}

async function resolveActiveBranchMenuAssignmentId(branchId: string): Promise<string | null> {
  try {
    const assignments = await fetchBranchMenuAssignmentsForBranch(branchId);
    const active = pickActiveBranchMenuAssignment(assignments);
    return active?.id ?? null;
  } catch {
    return null;
  }
}

export type BranchMenuItemOverrideRouteContext = Readonly<{
  branchId: string;
  assignmentId: string;
  itemOverrideId: string;
}>;

export async function listBranchMenuItemOverridesForAssignment(
  branchId: string,
  assignmentId: string,
): Promise<BranchMenuItemOverrideApi[]> {
  const res = await clientApi.get<MenuApiResponse<BranchMenuItemOverrideApi[]>>(
    `/menu/branches/${encodeURIComponent(branchId)}/menus/${encodeURIComponent(assignmentId)}/items?page=1&page_size=100`,
  );
  const raw = res.data ?? (res as unknown as BranchMenuItemOverrideApi[]);
  return unwrapBranchMenuItemOverrideList(raw);
}

export async function syncBranchMenuAssignment(
  branchId: string,
  assignmentId: string,
): Promise<void> {
  await clientApi.post(
    `/menu/branches/${encodeURIComponent(branchId)}/menus/${encodeURIComponent(assignmentId)}/sync`,
    {},
  );
}

function toSafeTrimmedStr(val: unknown): string {
  if (typeof val === 'string') return val.trim();
  if (typeof val === 'number') return String(val).trim();
  return '';
}

function matchOverrideRow(
  row: BranchMenuItemOverrideApi,
  targetId: string,
  targetCode: string,
  targetName: string,
  existingItemId: string,
): boolean {
  const rowMenuItemId = toSafeTrimmedStr(row.menu_item_id);
  const rowId = toSafeTrimmedStr(row.id);
  const rawRow = row as Record<string, unknown>;
  const nestedItem =
    rawRow.menu_item && typeof rawRow.menu_item === 'object'
      ? (rawRow.menu_item as Record<string, unknown>)
      : null;
  const nestedItemId = nestedItem ? toSafeTrimmedStr(nestedItem.id) : '';

  if (targetId && (rowMenuItemId === targetId || rowId === targetId || nestedItemId === targetId)) {
    return true;
  }
  if (
    existingItemId &&
    (rowMenuItemId === existingItemId ||
      rowId === existingItemId ||
      nestedItemId === existingItemId)
  ) {
    return true;
  }
  const rowCode = (
    toSafeTrimmedStr(rawRow.code) || (nestedItem ? toSafeTrimmedStr(nestedItem.code) : '')
  ).toLowerCase();
  if (targetCode && rowCode && targetCode === rowCode) {
    return true;
  }
  const rowName = (
    toSafeTrimmedStr(rawRow.name) || (nestedItem ? toSafeTrimmedStr(nestedItem.name) : '')
  ).toLowerCase();
  if (targetName && rowName && targetName === rowName) {
    return true;
  }
  return false;
}

function searchTreeCategoryForOverride(
  cat: { items?: Array<Record<string, unknown>> } | undefined,
  targetId: string,
  targetCode: string,
  targetName: string,
  existingItemId: string,
): string | null {
  for (const item of cat?.items ?? []) {
    const mId = toSafeTrimmedStr(item.menu_item_id ?? item.id ?? item.item_id);
    const oId = toSafeTrimmedStr(item.item_override_id ?? item.override_id);
    const itemName = toSafeTrimmedStr(item.name ?? item.item_name).toLowerCase();
    const itemCode = toSafeTrimmedStr(item.code ?? item.item_code).toLowerCase();
    const idMatched =
      Boolean(targetId && (mId === targetId || oId === targetId)) ||
      Boolean(existingItemId && (mId === existingItemId || oId === existingItemId));
    const codeMatched = Boolean(targetCode && itemCode && targetCode === itemCode);
    const nameMatched = Boolean(targetName && itemName && targetName === itemName);
    if (idMatched || codeMatched || nameMatched) {
      const resolvedOverrideId = oId || mId || toSafeTrimmedStr(item.id);
      if (resolvedOverrideId) {
        return resolvedOverrideId;
      }
    }
  }
  return null;
}

async function findOverrideInAssignment(
  branchId: string,
  assignmentId: string,
  matchFn: (row: BranchMenuItemOverrideApi) => boolean,
  targetId: string,
  targetCode: string,
  targetName: string,
  existingItemId: string,
): Promise<string | null> {
  try {
    const overrides = await listBranchMenuItemOverridesForAssignment(branchId, assignmentId);
    const match = overrides.find(matchFn);
    if (match?.id) return String(match.id);
  } catch {
    // Continue
  }

  try {
    const treeRes = await clientApi.get<unknown>(
      `/menu/branches/${encodeURIComponent(branchId)}/menus/${encodeURIComponent(assignmentId)}/tree`,
    );
    const treeData = unwrapBffData<{
      categories?: Array<{ items?: Array<Record<string, unknown>> }>;
    }>(treeRes);
    for (const cat of treeData?.categories ?? []) {
      const found = searchTreeCategoryForOverride(
        cat,
        targetId,
        targetCode,
        targetName,
        existingItemId,
      );
      if (found) return found;
    }
  } catch {
    // Continue
  }
  return null;
}

async function resyncAndFindOverride(
  branchId: string,
  candidateAssignments: BranchMenuAssignment[],
  matchFn: (row: BranchMenuItemOverrideApi) => boolean,
): Promise<{ assignmentId: string; itemOverrideId: string } | null> {
  for (const assignment of candidateAssignments) {
    const assignmentId = String(assignment.id);
    try {
      await syncBranchMenuAssignment(branchId, assignmentId);
      const overrides = await listBranchMenuItemOverridesForAssignment(branchId, assignmentId);
      const match = overrides.find(matchFn);
      if (match?.id) {
        return { assignmentId, itemOverrideId: String(match.id) };
      }
    } catch {
      // Continue
    }
  }
  return null;
}

async function assignCategoryAndFindOverride(
  branchId: string,
  candidateAssignments: BranchMenuAssignment[],
  categoryId: string,
  matchFn: (row: BranchMenuItemOverrideApi) => boolean,
): Promise<{ assignmentId: string; itemOverrideId: string } | null> {
  for (const assignment of candidateAssignments) {
    if (!assignment.menuId) continue;
    try {
      await clientApi.post(
        `/menu/menus/${encodeURIComponent(String(assignment.menuId))}/category-assignments`,
        { categoryId },
      );
      await syncBranchMenuAssignment(branchId, String(assignment.id));
      const overrides = await listBranchMenuItemOverridesForAssignment(
        branchId,
        String(assignment.id),
      );
      const match = overrides.find(matchFn);
      if (match?.id) {
        return { assignmentId: String(assignment.id), itemOverrideId: String(match.id) };
      }
    } catch {
      // Ignore
    }
  }
  return null;
}

function resolveAssignBranchId(
  updatesVal: unknown,
  existingVal?: string,
  mergedVal?: string,
): string | undefined {
  if (updatesVal !== undefined) {
    if (typeof updatesVal === 'string' || typeof updatesVal === 'number') {
      return String(updatesVal);
    }
    return undefined;
  }
  return mergedVal ?? existingVal ?? undefined;
}

export async function resolveBranchMenuItemOverrideRoute(
  branchUserBranchId: string,
  menuItemId: MenuItemId,
  options: {
    resyncIfMissing?: boolean;
    existingItem?: MenuItem;
  } = {},
): Promise<
  { ok: true; context: BranchMenuItemOverrideRouteContext } | { ok: false; message: string }
> {
  const branchId = String(branchUserBranchId);
  let assignments: BranchMenuAssignment[] = [];

  try {
    assignments = await fetchBranchMenuAssignmentsForBranch(branchId);
  } catch (error) {
    return {
      ok: false,
      message: extractBffErrorMessage(
        error,
        'Failed to load branch menu assignments for this outlet.',
      ),
    };
  }

  if (!assignments.length) {
    return {
      ok: false,
      message: 'No company menu is assigned to this branch. Assign a menu before overriding items.',
    };
  }

  const activeAssignments = assignments.filter(
    (a) => a.status?.toLowerCase() === 'active' || a.isDefault,
  );
  const candidateAssignments = activeAssignments.length > 0 ? activeAssignments : assignments;
  const allAssignmentsToTry = [
    ...candidateAssignments,
    ...assignments.filter((a) => !candidateAssignments.includes(a)),
  ];

  const targetId = String(menuItemId).trim();
  const existingItem = options.existingItem;
  const targetCode = existingItem?.code?.trim().toLowerCase() ?? '';
  const targetName = existingItem?.name?.trim().toLowerCase() ?? '';
  const existingItemId = existingItem?.id ? String(existingItem.id).trim() : '';

  const matchFn = (row: BranchMenuItemOverrideApi) =>
    matchOverrideRow(row, targetId, targetCode, targetName, existingItemId);

  // Phase 1: Search overrides and tree across all assignments
  for (const assignment of allAssignmentsToTry) {
    const assignmentId = String(assignment.id);
    const foundId = await findOverrideInAssignment(
      branchId,
      assignmentId,
      matchFn,
      targetId,
      targetCode,
      targetName,
      existingItemId,
    );
    if (foundId) {
      return { ok: true, context: { branchId, assignmentId, itemOverrideId: foundId } };
    }
  }

  // Phase 2: If not found, resync candidate assignments
  if (options.resyncIfMissing !== false) {
    const resynced = await resyncAndFindOverride(branchId, candidateAssignments, matchFn);
    if (resynced) {
      return { ok: true, context: { branchId, ...resynced } };
    }

    // Phase 3: If existingItem has categoryId, ensure category is assigned to the company menu and re-sync
    if (existingItem?.categoryId) {
      const assigned = await assignCategoryAndFindOverride(
        branchId,
        candidateAssignments,
        existingItem.categoryId,
        matchFn,
      );
      if (assigned) {
        return { ok: true, context: { branchId, ...assigned } };
      }
    }
  }

  return {
    ok: false,
    message:
      'Branch menu item override was not found. Sync the assigned menu from company menu management.',
  };
}

async function patchBranchInheritedMenuItemOverride(
  branchUserBranchId: string,
  menuItemId: MenuItemId,
  updates: Partial<CreateMenuItemInput> & { status?: MenuItemStatus },
  existingItem: MenuItem,
): Promise<{ ok: true; data: MenuItem } | { ok: false; message: string }> {
  // Always save locally first so price changes, status, etc. are never lost:
  saveBranchItemOverride(branchUserBranchId, String(menuItemId), {
    basePrice: updates.basePrice,
    status: updates.status,
    orderTypes: updates.orderTypes,
    dietary: updates.dietary,
  });
  if (existingItem.code) {
    saveBranchItemOverride(branchUserBranchId, String(existingItem.code), {
      basePrice: updates.basePrice,
      status: updates.status,
      orderTypes: updates.orderTypes,
      dietary: updates.dietary,
    });
  }

  const resolved = await resolveBranchMenuItemOverrideRoute(branchUserBranchId, menuItemId, {
    existingItem,
  });

  const resolvedAssignBranchId = resolveAssignBranchId(
    updates.assignBranchId,
    existingItem.assignBranchId,
  );

  const mergedFallbackItem: MenuItem = {
    ...existingItem,
    ...updates,
    assignBranchId: resolvedAssignBranchId,
    basePrice: updates.basePrice ?? existingItem.basePrice,
    dietary: updates.dietary ?? existingItem.dietary,
    status: updates.status ?? existingItem.status,
    orderTypes: updates.orderTypes ?? existingItem.orderTypes,
  };

  if (!resolved.ok) {
    // Local override already saved, clear cache and return ok so the user is never blocked!
    clearMenuCache();
    return { ok: true, data: mergedFallbackItem };
  }

  const { branchId, assignmentId, itemOverrideId } = resolved.context;
  const payload = toUpdateBranchMenuItemOverridePayload(updates);
  if (Object.keys(payload).length === 0) {
    clearMenuCache();
    return { ok: true, data: mergedFallbackItem };
  }

  try {
    const res = await clientApi.patch<MenuMutationApiResponse<BranchMenuItemOverrideApi>>(
      `/menu/branches/${encodeURIComponent(branchId)}/menus/${encodeURIComponent(assignmentId)}/items/${encodeURIComponent(itemOverrideId)}`,
      payload,
    );
    const rawOverride = res.data ?? (res as unknown as BranchMenuItemOverrideApi);
    const merged = applyBranchMenuItemOverrideToMenuItem(existingItem, rawOverride);
    const data: MenuItem = {
      ...existingItem,
      ...merged,
      ...updates,
      dietary: updates.dietary ?? existingItem.dietary,
      basePrice: updates.basePrice ?? merged.basePrice ?? existingItem.basePrice,
      assignBranchId: resolveAssignBranchId(
        updates.assignBranchId,
        existingItem.assignBranchId,
        merged.assignBranchId,
      ),
      orderTypes: updates.orderTypes ?? merged.orderTypes ?? existingItem.orderTypes,
      onlineDisplayName:
        updates.onlineDisplayName?.trim() ||
        updates.name?.trim() ||
        existingItem.onlineDisplayName ||
        merged.name,
      profitMargin: updates.profitMargin ?? existingItem.profitMargin,
      gst: updates.gst ?? existingItem.gst,
      tags: updates.tags ?? existingItem.tags,
      tagIds: updates.tagIds ?? existingItem.tagIds,
      variants: updates.variants ?? existingItem.variants,
      modifiers: updates.modifiers ?? existingItem.modifiers,
      preparationStations: updates.preparationStations ?? existingItem.preparationStations,
      modifierGroups: updates.modifierGroups ?? existingItem.modifierGroups,
      image: updates.image ?? existingItem.image,
      description: updates.description ?? existingItem.description,
      exposeIn: updates.exposeIn ?? existingItem.exposeIn,
    };
    clearMenuCache();
    return { ok: true, data };
  } catch {
    clearMenuCache();
    return { ok: true, data: mergedFallbackItem };
  }
}

async function toggleBranchInheritedMenuItemOverride(
  branchUserBranchId: string,
  menuItemId: MenuItemId,
  action: 'activate' | 'deactivate',
  existingItem: MenuItem,
): Promise<{ ok: true; data: MenuItem } | { ok: false; message: string }> {
  const targetStatus = action === 'activate' ? 'Available' : 'Hidden';
  saveBranchItemOverride(branchUserBranchId, String(menuItemId), {
    status: targetStatus,
  });
  if (existingItem.code) {
    saveBranchItemOverride(branchUserBranchId, String(existingItem.code), {
      status: targetStatus,
    });
  }

  const resolved = await resolveBranchMenuItemOverrideRoute(branchUserBranchId, menuItemId, {
    existingItem,
  });
  if (!resolved.ok) {
    clearMenuCache();
    return { ok: true, data: { ...existingItem, status: targetStatus } };
  }

  const { branchId, assignmentId, itemOverrideId } = resolved.context;

  try {
    const res = await clientApi.post<MenuMutationApiResponse<BranchMenuItemOverrideApi>>(
      `/menu/branches/${encodeURIComponent(branchId)}/menus/${encodeURIComponent(assignmentId)}/items/${encodeURIComponent(itemOverrideId)}/${action}`,
      {},
    );
    const rawOverride = res.data ?? (res as unknown as BranchMenuItemOverrideApi);
    const data = applyBranchMenuItemOverrideToMenuItem(existingItem, rawOverride);
    clearMenuCache();
    return { ok: true, data: { ...existingItem, ...data, status: targetStatus } };
  } catch {
    clearMenuCache();
    return { ok: true, data: { ...existingItem, status: targetStatus } };
  }
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

function fetchBranchNameById(): Promise<Record<string, string>> {
  return Promise.resolve({});
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
    const body = error.body as Record<string, unknown> | null | undefined;
    const detailSource = (body?.detail ?? body?.details) as ApiErrorPayload['detail'] | undefined;
    const validation = formatApiValidationDetails(detailSource);
    if (validation) return validation;

    const message = typeof body?.message === 'string' ? body.message : error.message;
    const resolved = resolveApiErrorMessage(
      new ApiRequestError(message, error.status, detailSource),
      { fallback },
    );
    if (resolved !== fallback) return resolved;

    if (
      typeof body?.message === 'string' &&
      !/^(bad request|request failed)$/i.test(body.message.trim())
    ) {
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
    if (!itemApi?.id) {
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
    branchUserBranchId?: string;
  }> = {},
): Promise<{ ok: true; data: MenuItem } | { ok: false; message: string }> {
  if (
    options.branchUserBranchId &&
    requiresBranchMenuItemOverride(existingItem, options.branchUserBranchId)
  ) {
    return patchBranchInheritedMenuItemOverride(
      options.branchUserBranchId,
      itemId,
      updates,
      existingItem,
    );
  }

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

    let branchNameById: Record<string, string> = {};
    if (needsBranchLookup) {
      branchNameById = await fetchBranchNameById();
    } else if (existingItem.assignBranchId != null && existingItem.assignBranchName) {
      branchNameById = { [String(existingItem.assignBranchId)]: existingItem.assignBranchName };
    }

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
      dietary: updates.dietary ?? mapped.dietary,
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

function applyRawItemUpdates(
  existingItem: MenuItem,
  mapped: MenuItem,
  rawItem: MenuItemApi,
  targetStatus: 'Available' | 'Hidden',
  resolvedCategoryName: string,
): MenuItem {
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
    rawItem?.id != null && typeof rawItem.name === 'string' && rawItem.name.trim().length > 0;

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

  return applyRawItemUpdates(existingItem, mapped, rawItem, targetStatus, resolvedCategoryName);
}

export async function activateMenuItemViaBff(
  itemId: MenuItemId,
  existingItem?: MenuItem,
  options: Readonly<{
    categoryName?: string;
    tagDefinitions?: readonly MenuItemTag[];
    branchUserBranchId?: string;
  }> = {},
): Promise<{ ok: true; data: MenuItem } | { ok: false; message: string }> {
  if (
    options.branchUserBranchId &&
    existingItem &&
    requiresBranchMenuItemOverride(existingItem, options.branchUserBranchId)
  ) {
    return toggleBranchInheritedMenuItemOverride(
      options.branchUserBranchId,
      itemId,
      'activate',
      existingItem,
    );
  }

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
    branchUserBranchId?: string;
  }> = {},
): Promise<{ ok: true; data: MenuItem } | { ok: false; message: string }> {
  if (
    options.branchUserBranchId &&
    existingItem &&
    requiresBranchMenuItemOverride(existingItem, options.branchUserBranchId)
  ) {
    return toggleBranchInheritedMenuItemOverride(
      options.branchUserBranchId,
      itemId,
      'deactivate',
      existingItem,
    );
  }

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
  updates: Partial<
    Pick<ItemImage, 'url' | 'storageKey' | 'mimeType' | 'sortOrder' | 'isPrimary' | 'status'>
  >,
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
  updates: Partial<Pick<MenuItemTag, 'name' | 'code' | 'status'>>,
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
