'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useQuery } from '@/lib/hooks/api/useQuery';
import { buildCreateMenuItemTagBody } from '@/lib/helpers/menuItemTagHelpers';
import type { MenuCataloguePageScope } from '@/lib/helpers/menuBranchContext';
import {
  parseMenuItemTagList,
  parseMenuItemTagRecord,
  type CreateMenuItemTagBody,
  type MenuItemTagListParams,
} from '@/lib/schemas/menu/menuItemTagsSchema';
import { api } from '@/services/api/browserClient';
import { restaurantMenuItemTagsPath } from '@/services/api/ApiUrlsV1';

export const menuItemTagsQueryKey = (params?: MenuItemTagListParams) =>
  ['restaurant', 'menu-item-tags', params ?? {}] as const;

function listParams(params?: MenuItemTagListParams) {
  return {
    page: params?.page ?? 1,
    page_size: params?.page_size ?? 100,
    ...(params?.status ? { status: params.status } : {}),
  };
}

/**
 * List menu item tag definitions.
 * GET /v1/restaurant/menu/item-tags?status&page&page_size
 */
export function useMenuItemTags(params?: MenuItemTagListParams) {
  return useQuery({
    queryKey: menuItemTagsQueryKey(params),
    queryFn: async ({ signal }) => {
      const payload = await api.get(restaurantMenuItemTagsPath(), listParams(params), signal);
      return parseMenuItemTagList(payload);
    },
  });
}

export type CreateMenuItemTagVariables = Readonly<{
  name: string;
  code?: string;
  pageScope: MenuCataloguePageScope;
  branchId?: number;
}>;

/**
 * Create menu item tag definition.
 * POST /v1/restaurant/menu/item-tags
 */
export function useCreateMenuItemTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: CreateMenuItemTagVariables) => {
      const body: CreateMenuItemTagBody = buildCreateMenuItemTagBody(variables);
      const payload = await api.post(restaurantMenuItemTagsPath(), body, { silent: true });
      return parseMenuItemTagRecord(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['restaurant', 'menu-item-tags'] });
    },
  });
}
