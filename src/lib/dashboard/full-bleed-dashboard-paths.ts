import { routes } from '@/config/routes';

export const FULL_BLEED_DASHBOARD_PATHS: ReadonlySet<string> = new Set([
  routes.dashboard.organisation,
  routes.dashboard.company,
  routes.dashboard.branch,
  '/organisation/companies',
  '/organisation/branches',
  '/company/branches',
  '/branches',
]);

export function isFullBleedDashboardPath(pathname: string): boolean {
  return FULL_BLEED_DASHBOARD_PATHS.has(pathname);
}

export function pathnameNeedsDashboardOverview(pathname: string): boolean {
  return (
    pathname === routes.dashboard.organisation ||
    pathname === routes.dashboard.company ||
    pathname === routes.dashboard.branch
  );
}
