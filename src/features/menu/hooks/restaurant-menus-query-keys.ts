import type { ListRestaurantMenusApiQuery } from '../types/restaurant-menu-api';

export { menuCategoriesQueryKey } from './menu-management-query-keys';

export const restaurantMenusQueryKey = (query?: ListRestaurantMenusApiQuery) =>
  ['menu', 'restaurant-menus', query ?? {}] as const;

export const restaurantMenuTreeQueryKey = (menuId: string) =>
  ['menu', 'restaurant-menu', menuId, 'tree'] as const;

export const restaurantMenuAssignmentsQueryKey = (menuId: string) =>
  ['menu', 'restaurant-menu', menuId, 'category-assignments'] as const;

export const branchMenuAssignmentsQueryKey = ['menu', 'branch-assignments'] as const;
