import { clientApi } from '@/lib/client-api';
import { unwrapBffData } from '@/lib/bff-envelope';
import {
  mapMenuCategoryAssignmentApi,
  mapMenuCategoryAssignmentsApi,
  mapMenuTreeApi,
  mapRestaurantMenuApi,
  mapRestaurantMenusApi,
  toCreateMenuCategoryAssignmentPayload,
  toCreateRestaurantMenuPayload,
  toUpdateRestaurantMenuPayload,
  unwrapMenuCategoryAssignmentList,
  unwrapRestaurantMenuList,
} from './restaurant-menus-map';
import type { MenuCategory } from '../types/menu';
import type {
  CreateRestaurantMenuInput,
  MenuCategoryAssignment,
  MenuTree,
  RestaurantMenu,
} from '../types/restaurant-menu';
import type {
  ListRestaurantMenusApiQuery,
  MenuCategoryAssignmentApi,
  MenuCategoryAssignmentId,
  MenuTreeApi,
  RestaurantMenuApi,
  RestaurantMenuId,
} from '../types/restaurant-menu-api';

function buildQueryString(query?: ListRestaurantMenusApiQuery): string {
  if (!query) return '';
  const params = new URLSearchParams();
  if (query.status) params.set('status', query.status);
  if (query.menu_type) params.set('menu_type', query.menu_type);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export async function fetchRestaurantMenusClient(
  query?: ListRestaurantMenusApiQuery,
): Promise<RestaurantMenu[]> {
  const res = await clientApi.get<unknown>(`/menu/menus${buildQueryString(query)}`);
  const data = unwrapBffData<unknown>(res);
  if (
    Array.isArray(data) &&
    data.length > 0 &&
    typeof data[0] === 'object' &&
    data[0] != null &&
    'menuType' in (data[0] as object)
  ) {
    return data as RestaurantMenu[];
  }
  return mapRestaurantMenusApi(unwrapRestaurantMenuList(data));
}

export async function fetchRestaurantMenuByIdClient(id: RestaurantMenuId): Promise<RestaurantMenu> {
  const res = await clientApi.get<unknown>(`/menu/menus/${encodeURIComponent(id)}`);
  const data = unwrapBffData<RestaurantMenuApi | RestaurantMenu>(res);
  if (data && typeof data === 'object' && 'menuType' in data) {
    return data as RestaurantMenu;
  }
  return mapRestaurantMenuApi(data as RestaurantMenuApi);
}

export async function fetchRestaurantMenuTreeClient(menuId: RestaurantMenuId): Promise<MenuTree> {
  const res = await clientApi.get<unknown>(`/menu/menus/${encodeURIComponent(menuId)}/tree`);
  const data = unwrapBffData<MenuTreeApi | MenuTree>(res);
  if (data && typeof data === 'object' && 'menuId' in data) {
    return data as MenuTree;
  }
  return mapMenuTreeApi(data as MenuTreeApi);
}

export async function fetchMenuCategoryAssignmentsClient(
  menuId: RestaurantMenuId,
  categories: readonly MenuCategory[],
): Promise<MenuCategoryAssignment[]> {
  const res = await clientApi.get<unknown>(
    `/menu/menus/${encodeURIComponent(menuId)}/category-assignments`,
  );
  const data = unwrapBffData<unknown>(res);
  if (
    Array.isArray(data) &&
    data.length > 0 &&
    typeof data[0] === 'object' &&
    data[0] != null &&
    'categoryId' in (data[0] as object)
  ) {
    return data as MenuCategoryAssignment[];
  }
  const categoryNameById = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  return mapMenuCategoryAssignmentsApi(
    unwrapMenuCategoryAssignmentList(data) as MenuCategoryAssignmentApi[],
    categoryNameById,
  );
}

export async function createRestaurantMenuClient(
  input: CreateRestaurantMenuInput,
): Promise<RestaurantMenu> {
  const res = await clientApi.post<unknown>('/menu/menus', input);
  const data = unwrapBffData<RestaurantMenuApi | RestaurantMenu>(res);
  if (data && typeof data === 'object' && 'menuType' in data) {
    return data as RestaurantMenu;
  }
  return mapRestaurantMenuApi(data as RestaurantMenuApi);
}

export async function updateRestaurantMenuClient(
  menuId: RestaurantMenuId,
  updates: Partial<CreateRestaurantMenuInput> & {
    status?: RestaurantMenu['status'];
    displayOrder?: number;
  },
): Promise<RestaurantMenu> {
  const payload = toUpdateRestaurantMenuPayload(updates);
  const res = await clientApi.patch<unknown>(`/menu/menus/${encodeURIComponent(menuId)}`, payload);
  const data = unwrapBffData<RestaurantMenuApi | RestaurantMenu>(res);
  if (data && typeof data === 'object' && 'menuType' in data) {
    return data as RestaurantMenu;
  }
  return mapRestaurantMenuApi(data as RestaurantMenuApi);
}

export async function activateRestaurantMenuClient(
  menuId: RestaurantMenuId,
): Promise<RestaurantMenu> {
  const res = await clientApi.post<unknown>(
    `/menu/menus/${encodeURIComponent(menuId)}/activate`,
    {},
  );
  const data = unwrapBffData<RestaurantMenuApi | RestaurantMenu>(res);
  if (data && typeof data === 'object' && 'menuType' in data) {
    return data as RestaurantMenu;
  }
  return mapRestaurantMenuApi(data as RestaurantMenuApi);
}

export async function deactivateRestaurantMenuClient(
  menuId: RestaurantMenuId,
): Promise<RestaurantMenu> {
  const res = await clientApi.post<unknown>(
    `/menu/menus/${encodeURIComponent(menuId)}/deactivate`,
    {},
  );
  const data = unwrapBffData<RestaurantMenuApi | RestaurantMenu>(res);
  if (data && typeof data === 'object' && 'menuType' in data) {
    return data as RestaurantMenu;
  }
  return mapRestaurantMenuApi(data as RestaurantMenuApi);
}

export async function assignMenuCategoryClient(
  menuId: RestaurantMenuId,
  input: { categoryId: string; displayOrder?: number },
  categories: readonly MenuCategory[],
): Promise<MenuCategoryAssignment> {
  const res = await clientApi.post<unknown>(
    `/menu/menus/${encodeURIComponent(menuId)}/category-assignments`,
    input,
  );
  const data = unwrapBffData<MenuCategoryAssignmentApi | MenuCategoryAssignment>(res);
  if (data && typeof data === 'object' && 'categoryId' in data && !('category_id' in data)) {
    return data as MenuCategoryAssignment;
  }
  const categoryNameById = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  return mapMenuCategoryAssignmentApi(data as MenuCategoryAssignmentApi, categoryNameById);
}

export async function removeMenuCategoryAssignmentClient(
  menuId: RestaurantMenuId,
  assignmentId: MenuCategoryAssignmentId,
): Promise<void> {
  await clientApi.delete(
    `/menu/menus/${encodeURIComponent(menuId)}/category-assignments/${encodeURIComponent(assignmentId)}`,
  );
}

export { toCreateRestaurantMenuPayload, toCreateMenuCategoryAssignmentPayload };
