import 'server-only';

import { toCreateRestaurantMenuPayload } from '@/features/menu/api/restaurant-menus-map';
import type { CreateRestaurantMenuInput } from '@/features/menu/types/restaurant-menu';
import { COMPANY_ROLES, ORG_ROLES, hasAnyRole } from '@/lib/auth/access-level';
import { getServerAuthSession } from '@/lib/auth/session';

function isUiCreateRestaurantMenuInput(body: unknown): body is CreateRestaurantMenuInput {
  return Boolean(body && typeof body === 'object' && 'menuType' in body);
}

function toRecord(payload: unknown): Record<string, unknown> {
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    return { ...(payload as Record<string, unknown>) };
  }
  return {};
}

/** Branch users must create outlet-scoped menus or backend returns 403 on later mutations. */
export async function resolveRestaurantMenuCreatePayload(body: unknown): Promise<unknown> {
  const payload = isUiCreateRestaurantMenuInput(body)
    ? toCreateRestaurantMenuPayload(body)
    : toRecord(body);

  const session = await getServerAuthSession();
  const user = session?.user;
  if (!user?.branch_id) return payload;

  const roles = user.roles ?? [];
  if (hasAnyRole(roles, [...ORG_ROLES, ...COMPANY_ROLES])) {
    return payload;
  }

  const branchId = Number(user.branch_id);
  if (!Number.isFinite(branchId) || branchId <= 0) return payload;

  if (payload.scope === 'branch' && payload.assign_branch_id != null) {
    return payload;
  }

  return {
    ...payload,
    scope: 'branch',
    assign_branch_id: branchId,
  };
}

/** Ensures branch staff create/update items with outlet scope (avoids 403 on PATCH/deactivate). */
export async function applyBranchUserMenuItemScope(
  payload: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const session = await getServerAuthSession();
  const user = session?.user;
  if (!user?.branch_id) {
    return payload;
  }

  const roles = user.roles ?? [];
  if (hasAnyRole(roles, [...ORG_ROLES, ...COMPANY_ROLES])) {
    return payload;
  }

  const branchId = Number(user.branch_id);
  if (!Number.isFinite(branchId) || branchId <= 0) {
    return payload;
  }

  const scope = payload.scope;
  const assignBranchId = payload.assign_branch_id;

  if (scope === 'branch' && assignBranchId != null) {
    return payload;
  }

  return {
    ...payload,
    scope: 'branch',
    assign_branch_id: branchId,
  };
}
