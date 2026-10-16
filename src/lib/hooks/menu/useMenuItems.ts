'use client';

import { useQuery } from '@tanstack/react-query';

import {
  menuItemsEnvelopeSchema,
  type MenuItemListParams,
  type PagedMenuItemsData,
} from '@/lib/schemas/menu/menuItemsSchema';
import { api } from '@/services/api/browserClient';
import { restaurantMenuItemsPath } from '@/services/api/ApiUrlsV1';
import { ApiError } from '@/services/api/types';

export const menuItemsQueryKey = (params?: MenuItemListParams) =>
  ['restaurant', 'menu-items', params ?? {}] as const;

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
    queryFn: async ({ signal }): Promise<PagedMenuItemsData> => {
      const payload = await api.get(restaurantMenuItemsPath(), listParams(params), signal);
      const parsed = menuItemsEnvelopeSchema.safeParse(payload);
      if (!parsed.success || !parsed.data.success || !parsed.data.data) {
        throw new ApiError('Unexpected menu items response', 502);
      }
      return parsed.data.data;
    },
  });
}
