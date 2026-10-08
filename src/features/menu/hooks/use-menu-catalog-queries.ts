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
import { tenancyContent } from '@/config/auth/tenancy';
import type { CompanyMenuCreationInitialData } from '../context/menu-context';
import { enrichMenuItemsWithCatalog } from '../lib/enrich-menu-catalog-items';
import { matchesBranchScopeFilter } from '../lib/menu-scope';
import {
  menuCategoriesQueryKey,
  menuItemTagsQueryKey,
  menuItemsQueryKey,
  menuModifierGroupsQueryKey,
  menuPreparationStationsQueryKey,
} from './menu-management-query-keys';

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
  const {
    scope,
    enabled,
    branchFilterId,
    userBranchId,
    initialData,
    skipInitialFetch = false,
  } = options;

  const queryEnabled = enabled && !skipInitialFetch;

  const categoriesQuery = useQuery({
    queryKey: menuCategoriesQueryKey,
    queryFn: () => fetchMenuCategories({ forceRefresh: true }),
    enabled: queryEnabled,
    initialData: initialData?.categories?.length ? [...initialData.categories] : undefined,
  });

  const tagsQuery = useQuery({
    queryKey: menuItemTagsQueryKey,
    queryFn: () => fetchMenuItemTags({ forceRefresh: true }),
    enabled: queryEnabled && scope === 'company',
    initialData: initialData?.tags?.length ? [...initialData.tags] : undefined,
  });

  const itemsQuery = useQuery({
    queryKey: menuItemsQueryKey,
    queryFn: () => fetchMenuItems({ forceRefresh: true }),
    enabled: queryEnabled,
    initialData: initialData?.items?.length ? [...initialData.items] : undefined,
  });

  const preparationStationsQuery = useQuery({
    queryKey: menuPreparationStationsQueryKey,
    queryFn: () => fetchActivePreparationStations({ forceRefresh: true }),
    enabled: queryEnabled && scope === 'company',
    initialData: initialData?.preparationStations?.length
      ? [...initialData.preparationStations]
      : undefined,
  });

  const modifierGroupsQuery = useQuery({
    queryKey: menuModifierGroupsQueryKey,
    queryFn: () => fetchActiveModifierGroups({ forceRefresh: true }),
    enabled: queryEnabled && scope === 'company',
    initialData: initialData?.modifierGroups?.length ? [...initialData.modifierGroups] : undefined,
  });

  const branchIdForScope = scope === 'branch' ? (userBranchId ?? branchFilterId) : branchFilterId;

  const categories = useMemo(() => {
    const list = categoriesQuery.data ?? [];
    if (scope === 'branch' && branchIdForScope) {
      return list.filter((category) => matchesBranchScopeFilter(category, branchIdForScope));
    }
    return [...list];
  }, [branchIdForScope, categoriesQuery.data, scope]);

  const tagDefinitions = useMemo(() => [...(tagsQuery.data ?? [])], [tagsQuery.data]);

  const items = useMemo(() => {
    const enriched = enrichMenuItemsWithCatalog(itemsQuery.data ?? [], categories, tagDefinitions);
    if (scope === 'branch' && branchIdForScope) {
      return enriched.filter((item) => matchesBranchScopeFilter(item, branchIdForScope));
    }
    return enriched;
  }, [branchIdForScope, categories, itemsQuery.data, scope, tagDefinitions]);

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
    skipInitialFetch ||
    (categoriesQuery.isFetched &&
      itemsQuery.isFetched &&
      (scope !== 'company' || tagsQuery.isFetched));

  const catalogsLoading =
    scope === 'company' && (preparationStationsQuery.isPending || modifierGroupsQuery.isPending);

  return {
    categories,
    items,
    tagDefinitions,
    preparationStations: [...(preparationStationsQuery.data ?? [])],
    modifierGroups: [...(modifierGroupsQuery.data ?? [])],
    categoriesLoading: categoriesQuery.isPending,
    categoriesError,
    itemsLoading: itemsQuery.isPending,
    itemsError,
    tagsLoading: scope === 'company' ? tagsQuery.isPending : false,
    tagsError: scope === 'company' ? tagsError : null,
    catalogsLoading,
    isHydrated,
  };
}
