import { companyDashboardFallbackData } from '@/features/dashboard/config/company';
import { organisationChartColors } from '@/features/dashboard/lib/organisation-chart-colors';
import type { LiveBranch } from '@/features/dashboard/api/organisation-dashboard.server';
import type { DashboardOverview, OutletSalesRow } from '@/features/dashboard/types';

const EMPTY_METRIC = {
  amount: 0,
  currency: 'INR',
  changePercent: 0,
  changeLabel: 'current total',
} as const;

function buildSalesRows(branches: readonly LiveBranch[]): OutletSalesRow[] {
  return branches.map((branch) => ({
    outletId: branch.id,
    outletName: branch.name,
    orders: 0,
    sales: 0,
    netSales: 0,
    tax: 0,
    discount: 0,
    modified: 0,
    reprinted: 0,
    waivedCharges: 0,
  }));
}

export function buildCompanyDashboardOverview(
  branches: readonly LiveBranch[],
  outletId = 'all',
): DashboardOverview {
  const activeCount = branches.filter((branch) => branch.status === 'active').length;
  const filteredBranches =
    outletId === 'all' ? branches : branches.filter((branch) => branch.id === String(outletId));

  const outlets = [
    { id: 'all', name: 'All Branches' },
    ...branches.map((branch) => ({
      id: branch.id,
      name: branch.name,
    })),
  ];

  if (branches.length === 0) {
    return companyDashboardFallbackData;
  }

  const template = companyDashboardFallbackData;

  return {
    ...template,
    outlets,
    branchStats: {
      total: branches.length,
      active: activeCount || branches.length,
    },
    kpis: {
      totalSales: { ...EMPTY_METRIC },
      netSales: { ...EMPTY_METRIC },
      onlineSales: { ...EMPTY_METRIC },
      offlineSales: { ...EMPTY_METRIC },
    },
    salesByOutlet: buildSalesRows(filteredBranches.length > 0 ? filteredBranches : branches),
    taxSummary: {
      total: 0,
      items: [
        {
          label: 'CGST',
          amount: 0,
          color: organisationChartColors.blue,
          shareLabel: '0%',
        },
        {
          label: 'SGST',
          amount: 0,
          color: organisationChartColors.green,
          shareLabel: '0%',
        },
      ],
    },
    discountsSummary: {
      total: 0,
      items: [],
    },
    revenueForecast: {
      total: 0,
      confidence: 'Awaiting sales data',
      series: [0, 0, 0, 0, 0, 0, 0],
    },
    customerInsights: {
      newCustomerRate: 0,
      averageOrderValue: 0,
      aovChangePercent: 0,
      peakHours: template.customerInsights.peakHours,
    },
    expenses: {
      total: 0,
      items: [],
    },
    leakage: template.leakage,
    accountManager: template.accountManager,
  };
}
