'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { fetchMenuItemImagesByItemId, fetchMenuItemVariantsByItemId } from '@/lib/menu-cache';
import type { ItemImage, ItemVariant } from '../types/menu';
import type { MenuItemId } from '../types/menu-item-api';
import { menuItemImagesQueryKey, menuItemVariantsQueryKey } from './menu-management-query-keys';

export function useMenuItemResourceQueries() {
  const queryClient = useQueryClient();

  const loadMenuItemVariants = useCallback(
    async (
      itemId: MenuItemId,
    ): Promise<{ ok: boolean; message?: string; data?: ItemVariant[] }> => {
      try {
        const data = await queryClient.fetchQuery({
          queryKey: menuItemVariantsQueryKey(itemId),
          queryFn: () => fetchMenuItemVariantsByItemId(itemId, { forceRefresh: true }),
        });
        return { ok: true, data: [...data] };
      } catch (error) {
        return {
          ok: false,
          message: error instanceof Error ? error.message : 'Failed to load variants.',
        };
      }
    },
    [queryClient],
  );

  const loadMenuItemImages = useCallback(
    async (itemId: MenuItemId): Promise<{ ok: boolean; message?: string; data?: ItemImage[] }> => {
      try {
        const data = await queryClient.fetchQuery({
          queryKey: menuItemImagesQueryKey(itemId),
          queryFn: () => fetchMenuItemImagesByItemId(itemId, { forceRefresh: true }),
        });
        return { ok: true, data: [...data] };
      } catch (error) {
        return {
          ok: false,
          message: error instanceof Error ? error.message : 'Failed to load images.',
        };
      }
    },
    [queryClient],
  );

  const setItemVariantsCache = useCallback(
    (itemId: string, variants: ItemVariant[]) => {
      queryClient.setQueryData(menuItemVariantsQueryKey(itemId), variants);
    },
    [queryClient],
  );

  const setItemImagesCache = useCallback(
    (itemId: string, images: ItemImage[]) => {
      queryClient.setQueryData(menuItemImagesQueryKey(itemId), images);
    },
    [queryClient],
  );

  return {
    loadMenuItemVariants,
    loadMenuItemImages,
    setItemVariantsCache,
    setItemImagesCache,
  };
}
