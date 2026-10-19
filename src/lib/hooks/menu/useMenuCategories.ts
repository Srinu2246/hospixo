'use client';

import { useQuery } from '@/lib/hooks/api/useQuery';

import {
  parseMenuCategoryList,
  type MenuCategoryListParams,
} from '@/lib/schemas/menu/menuCategoriesSchema';
import { api } from '@/services/api/browserClient';
import { restaurantMenuCategoriesPath } from '@/services/api/ApiUrlsV1';

export const menuCategoriesQueryKey = (params?: MenuCategoryListParams) =>
  ['restaurant', 'menu-categories', params ?? {}] as const;

function listParams(params?: MenuCategoryListParams) {
  return {
    page: params?.page ?? 1,
    page_size: params?.page_size ?? 100,
    ...(params?.status ? { status: params.status } : {}),
  };
}

/**
 * List menu categories.
 * GET /v1/restaurant/menu/categories?status&page&page_size
 */
export function useMenuCategories(params?: MenuCategoryListParams) {
  return useQuery({
    queryKey: menuCategoriesQueryKey(params),
    queryFn: async ({ signal }) => {
      const payload = await api.get(restaurantMenuCategoriesPath(), listParams(params), signal);
      return parseMenuCategoryList(payload);
    },
  });
}
