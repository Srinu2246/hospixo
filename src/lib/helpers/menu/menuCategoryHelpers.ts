export interface MenuCategoryTabSource {
  id: string;
  name: string;
}

export function buildMenuCategoryTabs(
  categories: readonly MenuCategoryTabSource[],
  categoryCounts: Readonly<Record<string, number>>,
  totalItemCount: number,
) {
  return [
    { value: 'all', label: `All Items (${totalItemCount})` },
    ...categories.map((category) => ({
      value: category.id,
      label: `${category.name} (${categoryCounts[category.id] ?? 0})`,
    })),
  ];
}

export function menuCategoryIdFromTab(value: string): string | null {
  return value === 'all' ? null : value;
}

export function menuCategoryTabValue(activeCategoryId: string | null): string {
  return activeCategoryId ?? 'all';
}
