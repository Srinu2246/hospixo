'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  fetchActiveModifierGroups,
  fetchActivePreparationStations,
  fetchMenuCategories,
  fetchMenuItemTags,
  fetchMenuItems,
} from '@/lib/menu-cache';
import type { MenuPageConfig } from '../config/menu-page-config';
import type { MenuCategory, MenuItem, MenuItemTag } from '../types/menu';
import type { BranchMenuItemOverrideApi } from '../types/branch-menu-item-api';
import { tenancyContent } from '@/config/auth/tenancy';
import type { CompanyMenuCreationInitialData } from '../context/menu-context';
import { enrichMenuItemsWithCatalog } from '../lib/enrich-menu-catalog-items';
import {
  getBranchDeactivatedCategoryIds,
  getBranchItemOverrides,
  matchesBranchScopeFilter,
  requiresBranchMenuItemOverride,
  type LocalBranchItemOverride,
} from '../lib/menu-scope';
import {
  menuCategoriesQueryKey,
  menuItemTagsQueryKey,
  menuItemsQueryKey,
  menuModifierGroupsQueryKey,
  menuPreparationStationsQueryKey,
} from './menu-management-query-keys';
import { useBranchMenusQuery } from './use-branch-menus-query';
import { useBranchMenuItemsQuery } from './use-branch-menu-item-queries';
import { pickActiveBranchMenuAssignment } from '../lib/resolve-active-branch-assignment';
import { applyBranchMenuItemOverrideToMenuItem } from '../api/branch-menu-item-overrides-map';

type UseMenuCatalogQueriesOptions = Readonly<{
  scope: MenuPageConfig['scope'] | undefined;
  enabled: boolean;
  branchFilterId: string | null;
  userBranchId: string | null;
  initialData?: CompanyMenuCreationInitialData;
  skipInitialFetch?: boolean;
}>;

function sanitizeBootstrapError(err: string | null | undefined): string | null {
  if (!err || err === tenancyContent.branchRequiredForFloors) return null;
  return err;
}

function toSafeStr(val: unknown): string {
  if (typeof val === 'string' || typeof val === 'number') {
    return String(val).trim();
  }
  return '';
}

function filterBranchCategories(list: readonly MenuCategory[], branchId: string): MenuCategory[] {
  const branchDeactivated = getBranchDeactivatedCategoryIds(branchId);
  return list
    .filter((category) => matchesBranchScopeFilter(category, branchId))
    .map((category) => {
      if (branchDeactivated.has(category.id)) {
        return { ...category, status: 'Inactive' as const };
      }
      return category;
    });
}

function resolveEffectiveStatus(local: LocalBranchItemOverride): MenuItem['status'] | undefined {
  if (local.isAvailable !== undefined) {
    return local.isAvailable ? 'Available' : 'Out of Stock';
  }
  if (!local.status) return undefined;
  const s = String(local.status).toLowerCase();
  if (s === 'available') return 'Available';
  if (s === 'out of stock' || s === '86d' || s === 'hidden') return 'Out of Stock';
  return undefined;
}

function matchesBranchOverride(item: MenuItem, ov: unknown): boolean {
  if (!ov || typeof ov !== 'object') return false;
  const rawOv = ov as Record<string, unknown>;
  const ovMenuItemId = toSafeStr(rawOv.menu_item_id);
  const ovId = toSafeStr(rawOv.id);
  const nested =
    rawOv.menu_item && typeof rawOv.menu_item === 'object'
      ? (rawOv.menu_item as Record<string, unknown>)
      : null;
  const nestedId = nested ? toSafeStr(nested.id) : '';
  const targetId = String(item.id).trim();

  if (targetId && (ovMenuItemId === targetId || ovId === targetId || nestedId === targetId)) {
    return true;
  }

  const ovName = toSafeStr(rawOv.name ?? nested?.name).toLowerCase();
  const ovCode = toSafeStr(rawOv.code ?? nested?.code).toLowerCase();
  if (item.code && ovCode && ovCode === item.code.trim().toLowerCase()) return true;
  if (item.name && ovName && ovName === item.name.trim().toLowerCase()) return true;
  return false;
}

