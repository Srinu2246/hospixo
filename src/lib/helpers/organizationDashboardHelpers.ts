import type {
  OrganizationDashboardCompanyItem,
  OrganizationDashboardData,
  OrganizationDashboardTopBranch,
} from '@/lib/schemas/dashboard/organizationDashboardSchema';
import type {
  CompanyPerformanceRow,
  TopPerformingBranch,
} from '@/features/dashboard/types/dashboard.types';
import {
  dashboardAmountAsNumber,
  formatDashboardAmount,
  mapTaxSummaryToTaxItems,
} from '@/lib/helpers/companyDashboardHelpers';

function formatOrderCount(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value);
}

function mapCompanyStatus(status: string): CompanyPerformanceRow['status'] {
  const normalized = status.toLowerCase();
  if (normalized === 'inactive') return 'inactive';
  if (normalized === 'draft' || normalized === 'warning') return 'warning';
  return 'active';
}

export function mapOrganizationCompanyPerformanceRows(
  items: readonly OrganizationDashboardCompanyItem[],
): CompanyPerformanceRow[] {
  return items.map((row) => {
    const revenueNumeric = dashboardAmountAsNumber(row.total_sales);
    const profitRaw = row.profit != null ? dashboardAmountAsNumber(row.profit) : null;
    const expensesDisplay = row.expenses != null ? formatDashboardAmount(row.expenses) : '—';
    const profitDisplay = row.profit != null ? formatDashboardAmount(row.profit) : '—';

    return {
      id: String(row.company_id),
      companyName: row.company_name,
      branches: row.total_branches,
      revenue: formatDashboardAmount(row.total_sales),
      revenueNumeric,
      orders: formatOrderCount(row.total_orders),
      expenses: expensesDisplay,
      profit: profitDisplay,
      isProfitPositive: profitRaw == null ? true : profitRaw >= 0,
      status: mapCompanyStatus(row.status),
    };
  });
}

export function mapOrganizationTopBranches(
  items: readonly OrganizationDashboardTopBranch[],
): TopPerformingBranch[] {
  return items.map((branch, index) => ({
    rank: index + 1,
    name: branch.branch_name,
    companyName: branch.company_name,
    revenue: formatDashboardAmount(branch.total_sales),
  }));
}

export function mapOrganizationTaxSummary(tax: OrganizationDashboardData['tax_summary']) {
  return mapTaxSummaryToTaxItems(tax);
}

export {
  formatDashboardAmount,
  formatCompactDashboardAmount,
  formatDashboardPercent,
} from '@/lib/helpers/companyDashboardHelpers';
