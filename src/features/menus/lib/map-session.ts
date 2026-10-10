import type { MenuCategory, MenuItem } from '@/features/menu/types/menu';
import type {
  CreateRestaurantMenuInput,
  MenuCategoryAssignment,
  MenuTree,
  MenuTreeCategory,
  RestaurantMenu,
  RestaurantMenuType,
} from '@/features/menu/types/restaurant-menu';

import type {
  MenuCatalogCategory,
  MenuCatalogItem,
  MenuSession,
  MenuSessionForm,
  MenuSessionType,
} from '../types/menus';

const UI_TO_API_MENU_TYPE: Record<MenuSessionType, RestaurantMenuType> = {
  All: 'All',
  'Dine-In': 'Dine In',
  Takeaway: 'Takeaway',
  Delivery: 'Delivery',
};

export function toApiMenuType(menuType: MenuSessionType): RestaurantMenuType {
  return UI_TO_API_MENU_TYPE[menuType] ?? menuType;
}

export function fromApiMenuType(menuType?: string): MenuSessionType {
  const norm = (menuType || '').toLowerCase().replace(/[-_ ]/g, '');
  if (norm === 'dinein') return 'Dine-In';
  if (norm === 'takeaway') return 'Takeaway';
  if (norm === 'delivery') return 'Delivery';
  return 'All';
}

export function restaurantMenuToSession(menu: RestaurantMenu): MenuSession {
  const isAct = String(menu.status || '').toLowerCase() === 'active';
  return {
    id: String(menu.id || ''),
    name: menu.name || 'Untitled Menu',
    code: menu.code || '',
    menuType: fromApiMenuType(menu.menuType),
    description: menu.description ?? '',
    status: isAct ? 'active' : 'inactive',
    startTime: '',
    endTime: '',
    daysLabel: '',
    assignedItemIds: [],
    updatedAt: menu.updatedAt ?? menu.createdAt ?? new Date().toISOString(),
  };
}

export function sessionFormToCreateInput(
  form: MenuSessionForm,
  scopeOptions?: Pick<CreateRestaurantMenuInput, 'scope' | 'assignBranchId'>,
): CreateRestaurantMenuInput {
  return {
    name: form.name.trim(),
    code: form.code.trim().toUpperCase(),
    description: form.description.trim() || undefined,
    menuType: toApiMenuType(form.menuType || 'All'),
    ...(scopeOptions?.scope ? { scope: scopeOptions.scope } : {}),
    ...(scopeOptions?.assignBranchId !== undefined
      ? { assignBranchId: scopeOptions.assignBranchId }
      : {}),
  };
}

export function toCatalogCategories(categories: readonly MenuCategory[]): MenuCatalogCategory[] {
  return categories
    .filter((category) => category.status !== 'Inactive')
    .map((category) => ({ id: category.id, name: category.name }));
}

export function toCatalogItems(items: readonly MenuItem[]): MenuCatalogItem[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    categoryId: item.categoryId,
    categoryName: item.categoryName,
    basePrice: item.basePrice,
    dietary: item.dietary === 'Non-Veg' ? 'Non-Veg' : 'Veg',
    orderTypesLabel: orderTypesLabel(item.orderTypes),
    image: item.image ?? item.images?.find((entry) => entry.isPrimary)?.url ?? '',
  }));
}

export function orderTypesLabel(types: readonly string[] | undefined): string {
  if (!types?.length) return '';
  const letters: Record<string, string> = {
    'Dine In': 'D',
    'Dine-In': 'D',
    'Take Away': 'T',
    Takeaway: 'T',
    Delivery: 'D',
  };
  return types.map((type) => letters[type] || type.charAt(0).toUpperCase()).join('|');
}

export function flattenAssignedItems(
  tree: MenuTree | null,
  items: readonly MenuItem[],
  imageByItemId: Readonly<Record<string, string>> = {},
): MenuCatalogItem[] {
  if (!tree) return [];

  const byId = new Map(items.map((item) => [item.id, item]));
  const rows: MenuCatalogItem[] = [];

  function walk(category: MenuTreeCategory) {
    for (const item of category.items) {
      const full = byId.get(item.id);
      rows.push({
        id: item.id,
        name: item.name,
        categoryId: category.categoryId,
        categoryName: category.name,
        basePrice: full?.basePrice ?? item.basePrice ?? 0,
        dietary:
          full?.dietary === 'Non-Veg' || item.dietary === 'non_veg' || item.dietary === 'Non-Veg'
            ? 'Non-Veg'
            : 'Veg',
        orderTypesLabel: orderTypesLabel(full?.orderTypes ?? item.orderTypes),
        image:
          imageByItemId[item.id] ||
          item.imageUrl ||
          full?.image ||
          full?.images?.find((entry) => entry.isPrimary)?.url ||
          '',
        categoryAssignmentId: category.assignmentId,
        assignmentId: category.assignmentId,
        imagePending: imageByItemId[item.id] === undefined && !item.imageUrl && !full?.image,
      });
    }
    for (const child of category.children) walk(child);
  }

  for (const category of tree.categories) walk(category);
  return rows;
}

export function assignmentIdForItem(
  assignments: readonly MenuCategoryAssignment[],
  categoryId: string,
): string | undefined {
  return assignments.find((assignment) => assignment.categoryId === categoryId)?.id;
}
