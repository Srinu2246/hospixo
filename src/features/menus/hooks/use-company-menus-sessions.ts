'use client';

import { useQuery } from '@tanstack/react-query';

import { clientApi } from '@/lib/client-api';
import { unwrapBffData } from '@/lib/bff-envelope';
import type { RestaurantMenu } from '@/features/menu/types/restaurant-menu';

export const companyMenuSessionsQueryKey = ['menus', 'restaurant-menus'] as const;

export async function fetchRestaurantMenus(): Promise<RestaurantMenu[]> {
  const response = await clientApi.get<unknown>('/menu/menus');
  const unwrapped = unwrapBffData<unknown>(response);
  if (Array.isArray(unwrapped)) return unwrapped as RestaurantMenu[];
  if (unwrapped && typeof unwrapped === 'object') {
    const obj = unwrapped as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items as RestaurantMenu[];
    if (Array.isArray(obj.menus)) return obj.menus as RestaurantMenu[];
    if (Array.isArray(obj.data)) return obj.data as RestaurantMenu[];
  }
  return [];
}

export function useCompanyMenuSessionsQuery(enabled = true) {
  return useQuery({
    queryKey: companyMenuSessionsQueryKey,
    queryFn: fetchRestaurantMenus,
    enabled,
  });
}
