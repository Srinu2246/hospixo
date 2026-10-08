import type { MenuCategory, MenuItem, MenuItemTag } from '../types/menu';

export function enrichMenuItemsWithCatalog(
  rawItems: readonly MenuItem[],
  categories: readonly MenuCategory[],
  tags: readonly MenuItemTag[],
): MenuItem[] {
  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));
  const tagDefinitionsById = new Map(tags.map((t) => [t.id, t.name]));

  return rawItems.map((item) => ({
    ...item,
    categoryName: item.categoryName || categoryNameById.get(item.categoryId) || '',
    tags:
      item.tags && item.tags.length > 0
        ? item.tags
        : (item.tagIds ?? []).map((id) => tagDefinitionsById.get(id) ?? id),
  }));
}
