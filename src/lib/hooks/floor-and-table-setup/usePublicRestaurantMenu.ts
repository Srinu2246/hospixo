'use client';

import { useQuery } from '@tanstack/react-query';

import {
  parsePartialPublicRestaurantMenuQuery,
  parsePublicRestaurantMenuApiResponse,
  type PublicRestaurantMenuData,
  type PublicRestaurantMenuQuery,
} from '@/lib/schemas/floor-and-table-setup/publicRestaurantMenuSchema';
import ApiUrlsV1 from '@/services/api/ApiUrlsV1';
import { api } from '@/services/api/browserClient';

export const publicRestaurantMenuQueryKey = (query: PublicRestaurantMenuQuery) =>
  [
    'api',
    ApiUrlsV1.public.restaurantMenu,
    query.branch_id,
    query.floor_id,
    query.section_id,
    query.menu_id,
  ] as const;

async function fetchPublicRestaurantMenu(
  query: PublicRestaurantMenuQuery,
): Promise<PublicRestaurantMenuData> {
  const payload = await api.get(ApiUrlsV1.public.restaurantMenu, {
    branch_id: query.branch_id,
    floor_id: query.floor_id,
    section_id: query.section_id,
    menu_id: query.menu_id,
  });
  return parsePublicRestaurantMenuApiResponse(payload);
}

export function usePublicRestaurantMenu(query: Partial<PublicRestaurantMenuQuery>) {
  const complete = parsePartialPublicRestaurantMenuQuery(query);

  return useQuery({
    queryKey: complete
      ? publicRestaurantMenuQueryKey(complete)
      : (['public-restaurant-menu', 'incomplete'] as const),
    queryFn: () => {
      if (complete == null) {
        throw new Error('Public menu query is incomplete.');
      }
      return fetchPublicRestaurantMenu(complete);
    },
    enabled: complete != null,
  });
}
