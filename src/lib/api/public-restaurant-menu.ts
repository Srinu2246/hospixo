import 'server-only';

import { MOCK_PUBLIC_RESTAURANT_MENU } from '@/lib/mocks/floor-and-table-setup/publicRestaurantMenu.mocks';
import type {
  PublicRestaurantMenuData,
  PublicRestaurantMenuQuery,
} from '@/features/floor-table-setup/types/public-restaurant-menu';
import ApiUrlsV1 from '@/services/api/ApiUrlsV1';
import { isMockApiEnabled } from '@/services/api/handler';
import { serverApi } from '@/services/api/serverClient';

function unwrapMenuPayload(payload: unknown): PublicRestaurantMenuData {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const data = (payload as { data: unknown }).data;
    if (data && typeof data === 'object') {
      return data as PublicRestaurantMenuData;
    }
  }
  return payload as PublicRestaurantMenuData;
}

/** Backend: `GET /v1/public/restaurant/menu` (query params). */
export async function fetchPublicRestaurantMenu(
  query: PublicRestaurantMenuQuery,
): Promise<PublicRestaurantMenuData> {
  if (isMockApiEnabled()) {
    return MOCK_PUBLIC_RESTAURANT_MENU;
  }

  const payload = await serverApi.get<unknown>(ApiUrlsV1.public.restaurantMenu, {
    branch_id: query.branch_id,
    floor_id: query.floor_id,
    section_id: query.section_id,
    menu_id: query.menu_id,
  });

  return unwrapMenuPayload(payload);
}
