import 'server-only';

import { dashboardFallbackOverview, dashboardQuickActions } from '@/constants/admin/dashboard';
import { enrichDashboardOverview } from '@/helpers/dashboard/enrichDashboardOverview';
import { listOrganizations } from '@/services/organizations';
import type { AdminDashboardOverview } from '@/types/dashboard';

export async function getDashboardOverview(): Promise<{
  data: AdminDashboardOverview;
  source: 'fallback';
}> {
  const organizations = await listOrganizations();
  const data = enrichDashboardOverview(
    {
      ...dashboardFallbackOverview,
      quickActions: dashboardQuickActions,
    },
    organizations.items,
    [],
  );

  return { data, source: 'fallback' };
}
