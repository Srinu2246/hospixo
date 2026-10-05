import { routes } from '@/config/routes';
import { organisationChartColors } from '@/features/dashboard/lib/organisation-chart-colors';
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
  const totalSales = scaleRange(4_852_300);
  const netSales = scaleRange(4_218_750);

  return {
    dateRangeLabel: resolveOrganisationDateRangeLabel(range, customRange),
    kpis: [
      {
        id: 'total-sales',
        label: 'Total Sales',
        value: formatOrganisationCurrency(totalSales),
        changePercent: rangeProfile.totalSalesChange,
        changeLabel: rangeProfile.changeLabel,
      },
      {
        id: 'net-sales',
        label: 'Net Sales',
        value: formatOrganisationCurrency(netSales),
        changePercent: rangeProfile.netSalesChange,
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
      total: scaleRange(111_300),
      items: [
        {
          label: 'CGST',
          amount: scaleRange(27_800),
          color: organisationChartColors.blue,
          shareLabel: '2.5%',
        },
        {
          label: 'SGST',
          amount: scaleRange(13_900),
          color: organisationChartColors.green,
          shareLabel: '12.5%',
        },
        {
          label: 'Service Tax',
          amount: scaleRange(42_000),
          color: organisationChartColors.amber,
        },
        {
          label: 'VAT',
          amount: scaleRange(27_600),
          color: organisationChartColors.purple,
        },
      ],
    },
    financialBreakdown: [
      {
        id: 'cogs',
        label: 'COGS',
        percent: 49.2,
        amount: scaleRange(2_386_500),
        tone: 'cogs',
      },
      {
        id: 'expenses',
        label: 'Expenses',
        percent: 20.3,
        amount: scaleRange(984_000),
        tone: 'expenses',
      },
      {
        id: 'profit',
        label: 'Profit',
        percent: 17.1,
        amount: scaleRange(829_000),
        tone: 'profit',
      },
      {
        id: 'taxes',
        label: 'Taxes',
        percent: 5.1,
        amount: scaleRange(247_000),
        tone: 'taxes',
      },
    ],
    topBranches: [],
    subscription: {
      plan: 'Enterprise Pro',
      status: 'active',
      billingCycle: 'Monthly',
      renewalDate: '2025-09-15',
      managePlanHref: routes.dashboard.company,
      usage: [
        { id: 'companies', label: 'Companies', used: 3, limit: 10 },
        { id: 'branches', label: 'Branches', used: 8, limit: 50 },
        { id: 'users', label: 'Active Users', used: 142, limit: 500 },
        { id: 'devices', label: 'Devices', used: 142, limit: 250 },
      ],
    },
    alerts: [
      {
        id: 'budget',
        title: '3 branches exceeded budget threshold',
        occurredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        severity: 'critical',
        href: routes.dashboard.company,
      },
      {
        id: 'license',
        title: 'License renewal due in 14 days',
        occurredAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        severity: 'warning',
        href: routes.dashboard.company,
      },
      {
        id: 'inventory',
        title: 'Inventory sync failed at 2 locations',
        occurredAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        severity: 'critical',
        href: routes.dashboard.company,
      },
    ],
    insights: [
      {
        id: 'revenue',
        title: 'Revenue at Marina Branch increased 34% compared to last week',
        confidence: 94,
      },
      {
        id: 'staffing',
        title: 'Weekend sales spike expected — increase staffing by 15% on Fri-Sat',
        confidence: 87,
      },
      {
        id: 'menu',
        title: "Menu item 'Grilled Platter' underperforming — consider promotion or removal",
        confidence: 76,
      },
    ],
    accountManager: {
      name: 'Kumar Reddy',
      role: 'Account Manager',
      avatarInitials: 'KR',
      isOnline: true,
      employeeId: 'EMP-2847',
      availability: '10:00 AM - 07:00 PM',
      whatsappPhone: '919876543210',
    },
  };
}

export const organisationDashboardFallbackData = buildOrganisationDashboardFallback();

export { parseOrganisationDashboardQuery } from '@/features/dashboard/api/organisation-dashboard';
