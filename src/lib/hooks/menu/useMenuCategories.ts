'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useQuery } from '@/lib/hooks/api/useQuery';

import {
  parseMenuCategoryList,
  parseMenuCategoryRecord,
  type CreateMenuCategoryBody,
  type MenuCategoryListParams,
  type UpdateMenuCategoryBody,
} from '@/lib/schemas/menu/menuCategoriesSchema';
import { useToastStore } from '@/stores/toastStore';
import { api } from '@/services/api/browserClient';
import {
  restaurantMenuCategoriesPath,
  restaurantMenuCategoryActivatePath,
  restaurantMenuCategoryDeactivatePath,
  restaurantMenuCategoryPath,
} from '@/services/api/ApiUrlsV1';

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

/**
 * Create menu category.
 * POST /v1/restaurant/menu/categories
 */
export function useCreateMenuCategory() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.show);

  return useMutation({
    mutationFn: async (body: CreateMenuCategoryBody) => {
      const payload = await api.post(restaurantMenuCategoriesPath(), body);
      return parseMenuCategoryRecord(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['restaurant', 'menu-categories'] });
      showToast('Category created successfully.', 'success');
    },
  });
}

export type UpdateMenuCategoryVariables = {
  categoryId: number;
  body: UpdateMenuCategoryBody;
  /** When false, skip the success toast (e.g. silent status toggle). */
  silent?: boolean;
};

/**
 * Update menu category (edit name/description).
 * PATCH /v1/restaurant/menu/categories/{category_id}
 */
export function useUpdateMenuCategory() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.show);

  return useMutation({
    mutationFn: async ({ categoryId, body }: UpdateMenuCategoryVariables) => {
      const payload = await api.patch(restaurantMenuCategoryPath(categoryId), body);
      return parseMenuCategoryRecord(payload);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['restaurant', 'menu-categories'] });
      if (!variables.silent) {
        showToast('Category updated successfully.', 'success');
      }
    },
  });
}

/**
 * Activate or deactivate a menu category.
 * POST .../categories/{id}/activate | .../deactivate
 */
export function useSetMenuCategoryActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, active }: { categoryId: number; active: boolean }) => {
      const path = active
        ? restaurantMenuCategoryActivatePath(categoryId)
        : restaurantMenuCategoryDeactivatePath(categoryId);
      await api.post(path, {});
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['restaurant', 'menu-categories'] });
    },
  });
}
