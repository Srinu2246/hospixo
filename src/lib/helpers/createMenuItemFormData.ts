import type { MenuItemResponse } from '@/lib/schemas/menu/menuItemsSchema';

export function buildTagNameToIdMap(items: readonly MenuItemResponse[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const item of items) {
    for (const tag of item.tags) {
      const key = tag.name.trim().toLowerCase();
      if (key && !map.has(key)) {
        map.set(key, tag.id);
      }
    }
  }
  return map;
}
