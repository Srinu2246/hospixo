'use client';

import { useQuery } from '@tanstack/react-query';

import {
  fetchPublicRestaurantMenuClient,
  isPublicRestaurantMenuQueryComplete,
} from '@/features/floor-table-setup/api/public-restaurant-menu';
import type { PublicRestaurantMenuQuery } from '@/features/floor-table-setup/types/public-restaurant-menu';

export const publicRestaurantMenuQueryKey = (query: PublicRestaurantMenuQuery) =>
  [
    'public-restaurant-menu',
    query.branch_id,
    query.floor_id,
    query.section_id,
    query.menu_id,
  ] as const;

export function usePublicRestaurantMenu(query: Partial<PublicRestaurantMenuQuery>) {
  const complete = isPublicRestaurantMenuQueryComplete(query);

  return useQuery({
    queryKey: complete
      ? publicRestaurantMenuQueryKey(query)
      : (['public-restaurant-menu', 'incomplete'] as const),
    queryFn: () => {
      if (!isPublicRestaurantMenuQueryComplete(query)) {
        throw new Error('Public menu query is incomplete.');
      }
      return fetchPublicRestaurantMenuClient(query);
    },
    enabled: complete,
  });
}
