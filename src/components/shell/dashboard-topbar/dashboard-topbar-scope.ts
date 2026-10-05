import { routes } from '@/config/routes';
import { dashboardLoadCopy } from '@/features/dashboard/lib/user-facing-load-error';
import type { DashboardOutlet } from '@/features/dashboard/types';
import type { AuthUser } from '@/lib/auth';

export function pathMatches(pathname: string, base: string) {
  return pathname === base || pathname.startsWith(`${base}/`);
}

/** Branch manager workspace — current branch only, no switching. */
export function isBranchScopePath(pathname: string) {
  return pathMatches(pathname, routes.dashboard.branch);
}

/** Branch-scoped users are fixed to their assigned branch. */
export function canSwitchBranch(user: AuthUser | null) {
  return user != null && user.scope !== 'branch';
}

/** Org / company dashboards — filter stats by branch. */
export function isBranchPickerPath(pathname: string) {
  return (
    pathMatches(pathname, routes.dashboard.company) ||
    pathMatches(pathname, routes.dashboard.organisation)
  );
}

/** Company overview KPI page — company-wide by default, not a single branch label. */
export function isCompanyDashboardHome(pathname: string) {
  return pathname === routes.dashboard.company;
}

export function isOrganisationPath(pathname: string) {
  return pathMatches(pathname, routes.dashboard.organisation);
}

export function resolveCompanyPickerHref(companyId: string): string {
  return `${routes.dashboard.company}?company_id=${encodeURIComponent(companyId)}`;
}

export function resolveCurrentBranchName(
  outlets: readonly DashboardOutlet[],
  outletId: string,
  user: AuthUser | null,
): string {
  if (user?.branch_id != null) {
    const match = outlets.find((outlet) => outlet.id === String(user.branch_id));
    if (match) return match.name;
    return dashboardLoadCopy.assignedOutlet;
  }

  const selected = outlets.find((outlet) => outlet.id === outletId);
  if (selected && selected.id !== 'all') return selected.name;

  const branches = outlets.filter((outlet) => outlet.id !== 'all');
  if (outletId === 'all') {
    const allOption = outlets.find((outlet) => outlet.id === 'all');
    if (allOption && branches.length > 0) return allOption.name;
  }

  if (branches.length === 1) return branches[0]!.name;

  return dashboardLoadCopy.unknownOutlet;
}

/** Navigate to branch dashboard when a specific branch is picked on org/company routes. */
export function resolveBranchPickerHref(
  pathname: string,
  outletId: string,
  companyId?: string | null,
): string | null {
  if (!isBranchPickerPath(pathname) || outletId === 'all') {
    return null;
  }

  if (isCompanyDashboardHome(pathname)) {
    return null;
  }

  const params = new URLSearchParams({ outlet: outletId });
  if (companyId) {
    params.set('company_id', companyId);
  }

  return `${routes.dashboard.branch}?${params.toString()}`;
}

/** Settings entry point for company vs branch workspace shells. */
export function resolveWorkspaceSettingsHref(pathname: string): string {
  if (pathMatches(pathname, routes.dashboard.branch)) {
    return '/settings/branch';
  }
  if (pathMatches(pathname, routes.dashboard.company)) {
    return '/settings/company';
  }
  return routes.dashboard.settings;
}
