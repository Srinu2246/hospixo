import type { RestaurantMenu } from '@/features/menu/types/restaurant-menu';

import type { MenuSession } from '../types/menus';

export type BranchScopeId = string | number | null | undefined;

export function restaurantMenuBelongsToBranch(
  menu: Pick<RestaurantMenu, 'scope' | 'assignBranchId'>,
  branchId: BranchScopeId,
): boolean {
  if (!branchId) return true;
  if (menu.scope === 'branch') {
    return menu.assignBranchId != null && String(menu.assignBranchId) === String(branchId);
  }
  if (menu.assignBranchId != null) {
    return String(menu.assignBranchId) === String(branchId);
  }
  return true;
}

export function filterRestaurantMenusForBranchScope(
  menus: readonly RestaurantMenu[],
  branchId: BranchScopeId,
): RestaurantMenu[] {
  return menus.filter((menu) => restaurantMenuBelongsToBranch(menu, branchId));
}

export function filterSessionsForBranchScope(
  sessions: readonly MenuSession[],
  menusById: Readonly<Record<string, RestaurantMenu>>,
  branchId: BranchScopeId,
): MenuSession[] {
  return sessions.filter((session) => {
    const menu = menusById[session.id];
    return menu ? restaurantMenuBelongsToBranch(menu, branchId) : true;
  });
}
