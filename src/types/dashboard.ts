/** Status badge for recent-activity rows — maps to API `status` values. */
export type DashboardActivityStatus = 'created' | 'warning' | 'trial' | 'failed';

export type DashboardMetric = Readonly<{
  id: string;
  label: string;
  value: number;
  /** Signed percentage change vs prior period (e.g. 8.2 = +8.2%). */
  changePercent: number;
  changeLabel: string;
}>;

export type DashboardActivityItem = Readonly<{
  id: string;
  companyName: string;
  description: string;
  status: DashboardActivityStatus;
  /** ISO-8601 timestamp from API; UI formats for display. */
  occurredAt: string;
}>;

export type DashboardQuickAction = Readonly<{
  id: string;
  title: string;
  description: string;
  href: string;
}>;

/**
 * Control-plane dashboard overview — expected from
 * `GET /api/v1/admin/dashboard/overview` (or equivalent).
 */
export type AdminDashboardOverview = Readonly<{
  metrics: readonly DashboardMetric[];
  recentActivity: readonly DashboardActivityItem[];
  quickActions?: readonly DashboardQuickAction[];
  generatedAt?: string;
}>;
