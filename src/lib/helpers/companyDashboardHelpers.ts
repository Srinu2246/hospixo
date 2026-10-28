import type {
  CompanyDashboardBranchPerformanceItem,
  CompanyDashboardData,
} from '@/lib/schemas/dashboard/companyDashboardSchema';
import type {
  OutletChartBarItem,
  OutletPerformanceRow,
  TaxItem,
} from '@/features/dashboard/types/dashboard.types';

export function formatDashboardAmount(value: string): string {
  const numericValue = Number(value.replace(/[^\d.-]/g, ''));
  if (!Number.isFinite(numericValue)) return value;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(numericValue);
}

export function formatNullableDashboardAmount(
  value: string | null | undefined,
  emptyLabel = '—',
): string {
  if (value == null || value.trim() === '') return emptyLabel;
  return formatDashboardAmount(value);
}

export function dashboardAmountAsNumber(value: string): number {
  const numericValue = Number(value.replace(/[^\d.-]/g, ''));
  return Number.isFinite(numericValue) ? numericValue : 0;
}

export function formatDashboardPercent(value: number): string {
  return `${value > 0 ? '+' : ''}${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(value)}%`;
}

/** Compact currency for donut centers (e.g. `₹111.3k`). */
export function formatCompactDashboardAmount(value: string): string {
  const amount = dashboardAmountAsNumber(value);
  if (amount >= 100_000) {
    return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(amount / 100_000)}L`;
  }
  if (amount >= 1_000) {
    return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(amount / 1_000)}k`;
  }
  return formatDashboardAmount(value);
}

export function mapBranchPerformanceToOutletRows(
  items: readonly CompanyDashboardBranchPerformanceItem[],
): OutletPerformanceRow[] {
  return items.map((row) => ({
    id: String(row.branch_id),
    outletName: row.branch_name,
    orders: row.total_orders,
    sales: formatDashboardAmount(row.total_sales),
    netSales: formatDashboardAmount(row.net_sales),
    tax: '—',
    discount: '—',
  }));
}

export function buildOutletChartBars(
  items: readonly CompanyDashboardBranchPerformanceItem[],
): OutletChartBarItem[] {
  if (items.length === 0) return [];
  const maxSales = Math.max(...items.map((row) => dashboardAmountAsNumber(row.total_sales)), 1);
  let highlightIndex = 0;
  let highlightSales = -1;
  items.forEach((row, index) => {
    const sales = dashboardAmountAsNumber(row.total_sales);
    if (sales > highlightSales) {
      highlightSales = sales;
      highlightIndex = index;
    }
  });

  return items.map((row, index) => ({
    id: String(row.branch_id),
    label: row.branch_name.length > 10 ? `${row.branch_name.slice(0, 9)}…` : row.branch_name,
    heightPercent: Math.max(
      8,
      Math.round((dashboardAmountAsNumber(row.total_sales) / maxSales) * 100),
    ),
    isHighlight: index === highlightIndex,
  }));
}

export function mapTaxSummaryToTaxItems(tax: CompanyDashboardData['tax_summary']): TaxItem[] {
  const total = dashboardAmountAsNumber(tax.total_tax);
  const rows: Array<{ label: string; amount: string; color: string; raw: number }> = [
    {
      label: 'CGST',
      amount: formatDashboardAmount(tax.cgst),
      color: '#22C55E',
      raw: dashboardAmountAsNumber(tax.cgst),
    },
    {
      label: 'SGST',
      amount: formatDashboardAmount(tax.sgst),
      color: '#38BDF8',
      raw: dashboardAmountAsNumber(tax.sgst),
    },
    {
      label: 'IGST',
      amount: formatDashboardAmount(tax.igst),
      color: '#F59E0B',
      raw: dashboardAmountAsNumber(tax.igst),
    },
  ];
  if (tax.service_tax) {
    rows.push({
      label: 'Service Tax',
      amount: formatDashboardAmount(tax.service_tax),
      color: '#8B5CF6',
      raw: dashboardAmountAsNumber(tax.service_tax),
    });
  }
  if (tax.vat) {
    rows.push({
      label: 'VAT',
      amount: formatDashboardAmount(tax.vat),
      color: '#EC4899',
      raw: dashboardAmountAsNumber(tax.vat),
    });
  }

  return rows.map((row) => {
    const percentage = total > 0 ? Math.round((row.raw / total) * 1000) / 10 : 0;
    const shareLabel = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 1,
    }).format(percentage);
    return {
      label: `${row.label} (${shareLabel}%)`,
      amount: row.amount,
      color: row.color,
      percentage,
    };
  });
}
