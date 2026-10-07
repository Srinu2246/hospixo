import {
  getOrganisationRangeProfile,
  resolveOrganisationDateRangeLabel,
} from '@/features/dashboard/lib/organisation-dashboard-format';
import type { DashboardOverview } from '@/features/dashboard/types';
import type { OrganisationDateRangeId } from '@/features/dashboard/types/organisation-dashboard';

const BASE_RANGE_SCALE = 1;

export type CompanyDashboardDisplayData = DashboardOverview &
  Readonly<{
    dateRangeLabel: string;
  }>;

export function getDefaultCompanyCustomRange(): Readonly<{ from: string; to: string }> {
  return { from: '2026-06-28', to: '2026-07-04' };
}

function scaleMetric(
  metric: DashboardOverview['kpis']['totalSales'],
  scaleFactor: number,
  changePercent: number,
  changeLabel: string,
) {
  return {
    ...metric,
    amount: Math.max(0, Math.round(metric.amount * scaleFactor)),
    changePercent: metric.changePercent !== 0 ? metric.changePercent : changePercent,
    changeLabel,
  };
}

function scaleAmount(amount: number, scaleFactor: number) {
  return Math.max(0, Math.round(amount * scaleFactor));
}

export function buildCompanyDashboardData(
  base: DashboardOverview,
  options: Readonly<{
    range: OrganisationDateRangeId;
    from?: string;
    to?: string;
  }>,
): CompanyDashboardDisplayData {
  const profile = getOrganisationRangeProfile(options.range, {
    from: options.from,
    to: options.to,
  });
  const scaleFactor = profile.scale / BASE_RANGE_SCALE;

  return {
    ...base,
    dateRangeLabel: resolveOrganisationDateRangeLabel(options.range, {
      from: options.from ?? '',
      to: options.to ?? '',
    }),
    kpis: {
      totalSales: scaleMetric(
        base.kpis.totalSales,
        scaleFactor,
        profile.totalSalesChange,
        profile.changeLabel,
      ),
      netSales: scaleMetric(
        base.kpis.netSales,
        scaleFactor,
        profile.netSalesChange,
        profile.changeLabel,
      ),
      onlineSales: scaleMetric(
        base.kpis.onlineSales,
        scaleFactor,
        base.kpis.onlineSales.changePercent,
        profile.changeLabel,
      ),
      offlineSales: scaleMetric(
        base.kpis.offlineSales,
        scaleFactor,
        base.kpis.offlineSales.changePercent,
        profile.changeLabel,
      ),
    },
    salesByOutlet: base.salesByOutlet.map((row) => ({
      ...row,
      orders: Math.max(0, Math.round(row.orders * scaleFactor)),
      sales: scaleAmount(row.sales, scaleFactor),
      netSales: scaleAmount(row.netSales, scaleFactor),
      tax: scaleAmount(row.tax, scaleFactor),
      discount: scaleAmount(row.discount, scaleFactor),
      waivedCharges: scaleAmount(row.waivedCharges, scaleFactor),
    })),
    taxSummary: {
      total: scaleAmount(base.taxSummary.total, scaleFactor),
      items: base.taxSummary.items.map((item) => ({
        ...item,
        amount: scaleAmount(item.amount, scaleFactor),
      })),
    },
    discountsSummary: {
      total: scaleAmount(base.discountsSummary.total, scaleFactor),
      items: base.discountsSummary.items.map((item) => ({
        ...item,
        amount: scaleAmount(item.amount, scaleFactor),
      })),
    },
    revenueForecast: {
      total: scaleAmount(base.revenueForecast.total, scaleFactor),
      confidence: base.revenueForecast.confidence,
      series: base.revenueForecast.series.map((val) => scaleAmount(val, scaleFactor)),
    },
    customerInsights: {
      ...base.customerInsights,
      averageOrderValue: scaleAmount(base.customerInsights.averageOrderValue, scaleFactor),
      peakHours: base.customerInsights.peakHours.map((row) =>
        row.map((val) => scaleAmount(val, scaleFactor)),
      ),
    },
    expenses: {
      total: scaleAmount(base.expenses.total, scaleFactor),
      items: base.expenses.items.map((item) => ({
        ...item,
        amount: scaleAmount(item.amount, scaleFactor),
      })),
    },
  };
}
