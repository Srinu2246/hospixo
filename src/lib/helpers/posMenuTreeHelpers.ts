import type { PosMenuItem } from '@/lib/mocks/pos/usePosMenu.mocks';
import type {
  MenuTreeCategoryView,
  NormalizedMenuTree,
  PosMenuCatalogRow,
} from '@/lib/schemas/menu/menus/menuTreeSchema';

/** POS card view model from a normalized menu-tree catalog row. */
export function posMenuItemFromCatalogRow(row: PosMenuCatalogRow): PosMenuItem {
  const sizes =
    row.variants.length > 0
      ? row.variants.map((variant) => ({
          id: String(variant.variantId),
          name: variant.name,
          price: variant.price,
        }))
      : [{ id: `base-${row.menuItemId}`, name: 'Regular', price: row.basePrice }];

  const addOns = row.modifierGroups.flatMap((group) =>
    group.options.length > 0
      ? group.options.map((option) => ({
          id: String(option.optionId),
          name: option.name,
          price: option.priceDelta,
        }))
      : [{ id: String(group.modifierGroupId), name: `Group ${group.modifierGroupId}`, price: 0 }],
  );

  return {
    id: row.posKey,
    name: row.name,
    category: String(row.categoryId),
    categorySection: row.categoryName?.toUpperCase() ?? 'MENU',
    basePrice: row.basePrice,
    imageUrl: row.imageUrl,
    isPopular: row.isFavorite,
    sizes,
    addOns,
    cookingPreferences: ['Mild', 'Medium', 'Spicy'],
  };
}

export function flattenMenuTreeCatalog(tree: NormalizedMenuTree | undefined): {
  categories: MenuTreeCategoryView[];
  catalogByPosKey: Map<string, PosMenuCatalogRow>;
  menuItems: PosMenuItem[];
} {
  if (!tree) {
    return { categories: [], catalogByPosKey: new Map(), menuItems: [] };
  }

  const catalogByPosKey = new Map<string, PosMenuCatalogRow>();
  const menuItems: PosMenuItem[] = [];

  for (const category of tree.categories) {
    for (const row of category.items) {
      const withCategoryName: PosMenuCatalogRow = {
        ...row,
        categoryName: category.categoryName,
      };
      catalogByPosKey.set(row.posKey, withCategoryName);
      menuItems.push(posMenuItemFromCatalogRow(withCategoryName));
    }
  }

  return { categories: tree.categories, catalogByPosKey, menuItems };
}
