'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useQuery } from '@/lib/hooks/api/useQuery';

import {
  parseMenuItemList,
  parseMenuItemRecord,
  type MenuItemListParams,
  type UpdateMenuItemStatusBody,
} from '@/lib/schemas/menu/menuItemsSchema';
import { useToastStore } from '@/stores/toastStore';
import { api } from '@/services/api/browserClient';
import {
  restaurantMenuItemDeactivatePath,
  restaurantMenuItemPath,
  restaurantMenuItemsPath,
} from '@/services/api/ApiUrlsV1';

export const menuItemsQueryKey = (params?: MenuItemListParams) =>
  ['restaurant', 'menu-items', params ?? {}] as const;

export const menuItemQueryKey = (itemId: number | undefined) =>
  ['restaurant', 'menu-item', itemId] as const;

function listParams(params?: MenuItemListParams) {
  return {
    page: params?.page ?? 1,
    page_size: params?.page_size ?? 100,
    ...(params?.status ? { status: params.status } : {}),
    ...(params?.category_id != null ? { category_id: params.category_id } : {}),
    ...(params?.dietary_type ? { dietary_type: params.dietary_type } : {}),
  };
}

/**
 * List menu items.
 * GET /v1/restaurant/menu/items?status&category_id&dietary_type&page&page_size
 */
export function useMenuItems(params?: MenuItemListParams) {
  return useQuery({
    queryKey: menuItemsQueryKey(params),
    queryFn: async ({ signal }) => {
      const payload = await api.get(restaurantMenuItemsPath(), listParams(params), signal);
      return parseMenuItemList(payload);
    },
  });
}

/**
 * Single menu item.
 * GET /v1/restaurant/menu/items/{item_id}
 */
export function useMenuItem(itemId: number | undefined) {
  return useQuery({
    queryKey: menuItemQueryKey(itemId),
    enabled: typeof itemId === 'number' && Number.isFinite(itemId) && itemId > 0,
    queryFn: async ({ signal }) => {
      const payload = await api.get(restaurantMenuItemPath(itemId as number), undefined, signal);
      return parseMenuItemRecord(payload);
    },
  });
}

/**
 * Soft-delete / deactivate menu item.
 * POST /v1/restaurant/menu/items/{item_id}/deactivate
 */
export function useDeactivateMenuItem() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.show);

  return useMutation({
    mutationFn: async (itemId: number) => {
      await api.post(restaurantMenuItemDeactivatePath(itemId), {});
    },
    onSuccess: async (_data, itemId) => {
      await queryClient.invalidateQueries({ queryKey: ['restaurant', 'menu-items'] });
      await queryClient.invalidateQueries({ queryKey: menuItemQueryKey(itemId) });
      showToast('Menu item deleted successfully.', 'success');
    },
  });
}

export type UpdateMenuItemStatusVariables = {
  itemId: number;
  body: UpdateMenuItemStatusBody;
};

/**
 * Set menu item active / inactive (Menu Availability toggle).
 * PATCH /v1/restaurant/menu/items/{item_id}
 */
export function useUpdateMenuItemStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, body }: UpdateMenuItemStatusVariables) => {
      const payload = await api.patch(restaurantMenuItemPath(itemId), body);
      return parseMenuItemRecord(payload);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['restaurant', 'menu-items'] });
      await queryClient.invalidateQueries({ queryKey: menuItemQueryKey(variables.itemId) });
    },
  });
}
