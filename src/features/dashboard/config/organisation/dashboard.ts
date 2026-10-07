import { routes } from '@/config/routes';
import {
  buildCompanyChartSeries,
  formatOrganisationCurrency,
  getOrganisationRangeProfile,
  resolveOrganisationDateRangeLabel,
  scaleOrganisationAmount,
} from '@/features/dashboard/lib/organisation-dashboard-format';
import type {
  OrganisationCompanyPerformanceRow,
  OrganisationDashboardOverview,
  OrganisationDashboardQuery,
  OrganisationDateRangeId,
  OrganisationPerformanceMetricId,
} from '@/features/dashboard/types/organisation-dashboard';

export const organisationDashboardCopy = {
  title: 'All Companies Statistics',
  exportButton: 'Export Data',
  companyPerformanceTitle: 'Company Performance',
  operationsSummaryTitle: 'Operations Summary',
  taxSummaryTitle: 'Tax Summary',
  financialBreakdownTitle: 'Financial Breakdown',
  topBranchesTitle: 'Top Performing Branches',
  subscriptionTitle: 'Subscription & Usage',
  currentPlanLabel: 'Current Plan',
  alertsTitle: 'Needs Attention',
  insightsTitle: 'AI Business Insights',
  quickHelpTitle: 'Quick Help',
  compareCompanies: 'Compare Companies',
  managePlan: 'Manage Plan',
  contactWhatsApp: 'Contact on WhatsApp',
  applyDetail: 'Apply Detail',
  view: 'View',
  cycleRenewal: 'Cycle / Renewal',
  dateRangeOptions: [
    { id: 'today', label: 'Today' },
    { id: 'last-7-days', label: 'Last 7 days' },
    { id: 'last-30-days', label: 'Last 30 days' },
    { id: 'custom', label: 'Custom' },
  ] as const satisfies ReadonlyArray<{ id: OrganisationDateRangeId; label: string }>,
  metricOptions: [
    { id: 'total-sales', label: 'Total Sales' },
    { id: 'revenue', label: 'Revenue' },
    { id: 'orders', label: 'Orders' },
    { id: 'profit', label: 'Profit' },
  ] as const,
  tableHeaders: {
    companyName: 'Company Name',
    branches: 'Branches',
    revenue: 'Revenue',
    orders: 'Orders',
    expenses: 'Expenses',
    profit: 'Profit',
    status: 'Status',
  },
} as const;

const performanceRows: readonly OrganisationCompanyPerformanceRow[] = [];

export function buildOrganisationDashboardFallback(
  query: OrganisationDashboardQuery = {},
): OrganisationDashboardOverview {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 6;
  const start = (page - 1) * pageSize;
  const metric: OrganisationPerformanceMetricId = query.metric ?? 'total-sales';

  const range: OrganisationDateRangeId = query.range ?? 'last-7-days';
  const customRange =
    range === 'custom' && query.from && query.to ? { from: query.from, to: query.to } : undefined;
  const rangeProfile = getOrganisationRangeProfile(range, customRange);
  const scaleRange = (amount: number) => scaleOrganisationAmount(amount, range, customRange);
  const scaledPerformanceRows = performanceRows.map((row) => ({
    ...row,
    revenue: scaleRange(row.revenue),
    orders: Math.max(1, Math.round(row.orders * rangeProfile.scale)),
    expenses: scaleRange(row.expenses),
    profit: scaleRange(row.profit),
  }));
  const totalSales = 0;
  const netSales = 0;

  return {
    dateRangeLabel: resolveOrganisationDateRangeLabel(range, customRange),
    kpis: [
      {
        id: 'total-sales',
        label: 'Total Sales',
        value: formatOrganisationCurrency(totalSales),
        changePercent: 0,
        changeLabel: rangeProfile.changeLabel,
      },
      {
        id: 'net-sales',
        label: 'Net Sales',
        value: formatOrganisationCurrency(netSales),
        changePercent: 0,
        changeLabel: rangeProfile.changeLabel,
      },
      {
        id: 'companies',
        label: 'Companies',
        value: String(scaledPerformanceRows.length),
        helperText: 'Active',
      },
      {
        id: 'branches',
        label: 'Branches',
        value: '0',
        helperText: 'Total',
      },
    ],
    performanceMetric: metric,
    allPerformanceRows: scaledPerformanceRows.map((row) => ({
      ...row,
      href: routes.dashboard.company,
    })),
    performanceRows: scaledPerformanceRows.slice(start, start + pageSize).map((row) => ({
      ...row,
      href: routes.dashboard.company,
    })),
    performanceTotal: scaledPerformanceRows.length,
    performancePage: page,
    performancePageSize: pageSize,
    companySeries: buildCompanyChartSeries(scaledPerformanceRows, metric),
    taxSummary: {
      total: 0,
      items: [],
    },
    financialBreakdown: [
      {
        id: 'cogs',
        label: 'COGS',
        percent: 0,
        amount: 0,
        tone: 'cogs',
      },
      {
        id: 'expenses',
        label: 'Expenses',
        percent: 0,
        amount: 0,
        tone: 'expenses',
      },
      {
        id: 'profit',
        label: 'Profit',
        percent: 0,
        amount: 0,
        tone: 'profit',
      },
      {
        id: 'taxes',
        label: 'Taxes',
        percent: 0,
        amount: 0,
        tone: 'taxes',
      },
    ],
    topBranches: [],
    subscription: {
      plan: 'Enterprise Pro',
      status: 'active',
      billingCycle: 'Monthly',
      renewalDate: '-',
      managePlanHref: routes.dashboard.company,
      usage: [
        { id: 'companies', label: 'Companies', used: 0, limit: 10 },
        { id: 'branches', label: 'Branches', used: 0, limit: 50 },
        { id: 'users', label: 'Active Users', used: 0, limit: 500 },
        { id: 'devices', label: 'Devices', used: 0, limit: 250 },
      ],
    },
    alerts: [],
    insights: [],
    accountManager: {
      name: 'Hospixo Support',
      role: 'Account Support',
      avatarInitials: 'HS',
      isOnline: true,
      employeeId: 'EMP-001',
      availability: '10:00 AM - 07:00 PM',
      whatsappPhone: '919876543210',
    },
  };
}

export const organisationDashboardFallbackData = buildOrganisationDashboardFallback();

export { parseOrganisationDashboardQuery } from '@/features/dashboard/api/organisation-dashboard';
