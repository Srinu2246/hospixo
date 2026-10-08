import type { MenuItemVariantId } from '../types/menu-item-variant-api';

export function normalizeMenuItemVariantId(variantId: string | number): string {
  return String(variantId).trim();
}

export function assertMenuItemVariantId(variantId: string | number): MenuItemVariantId {
  const trimmed = normalizeMenuItemVariantId(variantId);
  if (!trimmed || !/^\d+$/.test(trimmed)) {
    throw new Error(`Invalid menu item variant id: ${variantId}`);
  }
  return trimmed;
}

export function isPersistedMenuItemVariantId(
  variantId: string | number,
): variantId is MenuItemVariantId {
  return /^\d+$/.test(normalizeMenuItemVariantId(variantId));
}
