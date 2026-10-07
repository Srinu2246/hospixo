import { buildCompanyDashboardOverview } from '@/features/dashboard/api/build-company-dashboard-overview';
import type { LiveBranch } from '@/features/dashboard/api/organisation-dashboard.server';
import type { DashboardOverview } from '@/features/dashboard/types';

/** Re-filter SSR/bootstrap overview when ?outlet= changes — no extra backend branch fetch. */
export function applyCompanyOutletFilter(
  overview: DashboardOverview,
  outletId: string,
): DashboardOverview {
  if (outletId === 'all') {
    return overview;
  }

  const branches: LiveBranch[] = overview.outlets
    .filter((outlet) => outlet.id !== 'all')
    .map((outlet) => ({
      id: outlet.id,
      name: outlet.name,
      companyId: '',
      status: 'active' as const,
    }));

  return buildCompanyDashboardOverview(branches, outletId);
}
