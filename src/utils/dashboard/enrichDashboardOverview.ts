import type {
  AdminDashboardOverview,
  DashboardActivityItem,
  DashboardMetric,
} from '@/types/dashboard';
import type { OrganizationActivityItem, OrganizationSummary } from '@/types/organization';

export function toDashboardActivityItem(item: OrganizationActivityItem): DashboardActivityItem {
  const companyMatch = item.title.match(/^New company (.+) added$/);
  const branchMatch = item.title.match(/^New branch (.+) added$/);

  return {
    id: item.id,
    companyName: companyMatch?.[1] ?? branchMatch?.[1] ?? item.title,
    description: item.title,
    status: 'created',
    occurredAt: item.occurredAt,
  };
}

export function mergeDashboardRecentActivity(
  apiActivity: readonly DashboardActivityItem[],
  storedActivity: readonly OrganizationActivityItem[],
  limit = 5,
): DashboardActivityItem[] {
  const byId = new Map<string, DashboardActivityItem>();
  const storedIds = new Set(storedActivity.map((item) => item.id));

  for (const item of [...storedActivity.map(toDashboardActivityItem), ...apiActivity]) {
    if (Number.isNaN(Date.parse(item.occurredAt))) continue;
    if (!byId.has(item.id)) {
      byId.set(item.id, item);
    }
  }

  return [...byId.values()]
    .sort((left, right) => {
      const storedPriority = Number(storedIds.has(right.id)) - Number(storedIds.has(left.id));
      return storedPriority || Date.parse(right.occurredAt) - Date.parse(left.occurredAt);
    })
    .slice(0, limit);
}

export function buildLiveDashboardMetrics(input: {
  organizations: readonly OrganizationSummary[];
  storedActivity?: readonly OrganizationActivityItem[];
}): DashboardMetric[] {
  const { organizations } = input;
  const totalOrganizations = organizations.length;
  const activeOrganizations = organizations.filter((org) => org.status === 'active').length;
  const trialOrganizations = organizations.filter((org) => org.status === 'trial').length;
  const totalBranches = organizations.reduce((sum, org) => sum + org.branchCount, 0);
  const totalCompanies = organizations.reduce((sum, org) => sum + org.companyCount, 0);
  const changeLabel = 'current total';

  return [
    {
      id: 'total-organizations',
      label: 'Total Organizations',
      value: totalOrganizations,
      changePercent: 0,
      changeLabel,
    },
    {
      id: 'active-organizations',
      label: 'Active Organizations',
      value: activeOrganizations,
      changePercent: 0,
      changeLabel,
    },
    {
      id: 'trial-organizations',
      label: 'Trial Organizations',
      value: trialOrganizations,
      changePercent: 0,
      changeLabel,
    },
    {
      id: 'total-companies',
      label: 'Total Companies',
      value: totalCompanies,
      changePercent: 0,
      changeLabel,
    },
    {
      id: 'total-branches',
      label: 'Total Branches',
      value: totalBranches,
      changePercent: 0,
      changeLabel,
    },
    {
      id: 'total-users',
      label: 'Total Users',
      value: 0,
      changePercent: 0,
      changeLabel,
    },
  ];
}

export function enrichDashboardOverview(
  overview: AdminDashboardOverview,
  organizations: readonly OrganizationSummary[],
  storedActivity: readonly OrganizationActivityItem[],
): AdminDashboardOverview {
  const hasLiveData = organizations.length > 0 || storedActivity.length > 0;

  return {
    ...overview,
    metrics: hasLiveData
      ? buildLiveDashboardMetrics({ organizations, storedActivity })
      : overview.metrics,
    recentActivity: mergeDashboardRecentActivity(overview.recentActivity, storedActivity),
  };
}
