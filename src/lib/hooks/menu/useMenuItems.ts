'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useQuery } from '@/lib/hooks/api/useQuery';

import {
  buildCreateMenuItemV2FormData,
  buildUpdateMenuItemV2FormData,
} from '@/lib/helpers/createMenuItemV2Body';
import {
  buildMenuItemStatusChangeBody,
  type MenuCataloguePageScope,
} from '@/lib/helpers/menuBranchContext';
import type { CreateMenuItemFormValues } from '@/lib/schemas/menu/menuCreationSchema';
import {
  parseMenuItemList,
  parseMenuItemWriteResponse,
  parseMenuItemRecord,
  type MenuItemListParams,
  type MenuItemResponse,
} from '@/lib/schemas/menu/menuItemsSchema';
import { api } from '@/services/api/browserClient';
import {
  restaurantMenuItemActivatePath,
  restaurantMenuItemDeactivatePath,
  restaurantMenuItemPath,
  restaurantMenuItemsPath,
} from '@/services/api/ApiUrlsV1';
import { restaurantMenuItemV2Path, restaurantMenuItemsV2Path } from '@/services/api/ApiUrlsV2';

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
    ...(params?.search?.trim() ? { search: params.search.trim() } : {}),
    ...(params?.branch_id != null ? { branch_id: params.branch_id } : {}),
  };
}

export type UseMenuItemMutationsOptions = Readonly<{
  /** Route scope from menu page config — branch sends branch_id on activate/deactivate. */
  scope?: MenuCataloguePageScope;
}>;

export type CreateMenuItemVariables = Readonly<{
  values: CreateMenuItemFormValues;
  branchId?: number;
  imageFile?: File | null;
  tagNameToId?: ReadonlyMap<string, number>;
  tagIdsByName?: Readonly<Record<string, number>>;
}>;

export type UpdateMenuItemVariables = Readonly<{
  itemId: number;
  values: CreateMenuItemFormValues;
  initialDetail: MenuItemResponse;
  branchId?: number;
  imageFiles?: readonly File[];
  tagNameToId?: ReadonlyMap<string, number>;
  tagIdsByName?: Readonly<Record<string, number>>;
}>;

/**
 * List menu items.
 * GET /v1/restaurant/menu/items?status&category_id&dietary_type&search&page&page_size
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
export function useDeactivateMenuItem(options?: UseMenuItemMutationsOptions) {
  const queryClient = useQueryClient();
  const pageScope = options?.scope;

  return useMutation({
    mutationFn: async (itemId: number) => {
      const body = buildMenuItemStatusChangeBody(pageScope);
      await api.post(restaurantMenuItemDeactivatePath(itemId), body);
    },
    onSuccess: async (_data, itemId) => {
      await queryClient.invalidateQueries({ queryKey: ['restaurant', 'menu-items'] });
      await queryClient.invalidateQueries({ queryKey: menuItemQueryKey(itemId) });
    },
  });
}

/**
 * Create menu item.
 * POST /v2/restaurant/menu/items
 */
export function useCreateMenuItem(options?: UseMenuItemMutationsOptions) {
  const queryClient = useQueryClient();
  const pageScope = options?.scope ?? 'company';

  return useMutation({
    mutationFn: async ({
      values,
      branchId,
      imageFile,
      tagNameToId,
      tagIdsByName,
    }: CreateMenuItemVariables) => {
      const formData = buildCreateMenuItemV2FormData({
        values,
        pageScope,
        branchId,
        imageFile,
        tagNameToId,
        tagIdsByName,
      });
      const payload = await api.post(restaurantMenuItemsV2Path(), formData, { silent: true });
      return parseMenuItemWriteResponse(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['restaurant', 'menu-items'] });
    },
  });
}

/**
 * Update menu item.
 * PATCH /v2/restaurant/menu/items/{item_id}
 */
export function useUpdateMenuItem(options?: UseMenuItemMutationsOptions) {
  const pageScope = options?.scope ?? 'company';

  return useMutation({
    mutationFn: async ({
      itemId,
      values,
      initialDetail,
      branchId,
      imageFiles,
      tagNameToId,
      tagIdsByName,
    }: UpdateMenuItemVariables) => {
      const formData = buildUpdateMenuItemV2FormData({
        values,
        initialDetail,
        pageScope,
        branchId,
        imageFiles,
        tagNameToId,
        tagIdsByName,
      });
      const payload = await api.patch(restaurantMenuItemV2Path(itemId), formData, { silent: true });
      return parseMenuItemWriteResponse(payload);
    },
  });
}

/**
 * Activate or deactivate a menu item (Menu Availability toggle).
 * POST .../items/{id}/activate | .../deactivate
 */
export function useSetMenuItemActive(options?: UseMenuItemMutationsOptions) {
  const queryClient = useQueryClient();
  const pageScope = options?.scope;

  return useMutation({
    mutationFn: async ({ itemId, active }: { itemId: number; active: boolean }) => {
      const path = active
        ? restaurantMenuItemActivatePath(itemId)
        : restaurantMenuItemDeactivatePath(itemId);
      const body = buildMenuItemStatusChangeBody(pageScope);
      await api.post(path, body);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['restaurant', 'menu-items'] });
      await queryClient.invalidateQueries({ queryKey: menuItemQueryKey(variables.itemId) });
    },
  });
}
