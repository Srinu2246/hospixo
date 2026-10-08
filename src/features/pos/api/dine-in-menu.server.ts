import 'server-only';

import { mapBranchMenuItemsToDineIn } from '@/features/pos/lib/map-branch-menu-to-dine-in';
import type { DineInMenuItem } from '@/features/pos/config/dine-in';
import { listBranchMenuItems } from '@/lib/api/restaurant-branch-menus';
import type { FloorRequestOptions } from '@/lib/floors-server';
import { resolveFloorRequestContext } from '@/lib/floors-server';

export type DineInMenuPayload = Readonly<{
  items: DineInMenuItem[];
  branchId: number | null;
  loadError: string | null;
}>;

export async function loadDineInMenuData(
  options: FloorRequestOptions = {},
): Promise<DineInMenuPayload> {
  const ctx = await resolveFloorRequestContext(options);
  if (!ctx.token) {
    return { items: [], branchId: ctx.branchId, loadError: 'Sign in required.' };
  }
  if (ctx.branchId == null) {
    return { items: [], branchId: null, loadError: ctx.error };
  }

  try {
    const overrides = await listBranchMenuItems(ctx.token, ctx.branchId);
    return {
      items: mapBranchMenuItemsToDineIn(overrides),
      branchId: ctx.branchId,
      loadError: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to load menu.';
    return { items: [], branchId: ctx.branchId, loadError: message };
  }
}
