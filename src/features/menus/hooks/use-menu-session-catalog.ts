'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchMenuCategories, fetchMenuItems } from '@/lib/menu-cache';
import type { MenuCategory, MenuItem } from '@/features/menu/types/menu';
import {
  menuCategoriesQueryKey,
  menuItemsQueryKey,
} from '@/features/menu/hooks/menu-management-query-keys';

export function useMenuSessionCategoriesQuery(enabled = true) {
  return useQuery({
    queryKey: menuCategoriesQueryKey,
    queryFn: () => fetchMenuCategories({ forceRefresh: true }),
    enabled,
  });
}

export function useMenuSessionItemsQuery(enabled = true) {
  return useQuery({
    queryKey: menuItemsQueryKey,
    queryFn: () => fetchMenuItems({ forceRefresh: true }),
    enabled,
  });
}

export type MenuSessionCatalog = Readonly<{
  categories: MenuCategory[];
  items: MenuItem[];
  isLoading: boolean;
}>;

export function useMenuSessionCatalog(options?: { enabled?: boolean }): MenuSessionCatalog {
  const enabled = options?.enabled ?? true;
  const categoriesQuery = useMenuSessionCategoriesQuery(enabled);
  const itemsQuery = useMenuSessionItemsQuery(enabled);

  return {
    categories: [...(categoriesQuery.data ?? [])],
    items: [...(itemsQuery.data ?? [])],
    isLoading: categoriesQuery.isPending || itemsQuery.isPending,
  };
}
