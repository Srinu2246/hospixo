import { routes } from '@/config/routes';

/** Routes that render the full dashboard overview (KPIs, charts) and need `/dashboard/overview`. */
export const FULL_BLEED_DASHBOARD_PATHS: ReadonlySet<string> = new Set([
  routes.dashboard.organisation,
  routes.dashboard.company,
  routes.dashboard.branch,
]);

export function isFullBleedDashboardPath(pathname: string): boolean {
  return FULL_BLEED_DASHBOARD_PATHS.has(pathname);
}

export function pathnameNeedsDashboardOverview(pathname: string): boolean {
  return isFullBleedDashboardPath(pathname);
}
