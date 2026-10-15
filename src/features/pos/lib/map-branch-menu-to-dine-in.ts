import { posFoodImages } from '@/features/pos/config/assets';
import type { BranchMenuItemOverride } from '@/lib/api/restaurant-branch-menus';
import type { DineInMenuCategoryId, DineInMenuItem } from '@/features/pos/config/dine-in';

function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function mapCategory(raw: Record<string, unknown>): Exclude<DineInMenuCategoryId, 'all'> {
  const nested =
    raw.menu_item && typeof raw.menu_item === 'object'
      ? (raw.menu_item as Record<string, unknown>)
      : null;

  const category =
    asString(raw.category_name) ||
    asString(nested?.category_name) ||
    asString(raw.category_slug) ||
    asString(raw.category) ||
    asString(raw.menu_category) ||
    asString(raw.item_category);

  const name =
    asString(raw.display_name) ||
    asString(raw.name) ||
    asString(raw.item_name) ||
    asString(nested?.name);
  const normalized = `${category} ${name}`.toLowerCase();

  if (
    normalized.includes('bev') ||
    normalized.includes('drink') ||
    normalized.includes('mojito') ||
    normalized.includes('cocktail') ||
    normalized.includes('mocktail') ||
    normalized.includes('shake') ||
    normalized.includes('juice') ||
    normalized.includes('soda') ||
    normalized.includes('tea') ||
    normalized.includes('coffee') ||
    normalized.includes('bar')
  ) {
    return 'beverages';
  }
  if (
    normalized.includes('dessert') ||
    normalized.includes('sweet') ||
    normalized.includes('ice cream') ||
    normalized.includes('cake') ||
    normalized.includes('pastry') ||
    normalized.includes('kulfi')
  ) {
    return 'desserts';
  }
  if (
    normalized.includes('starter') ||
    normalized.includes('appetizer') ||
    normalized.includes('snack') ||
    normalized.includes('finger')
  ) {
    return 'starters';
  }
  return 'mains';
}

function pickPreferredItem(current: DineInMenuItem, next: DineInMenuItem): DineInMenuItem {
  if (next.price > current.price) return next;
  if (next.price < current.price) return current;
  if (next.isAvailable && !current.isAvailable) return next;
  return current;
}

/** Map branch menu override records → dine-in menu cards. */
export function mapBranchMenuItemsToDineIn(
  items: readonly BranchMenuItemOverride[],
): DineInMenuItem[] {
  const mapped = items
    .map((item, index) => {
      const record = item as Record<string, unknown>;
      const nested =
        record.menu_item && typeof record.menu_item === 'object'
          ? (record.menu_item as Record<string, unknown>)
          : null;

      const menuItemId = asString(record.menu_item_id ?? nested?.id);
      const overrideId = asString(record.id ?? record.item_override_id);
      const resolvedId = menuItemId || overrideId;
      const name =
        asString(nested?.name) ||
        asString(record.display_name) ||
        asString(record.name) ||
        asString(record.item_name) ||
        `Item ${index + 1}`;
      if (!resolvedId || !name) return null;

      if (record.allow_dine_in === false) return null;

      const price =
        asNumber(record.selling_price) ||
        asNumber(record.price) ||
        asNumber(record.base_price) ||
        asNumber(record.unit_price) ||
        asNumber(nested?.selling_price) ||
        asNumber(nested?.base_price);

      const fallbackImages = Object.values(posFoodImages);
      const imageUrl =
        asString(record.image_url) ||
        asString(record.thumbnail_url) ||
        asString(nested?.image_url) ||
        fallbackImages[index % fallbackImages.length] ||
        '';

      const category = mapCategory(record);
      const rawCategoryName =
        asString(record.category_name) ||
        asString(nested?.category_name) ||
        asString(record.section_name);
      const group = rawCategoryName || category.charAt(0).toUpperCase() + category.slice(1);

      const isAvailable =
        record.is_available !== false && record.status !== '86d' && record.status !== 'inactive';

      const mapped: DineInMenuItem = {
        id: resolvedId,
        name,
        price,
        category,
        group,
        imageUrl,
        customizable: Boolean(record.has_variants ?? record.customizable ?? false),
        isAvailable,
        status: isAvailable ? 'available' : '86d',
      };
      return mapped;
    })
    .filter((item): item is DineInMenuItem => item !== null);

  const uniqueById = new Map<string, DineInMenuItem>();
  for (const item of mapped) {
    const existing = uniqueById.get(item.id);
    uniqueById.set(item.id, existing ? pickPreferredItem(existing, item) : item);
  }

  return [...uniqueById.values()];
}
