import {
  getOrganisationRangeProfile,
  resolveOrganisationDateRangeLabel,
} from '@/features/dashboard/lib/organisation-dashboard-format';
import type {
  BranchDashboardDisplayData,
  BranchDashboardOverview,
  BranchDashboardPeriod,
} from '@/features/dashboard/types/branch-dashboard';
import type { OrganisationDateRangeId } from '@/features/dashboard/types/organisation-dashboard';

const BASE_RANGE_SCALE = 1;

const periodScale: Record<BranchDashboardPeriod, number> = {
  today: 1,
  yesterday: 1,
  week: 1,
};

function scaleMetric(
  metric: BranchDashboardOverview['kpis']['totalSales'],
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

function scaleOrderTypes(rows: BranchDashboardOverview['salesByOrderType'], scaleFactor: number) {
  return rows.map((row) => ({
    ...row,
    sales: scaleAmount(row.sales, scaleFactor),
    orders: Math.max(0, Math.round(row.orders * scaleFactor)),
  }));
}

export function buildBranchDashboardData(
  base: BranchDashboardOverview,
  options: Readonly<{
    range: OrganisationDateRangeId;
    from?: string;
    to?: string;
    salesPeriod?: BranchDashboardPeriod;
    expensesPeriod?: BranchDashboardPeriod;
    onlineOrdersPeriod?: BranchDashboardPeriod;
  }>,
): BranchDashboardDisplayData {
  const profile = getOrganisationRangeProfile(options.range, {
    from: options.from,
    to: options.to,
  });
  const rangeScale = profile.scale / BASE_RANGE_SCALE;
  const salesScale = rangeScale * periodScale[options.salesPeriod ?? 'today'];
  const expensesScale = rangeScale * periodScale[options.expensesPeriod ?? 'today'];
  const onlineScale = rangeScale * periodScale[options.onlineOrdersPeriod ?? 'today'];

  const scaledSalesByOrderType = scaleOrderTypes(base.salesByOrderType, salesScale);
  const scaledSalesTotal = scaledSalesByOrderType.reduce((sum, row) => sum + row.sales, 0);
  const scaledSalesOrders = scaledSalesByOrderType.reduce((sum, row) => sum + row.orders, 0);

  return {
    ...base,
    dateRangeLabel: resolveOrganisationDateRangeLabel(options.range, {
      from: options.from ?? '',
      to: options.to ?? '',
    }),
    kpis: {
      totalSales: scaleMetric(
        base.kpis.totalSales,
        rangeScale,
        profile.totalSalesChange,
        profile.changeLabel,
      ),
      netSales: scaleMetric(
        base.kpis.netSales,
        rangeScale,
        profile.netSalesChange,
        profile.changeLabel,
      ),
      onlineSales: scaleMetric(
        base.kpis.onlineSales,
        rangeScale,
        base.kpis.onlineSales.changePercent,
        profile.changeLabel,
      ),
      offlineSales: scaleMetric(
        base.kpis.offlineSales,
        rangeScale,
        base.kpis.offlineSales.changePercent,
        profile.changeLabel,
      ),
    },
    salesByOrderType: scaledSalesByOrderType,
    salesSummary: {
      totalOrders: scaledSalesOrders || base.salesSummary.totalOrders,
      totalSales: scaledSalesTotal || base.salesSummary.totalSales,
    },
    onlineOrders: {
      ...base.onlineOrders,
      totalSales: scaleAmount(base.onlineOrders.totalSales, onlineScale),
      totalOrders: Math.max(0, Math.round(base.onlineOrders.totalOrders * onlineScale)),
    },
    orderTypeSummary: base.orderTypeSummary.map((row) => ({
      ...row,
      sales: scaleAmount(row.sales, rangeScale),
      orders: Math.max(0, Math.round(row.orders * rangeScale)),
    })),
    expenses: {
      ...base.expenses,
      headerAmount: scaleAmount(base.expenses.headerAmount, expensesScale),
      total: scaleAmount(base.expenses.total, expensesScale),
      items: base.expenses.items.map((item) => ({
        ...item,
        amount: scaleAmount(item.amount, expensesScale),
      })),
    },
  };
}
