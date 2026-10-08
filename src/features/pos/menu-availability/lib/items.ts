import { menuPreviewCategories, menuPreviewItems } from '@/features/pos/menu-availability/config';
import type { MenuCategory, MenuItem } from '@/features/pos/types/menu-availability';

export async function getMenuCategories(): Promise<MenuCategory[]> {
  return menuPreviewCategories;
}

export async function getMenuItems(): Promise<MenuItem[]> {
  return menuPreviewItems;
}
