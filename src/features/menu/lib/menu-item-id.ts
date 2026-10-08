import type { MenuItemId } from '../types/menu-item-api';

export function assertMenuItemId(itemId: MenuItemId): MenuItemId {
  const trimmed = itemId.trim();
  if (!trimmed || !/^\d+$/.test(trimmed)) {
    throw new Error(`Invalid menu item id: ${itemId}`);
  }
  return trimmed;
}

export function toMenuItemIdNumber(itemId: MenuItemId): number {
  return Number(assertMenuItemId(itemId));
}

export function isPersistedMenuItemId(itemId: string): itemId is MenuItemId {
  return /^\d+$/.test(itemId.trim());
}
