import { posFoodImages } from '@/features/pos/config/assets';
import type { BranchMenuItemOverride } from '@/lib/api/restaurant-branch-menus';
import type { DineInMenuCategoryId, DineInMenuItem } from '@/features/pos/config/dine-in';

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function mapCategory(raw: Record<string, unknown>): Exclude<DineInMenuCategoryId, 'all'> {
  const category =
    asString(raw.category_slug) ||
    asString(raw.category) ||
    asString(raw.menu_category) ||
    asString(raw.item_category);
  const normalized = category.toLowerCase();
  if (normalized.includes('starter') || normalized.includes('appetizer')) return 'starters';
  if (normalized.includes('main') || normalized.includes('entree')) return 'mains';
  if (normalized.includes('dessert')) return 'desserts';
  if (normalized.includes('bev') || normalized.includes('drink')) return 'beverages';
  return 'mains';
}

/** Map branch menu override records → dine-in menu cards. */
export function mapBranchMenuItemsToDineIn(
  items: readonly BranchMenuItemOverride[],
): DineInMenuItem[] {
  return items
    .map((item, index) => {
      const record = item as Record<string, unknown>;
      const id = asString(record.id ?? record.item_override_id ?? record.menu_item_id);
      const name =
        asString(record.display_name) ||
        asString(record.name) ||
        asString(record.item_name) ||
        `Item ${index + 1}`;
      if (!id || !name) return null;

      const price =
        asNumber(record.price) ||
        asNumber(record.selling_price) ||
        asNumber(record.base_price) ||
        asNumber(record.unit_price);

      const fallbackImages = Object.values(posFoodImages);
      const imageUrl =
        asString(record.image_url) ||
        asString(record.thumbnail_url) ||
        fallbackImages[index % fallbackImages.length] ||
        '';

      const category = mapCategory(record);
      const group =
        asString(record.category_name) || asString(record.section_name) || category.toUpperCase();

      return {
        id: String(id),
        name,
        price,
        category,
        group,
        imageUrl,
        customizable: Boolean(record.has_variants ?? record.customizable ?? false),
      } satisfies DineInMenuItem;
    })
    .filter((item): item is DineInMenuItem => item != null);
}
