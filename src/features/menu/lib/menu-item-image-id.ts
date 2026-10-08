import type { MenuItemImageId } from '../types/menu-item-image-api';

export function assertMenuItemImageId(imageId: MenuItemImageId): MenuItemImageId {
  const trimmed = imageId.trim();
  if (!trimmed || !/^\d+$/.test(trimmed)) {
    throw new Error(`Invalid menu item image id: ${imageId}`);
  }
  return trimmed;
}

export function isPersistedMenuItemImageId(imageId: string): imageId is MenuItemImageId {
  return /^\d+$/.test(imageId.trim());
}
