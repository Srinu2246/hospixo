import type {
  CreateRestaurantMenuInput,
  MenuCategoryAssignment,
  MenuTree,
  MenuTreeCategory,
  MenuTreeItem,
  RestaurantMenu,
  RestaurantMenuType,
} from '../types/restaurant-menu';
import type {
  CreateMenuCategoryAssignmentApiRequest,
  CreateRestaurantMenuApiRequest,
  MenuCategoryAssignmentApi,
  MenuCategoryAssignmentApiStatus,
  MenuTreeApi,
  MenuTreeCategoryApi,
  MenuTreeItemApi,
  RestaurantMenuApi,
  RestaurantMenuTypeApi,
  UpdateMenuCategoryAssignmentApiRequest,
  UpdateRestaurantMenuApiRequest,
} from '../types/restaurant-menu-api';
import type { MenuCategory } from '../types/menu';

const MENU_TYPE_TO_API: Record<string, RestaurantMenuTypeApi> = {
  All: 'all',
  'Dine In': 'dine_in',
  Takeaway: 'takeaway',
  Delivery: 'delivery',
  Online: 'online',
};

const MENU_TYPE_FROM_API: Record<string, RestaurantMenuType> = {
  all: 'All',
  dine_in: 'Dine In',
  takeaway: 'Takeaway',
  delivery: 'Delivery',
  online: 'Online',
};

function mapMenuStatus(status?: string): RestaurantMenu['status'] {
  if (!status) return 'Active';
  return status.trim().toLowerCase() === 'active' ? 'Active' : 'Inactive';
}

function mapAssignmentStatus(
  status?: MenuCategoryAssignmentApiStatus,
): MenuCategoryAssignment['status'] {
  if (!status) return 'Active';
  return status === 'active' ? 'Active' : 'Inactive';
}

export function mapMenuTypeToApi(menuType: RestaurantMenuType): RestaurantMenuTypeApi {
  return MENU_TYPE_TO_API[menuType] ?? 'all';
}

export function mapMenuTypeFromApi(menuType?: string): RestaurantMenuType {
  if (!menuType) return 'All';
  const norm = menuType.trim().toLowerCase().replace(/[- ]/g, '_');
  return MENU_TYPE_FROM_API[norm] ?? 'All';
}

function parseDisplayOrder(m: Record<string, unknown>): number {
  if (typeof m.display_order === 'number') return m.display_order;
  if (typeof m.displayOrder === 'number') return m.displayOrder;
  return 0;
}

function parseBranchId(m: Record<string, unknown>): string | undefined {
  const val = m.assign_branch_id ?? m.assignBranchId;
  if (typeof val === 'string' || typeof val === 'number') {
    return String(val);
  }
  return undefined;
}

function parseIdString(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  return '';
}

export function mapRestaurantMenuApi(
  menu: RestaurantMenuApi | Record<string, unknown>,
): RestaurantMenu {
  const m = menu as Record<string, unknown>;
  const rawId = m.id ?? m.menu_id ?? m.menuId ?? '';
  const rawName = (m.name as string) ?? (m.title as string) ?? '';
  const rawCode = (m.code as string) ?? '';
  const rawDesc = (m.description as string) ?? undefined;
  const rawType = (m.menu_type as string) ?? (m.menuType as string) ?? 'all';
  const rawDisplayOrder = parseDisplayOrder(m);
  const rawStatus = (m.status as string) ?? 'active';
  const rawScope = (m.scope as RestaurantMenu['scope']) ?? undefined;
  const rawAssignBranchId = parseBranchId(m);
  const rawCreatedAt = (m.created_at as string) ?? (m.createdAt as string) ?? undefined;
  const rawUpdatedAt = (m.updated_at as string) ?? (m.updatedAt as string) ?? undefined;

  return {
    id: parseIdString(rawId),
    name: rawName,
    code: rawCode,
    description: rawDesc,
    menuType: mapMenuTypeFromApi(rawType),
    displayOrder: rawDisplayOrder,
    status: mapMenuStatus(rawStatus),
    scope: rawScope,
    assignBranchId: rawAssignBranchId,
    createdAt: rawCreatedAt,
    updatedAt: rawUpdatedAt,
  };
}

export function mapRestaurantMenusApi(menus: readonly RestaurantMenuApi[]): RestaurantMenu[] {
  return menus.map(mapRestaurantMenuApi);
}

const MENU_LIST_KEYS = ['items', 'menus', 'branch_menus', 'results', 'records'] as const;

export function unwrapRestaurantMenuList(data: unknown): RestaurantMenuApi[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as RestaurantMenuApi[];
  if (typeof data !== 'object') return [];

  const record = data as Record<string, unknown>;
  for (const key of MENU_LIST_KEYS) {
    if (Array.isArray(record[key])) return record[key] as RestaurantMenuApi[];
  }
  if (record.data) {
    return unwrapRestaurantMenuList(record.data);
  }
  return [];
}

export function toCreateRestaurantMenuPayload(
  input: CreateRestaurantMenuInput,
): CreateRestaurantMenuApiRequest {
  return {
    name: input.name.trim(),
    code: input.code.trim().toUpperCase(),
    description: input.description?.trim() || undefined,
    menu_type: mapMenuTypeToApi(input.menuType),
    display_order: input.displayOrder ?? 0,
  };
}

