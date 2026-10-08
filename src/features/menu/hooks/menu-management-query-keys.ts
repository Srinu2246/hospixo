export const menuCategoriesQueryKey = ['menu', 'categories'] as const;

export const menuItemsQueryKey = ['menu', 'items'] as const;

export const menuItemTagsQueryKey = ['menu', 'item-tags'] as const;

export const menuPreparationStationsQueryKey = ['menu', 'preparation-stations', 'active'] as const;

export const menuModifierGroupsQueryKey = ['menu', 'modifier-groups', 'active'] as const;

export const menuItemVariantsQueryKey = (itemId: string) =>
  ['menu', 'items', itemId, 'variants'] as const;

export const menuItemImagesQueryKey = (itemId: string) =>
  ['menu', 'items', itemId, 'images'] as const;

/** Invalidates all menu catalog + nested item resource queries. */
export const menuManagementQueryKeyPrefix = ['menu'] as const;