function applyLocalAndRemoteOverrides(
  item: MenuItem,
  branchId: string,
  overrides: readonly unknown[],
  localOverrides: Record<string, LocalBranchItemOverride>,
): MenuItem {
  const local =
    localOverrides[String(item.id)] ?? (item.code ? localOverrides[String(item.code)] : undefined);
  let currentItem = item;

  if (requiresBranchMenuItemOverride(item, branchId)) {
    const match = overrides.find((ov) => matchesBranchOverride(item, ov));
    if (match) {
      currentItem = applyBranchMenuItemOverrideToMenuItem(
        item,
        match as Parameters<typeof applyBranchMenuItemOverrideToMenuItem>[1],
      );
    }
  }

  if (local) {
    const resolvedStatus = resolveEffectiveStatus(local);
    return {
      ...currentItem,
      ...(local.basePrice !== undefined ? { basePrice: local.basePrice } : {}),
      ...(resolvedStatus !== undefined ? { status: resolvedStatus } : {}),
      ...(local.orderTypes !== undefined ? { orderTypes: local.orderTypes } : {}),
      ...(local.dietary !== undefined ? { dietary: local.dietary } : {}),
    };
  }
  return currentItem;
}

function buildCatalogItems(
  rawItems: readonly MenuItem[],
  categories: MenuCategory[],
  tagDefinitions: MenuItemTag[],
  scope?: string,
  branchIdForScope?: string | null,
  branchOverrides?: readonly BranchMenuItemOverrideApi[],
): MenuItem[] {
  const enriched = enrichMenuItemsWithCatalog(rawItems, categories, tagDefinitions);
  if (scope !== 'branch' || !branchIdForScope) {
    return enriched;
  }
  const scopedItems = enriched.filter((item) => matchesBranchScopeFilter(item, branchIdForScope));
  const overrides = branchOverrides ?? [];
  const localOverrides = getBranchItemOverrides(branchIdForScope);
  return scopedItems.map((item) =>
    applyLocalAndRemoteOverrides(item, branchIdForScope, overrides, localOverrides),
  );
}

function computeIsHydrated(params: {
  queryEnabled: boolean;
  categoriesFetched: boolean;
  hasInitialCategories: boolean;
  itemsFetched: boolean;
  hasInitialItems: boolean;
  scope?: string;
  tagsFetched: boolean;
  hasInitialTags: boolean;
}): boolean {
  if (!params.queryEnabled) return true;
  const categoriesReady = params.categoriesFetched || params.hasInitialCategories;
  const itemsReady = params.itemsFetched || params.hasInitialItems;
  if (!categoriesReady || !itemsReady) return false;

  const requiresTags = params.scope === 'company' || params.scope === 'branch';
  if (!requiresTags) return true;
  return params.tagsFetched || params.hasInitialTags;
}

