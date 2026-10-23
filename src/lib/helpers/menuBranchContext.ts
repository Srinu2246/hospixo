import { ApiError } from '@/services/api/types';
import { useSidebarStore } from '@/stores/sidebarStore';

import type { MenuItemStatusChangeBody } from '@/lib/schemas/menu/menuItemsSchema';

export type MenuCataloguePageScope = 'branch' | 'company' | 'organization';

export function resolveMenuBranchIdFromStore(): number | undefined {
  const { context, account } = useSidebarStore.getState();
  const raw = context.branchId ?? account?.branch_id;
  if (raw == null) return undefined;
  const id = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(id) && id > 0 ? id : undefined;
}

/** Branch routes must send branch_id on item status writes so the API matches session scope. */
export function buildMenuItemStatusChangeBody(
  pageScope: MenuCataloguePageScope | undefined,
): MenuItemStatusChangeBody {
  if (pageScope !== 'branch') {
    return {};
  }

  const branchId = resolveMenuBranchIdFromStore();
  if (branchId == null) {
    throw new ApiError('Branch is required to update item status for this account.', 400);
  }

  return { branch_id: branchId };
}
