import 'server-only';

import { pickActiveBranchMenuAssignment } from '@/features/menu/lib/resolve-active-branch-assignment';
import type { BranchMenuAssignment } from '@/features/menu/types/branch-menu';
import {
  activateBackendBranchMenuAssignment,
  assignBackendBranchMenuByBranchId,
  listBackendBranchMenusByBranchId,
  syncBackendBranchMenuAssignment,
} from '@/lib/api/branch-menus';
import { listBackendRestaurantMenus } from '@/lib/api/menu';
import {
  mapRestaurantMenusApi,
  unwrapRestaurantMenuList,
} from '@/features/menu/api/restaurant-menus-map';
import type { RestaurantMenu } from '@/features/menu/types/restaurant-menu';

function normalizeMenuType(value: string | undefined): string {
  return (value ?? '').toLowerCase().replace(/[\s-]+/g, '_');
}

function pickCompanyDineInRestaurantMenu(menus: readonly RestaurantMenu[]): RestaurantMenu | null {
  const active = menus.filter((menu) => menu.status === 'Active');
  const companyScoped = active.filter(
    (menu) => menu.scope === 'company' || menu.scope === 'both' || menu.scope == null,
  );
  let pool = menus;
  if (companyScoped.length > 0) {
    pool = companyScoped;
  } else if (active.length > 0) {
    pool = active;
  }

  const dineIn = pool.filter((menu) => {
    const type = normalizeMenuType(menu.menuType);
    return type.includes('dine');
  });

  const candidates = dineIn.length > 0 ? dineIn : pool;
  return [...candidates].sort((left, right) => left.displayOrder - right.displayOrder)[0] ?? null;
}

function pickBranchMenuAssignment(
  assignments: readonly BranchMenuAssignment[],
): BranchMenuAssignment | null {
  return pickActiveBranchMenuAssignment(assignments) ?? assignments[0] ?? null;
}

/**
 * When a branch inherits the company catalog but has no restaurant branch-menu row yet,
 * assign the active company dine-in menu, sync item overrides, and activate.
 */
export async function ensureBackendBranchMenuAssignment(
  token: string,
  branchId: string | number,
): Promise<BranchMenuAssignment> {
  const assignments = await listBackendBranchMenusByBranchId(token, branchId);
  let picked = pickBranchMenuAssignment(assignments);
  if (picked) {
    await syncBackendBranchMenuAssignment(token, branchId, picked.id).catch(() => undefined);
    if (picked.status !== 'Active') {
      try {
        picked = await activateBackendBranchMenuAssignment(token, branchId, picked.id);
      } catch {
        // keep existing row
      }
    }
    return picked;
  }

  const menusRaw = await listBackendRestaurantMenus(token, { status: 'active' });
  const menus = mapRestaurantMenusApi(unwrapRestaurantMenuList(menusRaw));
  const restaurantMenu = pickCompanyDineInRestaurantMenu(menus);
  if (!restaurantMenu) {
    throw new Error(
      'No active company menu is available to link to this branch. Create a company menu first.',
    );
  }

  const menuId = Number(restaurantMenu.id);
  if (!Number.isFinite(menuId) || menuId <= 0) {
    throw new Error('Selected company menu is invalid.');
  }

  picked = await assignBackendBranchMenuByBranchId(token, branchId, {
    menu_id: menuId,
    is_default: true,
    display_order: 0,
  });

  await syncBackendBranchMenuAssignment(token, branchId, picked.id).catch(() => undefined);

  if (picked.status !== 'Active') {
    try {
      picked = await activateBackendBranchMenuAssignment(token, branchId, picked.id);
    } catch {
      // assignment may still work for overrides after sync
    }
  }

  await syncBackendBranchMenuAssignment(token, branchId, picked.id).catch(() => undefined);
  return picked;
}