export function useMenuCatalogQueries(options: UseMenuCatalogQueriesOptions) {
  const { scope, enabled, branchFilterId, userBranchId, initialData } = options;

  const queryEnabled = enabled;
  const staleTime = initialData ? 30 * 1000 : 0;

  const categoriesQuery = useQuery({
    queryKey: menuCategoriesQueryKey,
    queryFn: () => fetchMenuCategories({ forceRefresh: true }),
    enabled: queryEnabled,
    initialData: initialData?.categories?.length ? [...initialData.categories] : undefined,
    staleTime,
  });

  const inheritsCompanyCatalog = scope === 'company' || scope === 'branch';

  const tagsQuery = useQuery({
    queryKey: menuItemTagsQueryKey,
    queryFn: () => fetchMenuItemTags({ forceRefresh: true }),
    enabled: queryEnabled && inheritsCompanyCatalog,
    initialData: initialData?.tags?.length ? [...initialData.tags] : undefined,
    staleTime,
  });

  const itemsQuery = useQuery({
    queryKey: menuItemsQueryKey,
    queryFn: () => fetchMenuItems({ forceRefresh: true }),
    enabled: queryEnabled,
    initialData: initialData?.items?.length ? [...initialData.items] : undefined,
    staleTime,
  });

  const preparationStationsQuery = useQuery({
    queryKey: menuPreparationStationsQueryKey,
    queryFn: () => fetchActivePreparationStations({ forceRefresh: true }),
    enabled: queryEnabled && scope === 'company',
    initialData: initialData?.preparationStations?.length
      ? [...initialData.preparationStations]
      : undefined,
    staleTime,
  });

  const modifierGroupsQuery = useQuery({
    queryKey: menuModifierGroupsQueryKey,
    queryFn: () => fetchActiveModifierGroups({ forceRefresh: true }),
    enabled: queryEnabled && scope === 'company',
    initialData: initialData?.modifierGroups?.length ? [...initialData.modifierGroups] : undefined,
    staleTime,
  });

  const branchIdForScope = scope === 'branch' ? (userBranchId ?? branchFilterId) : branchFilterId;

  const branchMenusQuery = useBranchMenusQuery(
    branchIdForScope,
    queryEnabled && scope === 'branch' && Boolean(branchIdForScope),
  );

  const activeAssignment = useMemo(() => {
    if (scope !== 'branch' || !branchMenusQuery.data?.length) return null;
    return pickActiveBranchMenuAssignment(branchMenusQuery.data);
  }, [branchMenusQuery.data, scope]);

  const activeAssignmentId = activeAssignment?.id;

  const branchOverridesQuery = useBranchMenuItemsQuery(
    branchIdForScope,
    activeAssignmentId,
    { page_size: 100 },
    queryEnabled && scope === 'branch' && Boolean(branchIdForScope && activeAssignmentId),
  );

  const categories = useMemo(() => {
    const list = categoriesQuery.data ?? [];
    if (scope === 'branch' && branchIdForScope) {
      return filterBranchCategories(list, branchIdForScope);
    }
    return [...list];
  }, [branchIdForScope, categoriesQuery.data, scope]);

  const tagDefinitions = useMemo(() => [...(tagsQuery.data ?? [])], [tagsQuery.data]);

  const items = useMemo(() => {
    return buildCatalogItems(
      itemsQuery.data ?? [],
      categories,
      tagDefinitions,
      scope,
      branchIdForScope,
      branchOverridesQuery.data,
    );
  }, [
    branchIdForScope,
    branchOverridesQuery.data,
    categories,
    itemsQuery.data,
    scope,
    tagDefinitions,
  ]);

  const categoriesError =
    sanitizeBootstrapError(initialData?.categoriesError) ??
    (categoriesQuery.error instanceof Error ? categoriesQuery.error.message : null);

  const itemsError =
    sanitizeBootstrapError(initialData?.itemsError) ??
    (itemsQuery.error instanceof Error ? itemsQuery.error.message : null);

  const tagsError =
    initialData?.tagsError ?? (tagsQuery.error instanceof Error ? tagsQuery.error.message : null);

  const isHydrated = computeIsHydrated({
    queryEnabled,
    categoriesFetched: categoriesQuery.isFetched,
    hasInitialCategories: Boolean(initialData?.categories?.length),
    itemsFetched: itemsQuery.isFetched,
    hasInitialItems: Boolean(initialData?.items?.length),
    scope,
    tagsFetched: tagsQuery.isFetched,
    hasInitialTags: Boolean(initialData?.tags?.length),
  });

  const branchDataLoading =
    scope === 'branch' &&
    Boolean(branchIdForScope) &&
    (branchMenusQuery.isPending || (Boolean(activeAssignmentId) && branchOverridesQuery.isPending));

  const catalogsLoading =
    inheritsCompanyCatalog &&
    (preparationStationsQuery.isPending || modifierGroupsQuery.isPending || tagsQuery.isPending);

  return {
    categories,
    items,
    tagDefinitions,
    preparationStations: [...(preparationStationsQuery.data ?? [])],
    modifierGroups: [...(modifierGroupsQuery.data ?? [])],
    categoriesLoading: categoriesQuery.isPending,
    categoriesError,
    itemsLoading: itemsQuery.isPending || branchDataLoading,
    itemsError,
    tagsLoading: inheritsCompanyCatalog ? tagsQuery.isPending : false,
    tagsError: inheritsCompanyCatalog ? tagsError : null,
    catalogsLoading,
    isHydrated,
  };
}
