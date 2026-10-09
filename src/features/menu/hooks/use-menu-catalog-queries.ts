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
import type { MenuItem } from '../types/menu';
import { tenancyContent } from '@/config/auth/tenancy';
import type { CompanyMenuCreationInitialData } from '../context/menu-context';
import { enrichMenuItemsWithCatalog } from '../lib/enrich-menu-catalog-items';
import {
  getBranchDeactivatedCategoryIds,
  getBranchItemOverrides,
  matchesBranchScopeFilter,
  requiresBranchMenuItemOverride,
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
      const branchDeactivated = getBranchDeactivatedCategoryIds(branchIdForScope);
      return list
        .filter((category) => matchesBranchScopeFilter(category, branchIdForScope))
        .map((category) => {
          if (branchDeactivated.has(category.id)) {
            return { ...category, status: 'Inactive' as const };
          }
          return category;
        });
    }
    return [...list];
  }, [branchIdForScope, categoriesQuery.data, scope]);

  const tagDefinitions = useMemo(() => [...(tagsQuery.data ?? [])], [tagsQuery.data]);

  const items = useMemo(() => {
    const enriched = enrichMenuItemsWithCatalog(itemsQuery.data ?? [], categories, tagDefinitions);
    if (scope === 'branch' && branchIdForScope) {
      const scopedItems = enriched.filter((item) =>
        matchesBranchScopeFilter(item, branchIdForScope),
      );
      const overrides = branchOverridesQuery.data ?? [];
      const localOverrides = getBranchItemOverrides(branchIdForScope);
      return scopedItems.map((item) => {
        const local =
          localOverrides[String(item.id)] ??
          (item.code ? localOverrides[String(item.code)] : undefined);
        let currentItem = item;
        if (requiresBranchMenuItemOverride(item, branchIdForScope)) {
          const match = overrides.find((ov) => {
            const rawOv = ov as Record<string, unknown>;
            const ovMenuItemId = String(ov.menu_item_id ?? '').trim();
            const ovId = String(ov.id ?? '').trim();
            const nestedId =
              rawOv.menu_item && typeof rawOv.menu_item === 'object'
                ? String((rawOv.menu_item as { id?: unknown }).id ?? '').trim()
                : '';
            const targetId = String(item.id).trim();
            if (ovMenuItemId === targetId || ovId === targetId || nestedId === targetId)
              return true;
            const ovName = String(rawOv.name ?? (rawOv.menu_item as { name?: string })?.name ?? '')
              .trim()
              .toLowerCase();
            const ovCode = String(rawOv.code ?? (rawOv.menu_item as { code?: string })?.code ?? '')
              .trim()
              .toLowerCase();
            if (item.code && ovCode && ovCode === item.code.trim().toLowerCase()) return true;
            if (item.name && ovName && ovName === item.name.trim().toLowerCase()) return true;
            return false;
          });
          if (match) {
            currentItem = applyBranchMenuItemOverrideToMenuItem(item, match);
          }
        }
        if (local) {
          const resolvedStatus: MenuItem['status'] | undefined =
            local.isAvailable !== undefined
              ? local.isAvailable
                ? 'Available'
                : 'Out of Stock'
              : local.status === 'Available' || local.status === 'available'
                ? 'Available'
                : local.status === 'Out of Stock' ||
                    local.status === '86d' ||
                    local.status === 'Hidden' ||
                    local.status === 'hidden'
                  ? 'Out of Stock'
                  : undefined;

          return {
            ...currentItem,
            ...(local.basePrice !== undefined ? { basePrice: local.basePrice } : {}),
            ...(resolvedStatus !== undefined ? { status: resolvedStatus } : {}),
            ...(local.orderTypes !== undefined ? { orderTypes: local.orderTypes } : {}),
            ...(local.dietary !== undefined ? { dietary: local.dietary } : {}),
          };
        }
        return currentItem;
      });
    }
    return enriched;
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

  const isHydrated =
    !queryEnabled ||
    ((categoriesQuery.isFetched || Boolean(initialData?.categories?.length)) &&
      (itemsQuery.isFetched || Boolean(initialData?.items?.length)) &&
      (scope !== 'company' && scope !== 'branch'
        ? true
        : tagsQuery.isFetched || Boolean(initialData?.tags?.length)));

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
