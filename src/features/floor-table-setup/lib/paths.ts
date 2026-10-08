import { routes } from '@/config/routes';
import { flowPaths } from '@/config/shell/flow-paths';
import { resolveAccessLevel, resolveHierarchyHomePath } from '@/lib/auth/access-level';
import type { FloorDetailTabId } from '@/features/floor-table-setup/types/floor-table-setup';

type PickerUser = Readonly<{
  roles?: readonly string[] | null;
  scope?: string | null;
  company_id?: number | string | null;
  branch_id?: number | string | null;
}>;

export function isPasswordChangeRequiredError(message: string | null | undefined) {
  return Boolean(message && /password change is required/i.test(message));
}

export function isSafeAppPath(value: string) {
  return value.startsWith('/') && !value.startsWith('//');
}

export function profileChangePasswordPath(next = floorTableSetupPath()) {
  const params = new URLSearchParams({ changePassword: '1', next });
  return `${routes.dashboard.profile}?${params.toString()}`;
}

function withOutletAndFloor(
  base: string,
  outletId?: string | number | null,
  floorId?: string | null,
) {
  const params = new URLSearchParams();
  if (outletId != null && outletId !== '') {
    params.set('outlet', String(outletId));
  }
  if (floorId) params.set('floorId', floorId);
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

export function floorTableSetupPath(outletId?: string | number | null) {
  return withOutletAndFloor(flowPaths.branch.floorTableSetup, outletId);
}

export function floorCreatePath(outletId?: string | number | null, floorId?: string | null) {
  return withOutletAndFloor(`${flowPaths.branch.floorTableSetup}/create`, outletId, floorId);
}

/** Company/org dashboard with a return URL so the user can pick a branch first. */
export function floorSetupPickerPath(user?: PickerUser | null, next = floorCreatePath()) {
  const level = user
    ? resolveAccessLevel({
        roles: user.roles ?? [],
        scope: user.scope ?? 'tenant',
        company_id:
          user.company_id == null
            ? null
            : typeof user.company_id === 'number'
              ? user.company_id
              : Number(user.company_id) || null,
        branch_id:
          user.branch_id == null
            ? null
            : typeof user.branch_id === 'number'
              ? user.branch_id
              : Number(user.branch_id) || null,
      })
    : 'organisation';
  const home = resolveHierarchyHomePath(level) ?? routes.dashboard.company;
  return `${home}?next=${encodeURIComponent(next)}`;
}

export function floorDetailPath(
  floorId: string,
  tab?: FloorDetailTabId,
  outletId?: string | number | null,
) {
  const params = new URLSearchParams();
  if (outletId != null && outletId !== '') {
    params.set('outlet', String(outletId));
  }
  if (tab && tab !== 'overview') {
    params.set('tab', tab);
  }
  const path = `${flowPaths.branch.floorTableSetup}/${encodeURIComponent(floorId)}`;
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}
