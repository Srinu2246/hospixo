'use client';

import { useQuery } from '@tanstack/react-query';

import { clientApi } from '@/lib/client-api';
import { unwrapBffData } from '@/lib/bff-envelope';
import type { RestaurantMenu } from '@/features/menu/types/restaurant-menu';
import { restaurantMenuToSession } from '../lib/map-session';
import type { MenuSession } from '../types/menus';

export const companyMenuSessionsQueryKey = ['menus', 'company-sessions'] as const;

async function fetchCompanyMenuSessions(): Promise<MenuSession[]> {
  const response = await clientApi.get<unknown>('/menu/menus');
  const list = unwrapBffData<RestaurantMenu[] | RestaurantMenu>(response);
  let menus: RestaurantMenu[] = [];
  if (Array.isArray(list)) {
    menus = list;
  } else if (list) {
    menus = [list];
  }
  return menus.map(restaurantMenuToSession);
}

export function useCompanyMenuSessionsQuery(enabled = true) {
  return useQuery({
    queryKey: companyMenuSessionsQueryKey,
    queryFn: fetchCompanyMenuSessions,
    enabled,
  });
}
