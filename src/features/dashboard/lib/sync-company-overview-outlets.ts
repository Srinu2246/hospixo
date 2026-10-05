import type { DashboardOverview } from '@/features/dashboard/types';

/** Passthrough until live branch sync is wired to the BFF. */
export function syncCompanyOverviewBranchPresentation(
  overview: DashboardOverview,
): DashboardOverview {
  return overview;
}