export function toUpdateRestaurantMenuPayload(
  updates: Partial<CreateRestaurantMenuInput> & {
    status?: RestaurantMenu['status'];
    displayOrder?: number;
  },
): UpdateRestaurantMenuApiRequest {
  return {
    ...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
    ...(updates.code !== undefined ? { code: updates.code.trim().toUpperCase() } : {}),
    ...(updates.description !== undefined
      ? { description: updates.description.trim() || null }
      : {}),
    ...(updates.menuType !== undefined ? { menu_type: mapMenuTypeToApi(updates.menuType) } : {}),
    ...(updates.displayOrder !== undefined ? { display_order: updates.displayOrder } : {}),
    ...(updates.status !== undefined
      ? { status: updates.status === 'Active' ? 'active' : 'inactive' }
      : {}),
  };
}

export function mapMenuCategoryAssignmentApi(
  assignment: MenuCategoryAssignmentApi,
  categoryNameById: Record<string, string> = {},
): MenuCategoryAssignment {
  const categoryId = String(assignment.category_id);
  return {
    id: String(assignment.id),
    menuId: String(assignment.menu_id),
    categoryId,
    categoryName: categoryNameById[categoryId],
    displayOrder: assignment.display_order,
    status: mapAssignmentStatus(assignment.status),
  };
}

export function mapMenuCategoryAssignmentsApi(
  assignments: readonly MenuCategoryAssignmentApi[],
  categoryNameById: Record<string, string> = {},
): MenuCategoryAssignment[] {
  return assignments
    .map((assignment) => mapMenuCategoryAssignmentApi(assignment, categoryNameById))
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function unwrapMenuCategoryAssignmentList(data: unknown): MenuCategoryAssignmentApi[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as MenuCategoryAssignmentApi[];
  if (typeof data === 'object' && 'items' in (data as Record<string, unknown>)) {
    return (data as { items: MenuCategoryAssignmentApi[] }).items;
  }
  return [];
}

export function toCreateMenuCategoryAssignmentPayload(input: {
  categoryId: string;
  displayOrder?: number;
}): CreateMenuCategoryAssignmentApiRequest {
  return {
    category_id: Number(input.categoryId),
    display_order: input.displayOrder ?? 0,
  };
}

export function toUpdateMenuCategoryAssignmentPayload(input: {
  displayOrder?: number;
  status?: 'Active' | 'Inactive';
}): UpdateMenuCategoryAssignmentApiRequest {
  return {
    ...(input.displayOrder !== undefined ? { display_order: input.displayOrder } : {}),
    ...(input.status !== undefined
      ? { status: input.status === 'Active' ? 'active' : 'inactive' }
      : {}),
  };
}

function mapTreeItemOrderTypes(item: MenuTreeItemApi): string[] | undefined {
  if (item.order_types?.length) return [...item.order_types];
  const types: string[] = [];
  if (item.allow_dine_in) types.push('Dine In');
  if (item.allow_takeaway) types.push('Take Away');
  if (item.allow_delivery) types.push('Delivery');
  return types.length > 0 ? types : undefined;
}

function mapMenuTreeItemApi(item: MenuTreeItemApi): MenuTreeItem {
  const imageUrl = item.image_url || item.primary_image_url || item.thumbnail_url || undefined;
  const raw = item as unknown as Record<string, unknown>;
  const resolvedId = item.id ?? raw.menu_item_id ?? raw.item_id ?? raw.menuItemId ?? '';
  return {
    id: parseIdString(resolvedId),
    name: item.name ?? (raw.item_name as string) ?? (raw.title as string) ?? '',
    code: item.code,
    basePrice: item.base_price,
    status: item.status,
    displayOrder: item.display_order,
    imageUrl,
    dietary: item.dietary_type ?? undefined,
    orderTypes: mapTreeItemOrderTypes(item),
  };
}

function mapMenuTreeCategoryApi(category: MenuTreeCategoryApi): MenuTreeCategory {
  const rawCat = category as unknown as Record<string, unknown>;
  const categoryId =
    category.category_id ?? category.category?.id ?? rawCat.id ?? rawCat.categoryId ?? '';
  const categoryItems =
    category.items ??
    category.category?.items ??
    (rawCat.category_items as readonly MenuTreeItemApi[]) ??
    [];

  return {
    assignmentId: category.assignment_id != null ? String(category.assignment_id) : undefined,
    categoryId: parseIdString(categoryId),
    name: category.name ?? category.category?.name ?? (rawCat.title as string) ?? '',
    displayOrder: category.display_order,
    status: category.status,
    items: categoryItems.map(mapMenuTreeItemApi),
    children: (category.children ?? []).map(mapMenuTreeCategoryApi),
  };
}

export function mapMenuTreeApi(tree: MenuTreeApi): MenuTree {
  return {
    menuId: String(tree.menu_id),
    menu: tree.menu ? mapRestaurantMenuApi(tree.menu) : undefined,
    categories: (tree.categories ?? []).map(mapMenuTreeCategoryApi),
  };
}

export function buildCategoryNameById(categories: readonly MenuCategory[]): Record<string, string> {
  return Object.fromEntries(categories.map((category) => [category.id, category.name]));
}
