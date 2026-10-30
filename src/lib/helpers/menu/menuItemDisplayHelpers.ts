import type { MenuCatalogItem } from '@/lib/schemas/menu/menuCreationSchema';

export function formatMenuItemPrice(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`;
}

export function menuItemDietaryVariant(
  dietary: MenuCatalogItem['dietary'],
): 'success' | 'danger' | 'default' {
  if (dietary === 'Veg' || dietary === 'Vegan') return 'success';
  if (dietary === 'Non-Veg') return 'danger';
  return 'default';
}

export function menuItemStatusVariant(
  status: MenuCatalogItem['status'],
): 'success' | 'warning' | 'default' {
  if (status === 'Available' || status === 'Active') return 'success';
  if (status === 'Out of Stock') return 'warning';
  return 'default';
}

export function isMenuCatalogItemActive(status: MenuCatalogItem['status']): boolean {
  return status === 'Available' || status === 'Active';
}
