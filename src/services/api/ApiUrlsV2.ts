/** Versioned API paths (browser calls `/api` + path). */
const ApiUrlsV2 = {
  restaurant: {
    /** POST — create menu item (nested payload). */
    menuItems: '/v2/restaurant/menu/items',
  },
} as const;

export default ApiUrlsV2;

export function restaurantMenuItemsV2Path(): string {
  return ApiUrlsV2.restaurant.menuItems;
}

/** PATCH — update menu item (multipart payload + optional images). */
export function restaurantMenuItemV2Path(itemId: number): string {
  return `${ApiUrlsV2.restaurant.menuItems}/${itemId}`;
}
