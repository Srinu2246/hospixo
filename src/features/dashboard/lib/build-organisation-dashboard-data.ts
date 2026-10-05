import {
  buildCompanyChartSeries,
  getOrganisationRangeProfile,
  resolveOrganisationDateRangeLabel,
  scaleOrganisationAmount,
} from '@/features/dashboard/lib/organisation-dashboard-format';
import type {
  OrganisationDashboardOverview,
  OrganisationDashboardQuery,
  OrganisationDateRangeId,
  OrganisationPerformanceMetricId,
} from '@/features/dashboard/types/organisation-dashboard';

export function buildOrganisationDashboardData(
  base: OrganisationDashboardOverview,
  query: OrganisationDashboardQuery = {},
): OrganisationDashboardOverview {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? base.performancePageSize ?? 6;
  const start = (page - 1) * pageSize;
  const metric: OrganisationPerformanceMetricId =
    query.metric ?? base.performanceMetric ?? 'total-sales';

  const range: OrganisationDateRangeId = query.range ?? 'last-7-days';
  const customRange =
    range === 'custom' && query.from && query.to ? { from: query.from, to: query.to } : undefined;
  const rangeProfile = getOrganisationRangeProfile(range, customRange);
  const scaleRange = (amount: number) => scaleOrganisationAmount(amount, range, customRange);

  const sourceRows = base.allPerformanceRows ?? base.performanceRows ?? [];

  const scaledPerformanceRows = sourceRows.map((row) => ({
    ...row,
    revenue: scaleRange(row.revenue),
    orders: Math.max(0, Math.round(row.orders * rangeProfile.scale)),
    expenses: scaleRange(row.expenses),
    profit: scaleRange(row.profit),
  }));

  const paginatedRows = scaledPerformanceRows.slice(start, start + pageSize);

  return {
    ...base,
    dateRangeLabel: resolveOrganisationDateRangeLabel(range, customRange),
    performanceMetric: metric,
    allPerformanceRows: scaledPerformanceRows,
    performanceRows: paginatedRows,
    performanceTotal: scaledPerformanceRows.length,
    performancePage: page,
    performancePageSize: pageSize,
    companySeries: buildCompanyChartSeries(scaledPerformanceRows, metric),
    taxSummary: {
      total: scaleRange(base.taxSummary.total),
      items: base.taxSummary.items.map((item) => ({
        ...item,
        amount: scaleRange(item.amount),
      })),
    },
    financialBreakdown: base.financialBreakdown.map((item) => ({
      ...item,
      amount: scaleRange(item.amount),
    })),
  };
}
