import type { ItemImage, MenuItem } from '../types/menu';

export function hasLoadedMenuItemMedia(item: Pick<MenuItem, 'images' | 'variants'>): boolean {
  return Array.isArray(item.images) && Array.isArray(item.variants);
}

export function resolveMenuItemImages(
  item: Pick<MenuItem, 'id' | 'image' | 'images'>,
): ItemImage[] {
  if (item.images) return item.images;
  if (item.image) {
    return [
      {
        id: `img_${item.id}`,
        url: item.image,
        isPrimary: true,
        status: 'Active',
      },
    ];
  }
  return [];
}
