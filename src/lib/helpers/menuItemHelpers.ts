import type { MenuCatalogItem } from '@/lib/schemas/menu/menuCreationSchema';
import {
  isMenuItemCreatedMessage,
  isMenuItemUpdatedMessage,
  type MenuItemResponse,
} from '@/lib/schemas/menu/menuItemsSchema';
import { useToastStore } from '@/stores/toastStore';

export function toCatalogDietary(
  dietary: MenuItemResponse['dietary_type'],
): MenuCatalogItem['dietary'] {
  if (dietary === 'non_veg') return 'Non-Veg';
  if (dietary === 'egg') return 'Egg';
  if (dietary === 'vegan') return 'Vegan';
  return 'Veg';
}

/** Map GET /v1/restaurant/menu/items/{id} into the menu-creation catalog row. */
export function toMenuCatalogItem(
  item: MenuItemResponse,
  categoryNameById?: Map<string, string>,
  fallbackCategoryName?: string,
): MenuCatalogItem {
  const orderTypes: string[] = [];
  if (item.allow_dine_in) orderTypes.push('Dine In');
  if (item.allow_takeaway) orderTypes.push('Take Away');
  if (item.allow_delivery) orderTypes.push('Delivery');

  const tags = item.tags.map((tag) => tag.name);
  if (item.is_favorite) tags.push('Set As Favorite');
  if (item.is_combo) tags.push('Set As Combo');

  const primaryImage = item.images.find((image) => image.is_primary) ?? item.images[0];
  const categoryId = String(item.category_id);

  return {
    id: String(item.id),
    name: item.name,
    categoryId,
    categoryName: categoryNameById?.get(categoryId) ?? fallbackCategoryName ?? 'Uncategorized',
    basePrice: item.base_price,
    dietary: toCatalogDietary(item.dietary_type),
    status: item.status === 'active' ? 'Available' : 'Inactive',
    code: item.code ?? undefined,
    description: item.description ?? undefined,
    imageUrl: primaryImage?.url ?? undefined,
    orderTypes,
    tags,
  };
}

export function gstLabelFromItem(item: MenuItemResponse): string {
  const tax = item.taxes[0];
  if (!tax?.gst_rate) return '—';
  const rate = tax.gst_rate;
  return `${rate.total_rate}% (${rate.name})`;
}

/** Success toast for POST/PATCH menu item writes (matches API `message` strings). */
export function showMenuItemWriteSuccessToast(message: string | null | undefined): void {
  const trimmed = message?.trim() ?? '';
  if (!trimmed) return;

  if (isMenuItemUpdatedMessage(trimmed)) {
    useToastStore.getState().show('Menu item updated', 'success');
    return;
  }

  if (isMenuItemCreatedMessage(trimmed)) {
    useToastStore.getState().show('Menu item created', 'success');
    return;
  }

  useToastStore.getState().show(trimmed, 'success');
}
