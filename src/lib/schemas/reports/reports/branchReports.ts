import { z } from 'zod';

import type { OrdersTableRow } from '@/components/shared/ui/OrdersTable';
import type { SessionsTableRow } from '@/components/shared/ui/SessionsTable';
import { formatInrAmount, parseIsoDate } from '@/lib/helpers/reportsOverview';
import type {
  ReportsFinanceStat,
  ReportsOperationsStat,
  ReportsOrderChannelKpi,
  ReportsOrderTypeRow,
  ReportsOverviewKpi,
  ReportsSalesBreakdownRow,
} from '@/lib/mocks/reports/reports.mocks';
import { ApiError } from '@/services/api/types';

const nullableText = z.string().nullable().optional();

function parseBranchReportResponse<TData>(
  payload: unknown,
  schema: z.ZodType<{ success: boolean; data: TData; message?: string | null }>,
  invalidMessage: string,
): TData {
  const parsed = schema.safeParse(payload);
  if (!parsed.success || !parsed.data.success) {
    throw new ApiError(
      parsed.success ? parsed.data.message || invalidMessage : invalidMessage,
      502,
    );
  }
  return parsed.data.data;
}
// --- Overview ---

const kpiSummarySchema = z.object({
  completed_orders: z.number(),
  gross_sales: z.string(),
  amount_collected: z.string(),
  transaction_count: z.number(),
  delivery_orders: z.number(),
  staff_on_shift: z.number().nullable(),
});

const overviewTrendPointSchema = z.object({
  business_date: z.string(),
  gross_sales: z.string(),
  completed_orders: z.number(),
});

const orderTypePerformanceSchema = z.object({
  order_type: z.string(),
  completed_orders: z.number(),
  gross_sales: z.string(),
  percentage_of_sales: z.string(),
});

const mealSessionPerformanceSchema = z.object({
  meal_session_id: z.number(),
  meal_session_name: z.string(),
  completed_orders: z.number(),
  gross_sales: z.string(),
  percentage_of_sales: z.string(),
});

const sellingItemSchema = z.object({
  branch_menu_item_id: z.number(),
  item_name: z.string(),
  variant_name: nullableText,
  quantity_sold: z.string(),
  gross_sales: z.string(),
});

const paymentMethodSchema = z.object({
  payment_method: z.string(),
  amount_collected: z.string(),
  transaction_count: z.number(),
  percentage_of_collections: z.string(),
});

const financeSummarySchema = z.object({
  gross_sales: z.string(),
  amount_collected: z.string(),
  transaction_count: z.number(),
  payments_by_method: z.array(paymentMethodSchema),
});

const staffOperationsSchema = z.object({
  active_shifts: z.number().nullable(),
  completed_shifts: z.number().nullable(),
  staff_on_shift: z.number().nullable(),
  completed_orders: z.number(),
  late_kitchen_orders: z.number().nullable(),
  average_preparation_time: nullableText,
});

const recentOrderSchema = z.object({
  order_id: z.number(),
  order_number: z.string(),
  business_date: z.string(),
  order_type: z.string(),
  status: z.string(),
  gross_sales: z.string(),
  created_at: z.string(),
});

export const reportsOverviewDataSchema = z.object({
  branch_id: z.number(),
  date_from: z.string(),
  date_to: z.string(),
  compare_from: nullableText,
  compare_to: nullableText,
  kpi_summary: kpiSummarySchema,
  kpi_comparison: kpiSummarySchema,
  kpi_change_percent: z.object({
    completed_orders: nullableText,
    gross_sales: nullableText,
    amount_collected: nullableText,
    transaction_count: nullableText,
    delivery_orders: nullableText,
    staff_on_shift: nullableText,
  }),
  sales_and_order_trends: z.array(overviewTrendPointSchema),
  comparison_trends: z.array(overviewTrendPointSchema),
  order_type_performance: z.array(orderTypePerformanceSchema),
  meal_session_performance: z.array(mealSessionPerformanceSchema).nullable(),
  top_selling_items: z.array(sellingItemSchema),
  least_selling_items: z.array(sellingItemSchema),
  finance_and_payment_summary: financeSummarySchema,
  staff_and_operations: staffOperationsSchema,
  recent_orders: z.array(recentOrderSchema),
});

export const reportsOverviewResponseSchema = z.object({
  success: z.boolean(),
  data: reportsOverviewDataSchema,
  message: nullableText,
  request_id: nullableText,
});

export type ReportsOverviewData = z.infer<typeof reportsOverviewDataSchema>;

export function parseReportsOverviewResponse(payload: unknown): ReportsOverviewData {
  return parseBranchReportResponse(
    payload,
    reportsOverviewResponseSchema,
    'Invalid reports overview response',
  );
}

const ORDER_TYPE_LABELS: Record<string, string> = {
  dine_in: 'Dine-In',
  takeaway: 'Takeaway',
  take_away: 'Takeaway',
  delivery: 'Delivery',
};

const ORDER_TYPE_VARIANTS = {
  dine_in: 'dine-in',
  takeaway: 'takeaway',
  take_away: 'takeaway',
  delivery: 'delivery',
} as const;

function parsePercent(value: string | null | undefined): number | undefined {
  if (!value?.trim()) return undefined;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseAmount(value: string | null | undefined): number {
  if (!value?.trim()) return 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatTrendAxisLabel(dateIso: string): string {
  return parseIsoDate(dateIso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

function formatBreakdownDate(dateIso: string): string {
  return parseIsoDate(dateIso).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatOrderTypeLabel(orderType: string): string {
  return ORDER_TYPE_LABELS[orderType] ?? orderType.replace(/_/g, ' ');
}

function orderTypeVariant(orderType: string): 'dine-in' | 'takeaway' | 'delivery' {
  const key = orderType as keyof typeof ORDER_TYPE_VARIANTS;
  return ORDER_TYPE_VARIANTS[key] ?? 'dine-in';
}

function formatTrendLabel(dateIso: string): string {
  return parseIsoDate(dateIso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

function formatCreatedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function paymentMethodId(method: string): string {
  return method.trim().toLowerCase().replace(/\s+/g, '-');
}

function formatNullableCount(value: number | null | undefined): string {
  return value == null ? '—' : String(value);
}

function formatNullableText(value: string | null | undefined): string {
  return value?.trim() ? value : '—';
}

function formatShiftFooter(
  completedShifts: number | null | undefined,
  activeShifts: number | null | undefined,
): string {
  if (completedShifts == null && activeShifts == null) {
    return 'Shift data not available for this range';
  }
  return `${formatNullableCount(completedShifts)} closed shifts · ${formatNullableCount(activeShifts)} still open`;
}

export type ReportsOverviewViewModel = Readonly<{
  kpis: readonly ReportsOverviewKpi[];
  orderChannels: readonly ReportsOrderChannelKpi[];
  orderTypeRows: readonly ReportsOrderTypeRow[];
  recentOrders: readonly OrdersTableRow[];
  sessionRows: readonly SessionsTableRow[];
  financeStats: readonly ReportsFinanceStat[];
  operationsStats: readonly ReportsOperationsStat[];
  orderTypeSubtitle: string;
  recentOrdersFooter: string;
  salesTrend: {
    title: string;
    xLabels: readonly string[];
    primarySeries: readonly number[];
    comparisonSeries: readonly number[];
    primaryLegendLabel: string;
    comparisonLegendLabel: string;
    highlightedLabel?: string;
    yAxisStep: number;
  };
  ordersTrend: {
    title: string;
    xLabels: readonly string[];
    primarySeries: readonly number[];
    comparisonSeries: readonly number[];
    primaryLegendLabel: string;
    comparisonLegendLabel: string;
    highlightedLabel?: string;
    yAxisStep: number;
  };
  topSalesSummary: {
    title: string;
    headline: string;
    dayLabel: string;
    amount: string;
  };
  staffShiftFooter: string;
}>;

export function toReportsOverviewViewModel(data: ReportsOverviewData): ReportsOverviewViewModel {
  const completedChange = parsePercent(data.kpi_change_percent.completed_orders);
  const totalOrders = data.order_type_performance.reduce(
    (sum, row) => sum + row.completed_orders,
    0,
  );

  const kpis: ReportsOverviewKpi[] = [
    {
      id: 'completed-orders',
      label: 'Completed Orders',
      value: String(data.kpi_summary.completed_orders),
      changePercent: completedChange ?? 0,
      changeLabel: 'vs comparison period',
    },
    {
      id: 'amount-collected',
      label: 'Amount Collected',
      value: formatInrAmount(data.kpi_summary.amount_collected),
      changePercent: parsePercent(data.kpi_change_percent.amount_collected) ?? 0,
      changeLabel: '',
      footer: `${data.kpi_summary.transaction_count} transactions`,
    },
    {
      id: 'staff-on-shift',
      label: 'Staff on Shift',
      value: formatNullableCount(data.kpi_summary.staff_on_shift),
      changePercent: parsePercent(data.kpi_change_percent.staff_on_shift) ?? 0,
      changeLabel: '',
    },
  ];

  const orderChannels: ReportsOrderChannelKpi[] = data.order_type_performance.map((row) => {
    const channelId = orderTypeVariant(row.order_type);
    return {
      id: channelId,
      label: formatOrderTypeLabel(row.order_type),
      count: row.completed_orders,
      shareLabel: `${row.percentage_of_sales}% of ${totalOrders} total orders`,
    };
  });

  const orderTypeRows: ReportsOrderTypeRow[] = data.order_type_performance.map((row) => ({
    id: orderTypeVariant(row.order_type),
    label: formatOrderTypeLabel(row.order_type),
    sharePercent: parsePercent(row.percentage_of_sales) ?? 0,
    count: row.completed_orders,
    amount: formatInrAmount(row.gross_sales),
  }));

  const xLabels = data.sales_and_order_trends.map((point) => formatTrendLabel(point.business_date));
  const salesValues = data.sales_and_order_trends.map((point) => parseAmount(point.gross_sales));
  const orderValues = data.sales_and_order_trends.map((point) => point.completed_orders);
  const comparisonSales = data.comparison_trends.map((point) => parseAmount(point.gross_sales));
  const comparisonOrders = data.comparison_trends.map((point) => point.completed_orders);

  const primaryLegendLabel = `${data.date_from} – ${data.date_to}`;
  const comparisonLegendLabel =
    data.compare_from && data.compare_to
      ? `${data.compare_from} – ${data.compare_to}`
      : 'Comparison period';

  const peakTrendIndex = salesValues.reduce(
    (bestIndex, value, index, array) => (value > array[bestIndex] ? index : bestIndex),
    0,
  );
  const peakTrend = data.sales_and_order_trends[peakTrendIndex];

  const financeStats: ReportsFinanceStat[] = [
    {
      id: 'net-collections',
      label: 'Net collections',
      value: formatInrAmount(data.finance_and_payment_summary.amount_collected),
      helperText: `Gross sales ${formatInrAmount(data.finance_and_payment_summary.gross_sales)}`,
      accent: 'success',
    },
    ...data.finance_and_payment_summary.payments_by_method.map((method) => ({
      id: paymentMethodId(method.payment_method),
      label: method.payment_method.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      value: formatInrAmount(method.amount_collected),
      helperText: `${method.transaction_count} transactions · ${method.percentage_of_collections}%`,
      accent: 'info' as const,
    })),
  ];

  const operations = data.staff_and_operations;
  const operationsStats: ReportsOperationsStat[] = [
    {
      id: 'staff-worked',
      label: 'Staff on shift',
      value: formatNullableCount(operations.staff_on_shift),
      helperText: 'Active workforce during the selected range',
      accent: 'info',
    },
    {
      id: 'completed-shifts',
      label: 'Completed shifts',
      value: formatNullableCount(operations.completed_shifts),
      helperText:
        operations.active_shifts == null
          ? 'Open shift count unavailable'
          : `${operations.active_shifts} shifts still open`,
      accent: 'success',
    },
    {
      id: 'active-staff',
      label: 'Active shifts',
      value: formatNullableCount(operations.active_shifts),
      helperText: 'Open shift records at refresh',
      accent: 'secondary',
    },
    {
      id: 'completed-orders',
      label: 'Completed orders',
      value: String(operations.completed_orders),
      helperText: 'Order ledger for the selected range',
      accent: 'success',
    },
    {
      id: 'late-kitchen',
      label: 'Late kitchen orders',
      value: formatNullableCount(operations.late_kitchen_orders),
      helperText: 'Orders exceeding prep SLA',
      accent: 'warning',
    },
    {
      id: 'avg-prep',
      label: 'Average prep time',
      value: formatNullableText(operations.average_preparation_time),
      helperText: 'Kitchen throughput indicator',
      accent: 'info',
    },
  ];

  const recentOrders: OrdersTableRow[] = data.recent_orders.map((order) => ({
    id: String(order.order_id),
    orderNo: order.order_number,
    orderType: formatOrderTypeLabel(order.order_type),
    orderTypeVariant: orderTypeVariant(order.order_type),
    captain: '—',
    qty: 0,
    amount: formatInrAmount(order.gross_sales),
    grandTotal: formatInrAmount(order.gross_sales),
    created: formatCreatedAt(order.created_at),
    status: order.status === 'cancelled' ? 'cancelled' : 'successful',
  }));

  const sessionRows: SessionsTableRow[] = (data.meal_session_performance ?? []).map((session) => ({
    id: String(session.meal_session_id),
    session: session.meal_session_name,
    sharePercent: parsePercent(session.percentage_of_sales) ?? 0,
    orders: session.completed_orders,
    sales: formatInrAmount(session.gross_sales),
  }));

  const cancelledCount = recentOrders.filter((row) => row.status === 'cancelled').length;

  return {
    kpis,
    orderChannels,
    orderTypeRows,
    recentOrders,
    sessionRows,
    financeStats,
    operationsStats,
    orderTypeSubtitle: `${totalOrders} total orders`,
    recentOrdersFooter: `Showing ${recentOrders.length} recent orders${
      cancelledCount > 0 ? ` · Includes ${cancelledCount} cancelled orders` : ''
    }`,
    salesTrend: {
      title: 'Net sales (INR)',
      xLabels,
      primarySeries: salesValues,
      comparisonSeries: comparisonSales,
      primaryLegendLabel,
      comparisonLegendLabel,
      highlightedLabel: peakTrend ? formatTrendLabel(peakTrend.business_date) : undefined,
      yAxisStep: Math.max(1, Math.ceil(Math.max(...salesValues, 1) / 5 / 1000) * 1000),
    },
    ordersTrend: {
      title: 'Orders',
      xLabels,
      primarySeries: orderValues,
      comparisonSeries: comparisonOrders,
      primaryLegendLabel,
      comparisonLegendLabel,
      highlightedLabel: peakTrend ? formatTrendLabel(peakTrend.business_date) : undefined,
      yAxisStep: Math.max(1, Math.ceil(Math.max(...orderValues, 1) / 5)),
    },
    topSalesSummary: {
      title: 'TOP SALES SUMMARY',
      headline: 'Highest net sales in range',
      dayLabel: peakTrend
        ? parseIsoDate(peakTrend.business_date).toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
          })
        : '',
      amount: peakTrend ? `≈ ${formatInrAmount(peakTrend.gross_sales, true)}` : '—',
    },
    staffShiftFooter: formatShiftFooter(operations.completed_shifts, operations.active_shifts),
  };
}

// --- Sales ---

const orderTypeBreakdownSchema = z.object({
  order_type: z.string(),
  order_count: z.number(),
  gross_sales: z.string(),
  order_count_share_percent: nullableText,
  gross_sales_share_percent: nullableText,
});

const dailySalesTrendSchema = z.object({
  business_date: z.string(),
  gross_sales: z.string(),
  order_count: z.number(),
});

const dailyBreakdownSchema = z.object({
  business_date: z.string(),
  gross_sales: z.string(),
  dine_in_gross_sales: nullableText,
  takeaway_gross_sales: nullableText,
  delivery_gross_sales: nullableText,
  order_count: z.number(),
});

const mealSessionSalesSchema = z.object({
  meal_session_id: z.number().nullable(),
  meal_session_name: z.string(),
  gross_sales: z.string(),
  order_count: z.number(),
});

const coverageSchema = z.object({
  gross_sales_excludes_tax: z.boolean(),
  gross_sales_excludes_tips: z.boolean(),
  gross_sales_excludes_discounts: z.boolean(),
  gross_sales_completed_orders_only: z.boolean(),
  limitations: z.array(z.string()),
});

export const reportsSalesDataSchema = z.object({
  branch_id: z.number(),
  date_from: z.string(),
  date_to: z.string(),
  compare_from: nullableText,
  compare_to: nullableText,
  gross_sales: z.string(),
  previous_period_gross_sales: nullableText,
  gross_sales_change_percent: nullableText,
  by_order_type: z.array(orderTypeBreakdownSchema).nullable(),
  daily_sales_trends: z.array(dailySalesTrendSchema),
  by_meal_session: z.array(mealSessionSalesSchema).nullable().optional(),
  daily_breakdown: z.array(dailyBreakdownSchema),
  total_sales_by_order_type: z.array(orderTypeBreakdownSchema).nullable(),
  coverage: coverageSchema.nullable().optional(),
});

export const reportsSalesResponseSchema = z.object({
  success: z.boolean(),
  data: reportsSalesDataSchema,
  message: nullableText,
  request_id: nullableText,
});

export type ReportsSalesData = z.infer<typeof reportsSalesDataSchema>;

export function parseReportsSalesResponse(payload: unknown): ReportsSalesData {
  return parseBranchReportResponse(
    payload,
    reportsSalesResponseSchema,
    'Invalid sales report response',
  );
}

function formatAmountCell(value: string | null | undefined): string {
  if (!value?.trim() || parseAmount(value) === 0) return '—';
  return formatInrAmount(value);
}

function parseBreakdownDisplayAmount(value: string): number {
  if (!value.trim() || value === '—') return 0;
  const normalized = value.replace(/[^\d.-]/g, '');
  return parseAmount(normalized);
}

/** Sums formatted daily rows when API footer totals are unavailable. */
export function summarizeReportsSalesBreakdownFooter(
  rows: readonly ReportsSalesBreakdownRow[],
): ReportsSalesBreakdownRow {
  const sumColumn = (pick: (row: ReportsSalesBreakdownRow) => string) =>
    rows.reduce((sum, row) => sum + parseBreakdownDisplayAmount(pick(row)), 0);

  return {
    id: 'total',
    date: 'Total',
    dineIn: formatInrAmount(sumColumn((row) => row.dineIn)),
    takeaway: formatInrAmount(sumColumn((row) => row.takeaway)),
    delivery: formatInrAmount(sumColumn((row) => row.delivery)),
    total: formatInrAmount(sumColumn((row) => row.total)),
  };
}

function mealSessionKey(mealSessionId: number | null, mealSessionName: string): string {
  if (mealSessionId != null) return String(mealSessionId);
  return `unassigned-${mealSessionName.trim().toLowerCase().replace(/\s+/g, '-') || 'session'}`;
}

export type ReportsSalesSummaryStat = Readonly<{
  id: string;
  label: string;
  value: string;
  changePercent?: number;
  changeLabel?: string;
  footerText?: string;
  helperText?: string;
  accent: 'info' | 'warning' | 'success';
}>;

export type ReportsSalesOrderTypeRow = Readonly<{
  id: string;
  label: string;
  amount: string;
  orders: number;
  sharePercent: number;
}>;

export type ReportsSalesViewModel = Readonly<{
  summaryStats: readonly ReportsSalesSummaryStat[];
  netSalesNote: string;
  periodLabel: string;
  compareLabel: string;
  trendChart: {
    title: string;
    xLabels: readonly string[];
    primarySeries: readonly number[];
    comparisonSeries: readonly number[];
    primaryLegendLabel: string;
    comparisonLegendLabel: string;
    highlightedLabel?: string;
    yAxisStep: number;
  };
  orderTypeRows: readonly ReportsSalesOrderTypeRow[];
  sessionRows: readonly SessionsTableRow[];
  breakdownRows: readonly ReportsSalesBreakdownRow[];
  breakdownFooter: ReportsSalesBreakdownRow;
}>;

export function toReportsSalesViewModel(data: ReportsSalesData): ReportsSalesViewModel {
  const orderTypes = data.total_sales_by_order_type ?? data.by_order_type ?? [];

  const dineIn = orderTypes.find((row) => orderTypeVariant(row.order_type) === 'dine-in');
  const takeaway = orderTypes.find((row) => orderTypeVariant(row.order_type) === 'takeaway');

  const grossChange = parsePercent(data.gross_sales_change_percent);
  const compareLabel =
    data.compare_from && data.compare_to
      ? `vs ${data.compare_from} – ${data.compare_to}`
      : 'vs previous period';

  const summaryStats: ReportsSalesSummaryStat[] = [
    {
      id: 'total-sales',
      label: 'Total sales',
      value: formatInrAmount(data.gross_sales),
      changePercent: grossChange,
      changeLabel: grossChange != null ? compareLabel : undefined,
      helperText:
        data.previous_period_gross_sales != null
          ? `Previous ${formatInrAmount(data.previous_period_gross_sales)}`
          : undefined,
      accent: 'info',
    },
    {
      id: 'dine-in-sales',
      label: 'Dine-in sales',
      value: dineIn != null ? formatInrAmount(dineIn.gross_sales) : '—',
      footerText: dineIn?.gross_sales_share_percent
        ? `${dineIn.gross_sales_share_percent}% of sales`
        : undefined,
      accent: 'info',
    },
    {
      id: 'takeaway-sales',
      label: 'Takeaway sales',
      value: takeaway != null ? formatInrAmount(takeaway.gross_sales) : '—',
      footerText: takeaway?.gross_sales_share_percent
        ? `${takeaway.gross_sales_share_percent}% of sales`
        : undefined,
      accent: 'warning',
    },
  ];

  const salesValues = data.daily_sales_trends.map((point) => parseAmount(point.gross_sales));
  const peakPoint =
    salesValues.length > 0
      ? data.daily_sales_trends[
          salesValues.reduce((best, value, index, array) => (value > array[best] ? index : best), 0)
        ]
      : undefined;

  const orderTypeRows: ReportsSalesOrderTypeRow[] = orderTypes.map((row) => ({
    id: orderTypeVariant(row.order_type),
    label: formatOrderTypeLabel(row.order_type),
    amount: formatInrAmount(row.gross_sales),
    orders: row.order_count,
    sharePercent: parsePercent(row.gross_sales_share_percent) ?? 0,
  }));

  const totalGrossFromBreakdown = data.daily_breakdown.reduce(
    (sum, row) => sum + parseAmount(row.gross_sales),
    0,
  );
  const totalGross =
    data.daily_breakdown.length > 0 ? totalGrossFromBreakdown : parseAmount(data.gross_sales);

  const totalDineIn =
    data.daily_breakdown.length > 0
      ? data.daily_breakdown.reduce((sum, row) => sum + parseAmount(row.dine_in_gross_sales), 0)
      : parseAmount(dineIn?.gross_sales);

  const totalTakeaway =
    data.daily_breakdown.length > 0
      ? data.daily_breakdown.reduce((sum, row) => sum + parseAmount(row.takeaway_gross_sales), 0)
      : parseAmount(takeaway?.gross_sales);

  const totalDelivery =
    data.daily_breakdown.length > 0
      ? data.daily_breakdown.reduce((sum, row) => sum + parseAmount(row.delivery_gross_sales), 0)
      : parseAmount(
          orderTypes.find((row) => orderTypeVariant(row.order_type) === 'delivery')?.gross_sales,
        );

  const breakdownRows: ReportsSalesBreakdownRow[] = data.daily_breakdown.map((row) => ({
    id: row.business_date,
    date: formatBreakdownDate(row.business_date),
    dineIn: formatAmountCell(row.dine_in_gross_sales),
    takeaway: formatAmountCell(row.takeaway_gross_sales),
    delivery: formatAmountCell(row.delivery_gross_sales),
    total: formatInrAmount(row.gross_sales),
  }));

  const sessionRows: SessionsTableRow[] = (data.by_meal_session ?? [])
    .slice()
    .sort((left, right) => parseAmount(right.gross_sales) - parseAmount(left.gross_sales))
    .map((session) => {
      const share =
        totalGross > 0 ? ((parseAmount(session.gross_sales) / totalGross) * 100).toFixed(1) : '0';
      return {
        id: mealSessionKey(session.meal_session_id, session.meal_session_name),
        session: session.meal_session_name,
        sharePercent: parsePercent(share) ?? 0,
        orders: session.order_count,
        sales: formatInrAmount(session.gross_sales),
      };
    });

  const limitations = data.coverage?.limitations?.filter(Boolean) ?? [];
  const netSalesNote =
    limitations.length > 0
      ? limitations.join(' ')
      : 'Net item sales after discounts and sales returns, excluding tax.';

  return {
    summaryStats,
    netSalesNote,
    periodLabel: `Period: ${data.date_from} – ${data.date_to}`,
    compareLabel:
      data.compare_from && data.compare_to
        ? `Compare: ${data.compare_from} – ${data.compare_to}`
        : 'Compare: previous period',
    trendChart: {
      title: 'Net sales (INR)',
      xLabels: data.daily_sales_trends.map((point) => formatTrendAxisLabel(point.business_date)),
      primarySeries: salesValues,
      comparisonSeries: [],
      primaryLegendLabel: `Sales · ${data.date_from} – ${data.date_to}`,
      comparisonLegendLabel: data.previous_period_gross_sales
        ? `Previous total · ${formatInrAmount(data.previous_period_gross_sales)}`
        : 'Previous period',
      highlightedLabel: peakPoint ? formatTrendAxisLabel(peakPoint.business_date) : undefined,
      yAxisStep:
        salesValues.length > 0
          ? Math.max(1, Math.ceil(Math.max(...salesValues, 1) / 5 / 1000) * 1000)
          : 1000,
    },
    orderTypeRows,
    sessionRows,
    breakdownRows,
    breakdownFooter: {
      id: 'total',
      date: 'Total',
      dineIn: formatInrAmount(totalDineIn),
      takeaway: formatInrAmount(totalTakeaway),
      delivery: formatInrAmount(totalDelivery),
      total: formatInrAmount(totalGross),
    },
  };
}

// --- Orders summary ---

const orderTypeSummarySchema = z.object({
  order_count: z.number(),
  share_percent: nullableText,
  gross_sales: z.string(),
  grand_total: z.string(),
  amount_collected: z.string(),
});

const dailyOrderTypeMetricsSchema = z.object({
  gross_sales: nullableText,
  grand_total: nullableText,
  amount_collected: nullableText,
});

const dailyOrderTrendSchema = z.object({
  business_date: z.string(),
  order_count: z.number(),
  gross_sales: z.string(),
  grand_total: z.string(),
  amount_collected: z.string(),
  dine_in: dailyOrderTypeMetricsSchema,
  takeaway: dailyOrderTypeMetricsSchema,
  delivery: dailyOrderTypeMetricsSchema,
});

const overallSummarySchema = z.object({
  gross_sales: z.string(),
  grand_total: z.string(),
  amount_collected: z.string(),
});

export const reportsOrdersSummaryDataSchema = z.object({
  branch_id: z.number(),
  date_from: z.string(),
  date_to: z.string(),
  total_orders: z.number(),
  dine_in: orderTypeSummarySchema,
  takeaway: orderTypeSummarySchema,
  delivery: orderTypeSummarySchema,
  overall: overallSummarySchema,
  daily_order_trend: z.array(dailyOrderTrendSchema),
  payment_attribution: z.string(),
});

export const reportsOrdersSummaryResponseSchema = z.object({
  success: z.boolean(),
  data: reportsOrdersSummaryDataSchema,
  message: nullableText,
  request_id: nullableText,
});

export type ReportsOrdersSummaryData = z.infer<typeof reportsOrdersSummaryDataSchema>;

export function parseReportsOrdersSummaryResponse(payload: unknown): ReportsOrdersSummaryData {
  return parseBranchReportResponse(
    payload,
    reportsOrdersSummaryResponseSchema,
    'Invalid orders report response',
  );
}

function formatDailyDate(dateIso: string): string {
  return parseIsoDate(dateIso).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function shareFooter(
  sharePercent: string | null | undefined,
  orderCount: number,
  totalOrders: number,
): string | undefined {
  if (orderCount <= 0) return undefined;
  const share = parsePercent(sharePercent);
  if (share == null) return undefined;
  return `${share}% of ${totalOrders.toLocaleString('en-IN')} total orders`;
}

function revenueHelperText(grossSales: string, amountCollected: string): string | undefined {
  const parts: string[] = [];
  if (parseAmount(grossSales) > 0) {
    parts.push(`${formatInrAmount(grossSales)} gross`);
  }
  if (parseAmount(amountCollected) > 0) {
    parts.push(`${formatInrAmount(amountCollected)} collected`);
  }
  return parts.length > 0 ? parts.join(' · ') : undefined;
}

export type ReportsOrdersSummaryStat = Readonly<{
  id: string;
  label: string;
  value: string;
  footerText?: string;
  helperText?: string;
  accent: 'info' | 'warning' | 'success';
}>;

export type ReportsOrdersDailyTrendRow = Readonly<{
  id: string;
  date: string;
  orderCount: string;
  grossSales: string;
  grandTotal: string;
  amountCollected: string;
}>;

export type ReportsOrdersSummaryViewModel = Readonly<{
  summaryStats: readonly ReportsOrdersSummaryStat[];
  attributionNote: string;
  periodLabel: string;
  trendChart: {
    title: string;
    xLabels: readonly string[];
    primarySeries: readonly number[];
    comparisonSeries: readonly number[];
    primaryLegendLabel: string;
    comparisonLegendLabel: string;
    highlightedLabel?: string;
    yAxisStep: number;
  };
  dailyTrendRows: readonly ReportsOrdersDailyTrendRow[];
}>;

export function toReportsOrdersSummaryViewModel(
  data: ReportsOrdersSummaryData,
): ReportsOrdersSummaryViewModel {
  const totalOrders = data.total_orders;

  const summaryStats: ReportsOrdersSummaryStat[] = [
    {
      id: 'total-orders',
      label: 'Total orders',
      value: totalOrders.toLocaleString('en-IN'),
      footerText: 'Across selected period',
      helperText: [
        `${formatInrAmount(data.overall.gross_sales)} gross`,
        `${formatInrAmount(data.overall.grand_total)} grand total`,
        `${formatInrAmount(data.overall.amount_collected)} collected`,
      ].join(' · '),
      accent: 'info',
    },
    {
      id: 'dine-in-orders',
      label: 'Dine-in',
      value: data.dine_in.order_count.toLocaleString('en-IN'),
      footerText: shareFooter(data.dine_in.share_percent, data.dine_in.order_count, totalOrders),
      helperText: revenueHelperText(data.dine_in.gross_sales, data.dine_in.amount_collected),
      accent: 'info',
    },
    {
      id: 'takeaway-orders',
      label: 'Takeaway',
      value: data.takeaway.order_count.toLocaleString('en-IN'),
      footerText: shareFooter(data.takeaway.share_percent, data.takeaway.order_count, totalOrders),
      helperText: revenueHelperText(data.takeaway.gross_sales, data.takeaway.amount_collected),
      accent: 'warning',
    },
    {
      id: 'delivery-orders',
      label: 'Delivery',
      value: data.delivery.order_count.toLocaleString('en-IN'),
      footerText: shareFooter(data.delivery.share_percent, data.delivery.order_count, totalOrders),
      helperText: revenueHelperText(data.delivery.gross_sales, data.delivery.amount_collected),
      accent: 'success',
    },
  ];

  const orderCounts = data.daily_order_trend.map((point) => point.order_count);
  const peakIndex =
    orderCounts.length > 0
      ? orderCounts.reduce((best, value, index, array) => (value > array[best] ? index : best), 0)
      : undefined;

  const dailyTrendRows: ReportsOrdersDailyTrendRow[] = data.daily_order_trend.map((row) => ({
    id: row.business_date,
    date: formatDailyDate(row.business_date),
    orderCount: row.order_count.toLocaleString('en-IN'),
    grossSales: formatInrAmount(row.gross_sales),
    grandTotal: formatInrAmount(row.grand_total),
    amountCollected: formatInrAmount(row.amount_collected),
  }));

  return {
    summaryStats,
    attributionNote: data.payment_attribution,
    periodLabel: `Period: ${data.date_from} – ${data.date_to}`,
    trendChart: {
      title: 'Orders per day',
      xLabels: data.daily_order_trend.map((point) => formatTrendAxisLabel(point.business_date)),
      primarySeries: orderCounts,
      comparisonSeries: [],
      primaryLegendLabel: `Orders · ${data.date_from} – ${data.date_to}`,
      comparisonLegendLabel: 'Previous period',
      highlightedLabel:
        peakIndex != null
          ? formatTrendAxisLabel(data.daily_order_trend[peakIndex].business_date)
          : undefined,
      yAxisStep:
        orderCounts.length > 0 ? Math.max(1, Math.ceil(Math.max(...orderCounts, 1) / 5)) : 1,
    },
    dailyTrendRows,
  };
}

// --- Sessions ---

const sessionHighlightSchema = z.object({
  meal_session_id: z.number().nullable(),
  meal_session_name: z.string(),
  gross_sales: z.string(),
  order_count: z.number(),
});

const sessionItemSchema = z.object({
  item_label: z.string(),
  quantity: z.string(),
  gross_sales: z.string(),
});

const sessionBlockSchema = z.object({
  meal_session_id: z.number().nullable(),
  meal_session_name: z.string(),
  order_count: z.number(),
  gross_sales: z.string(),
  top_items: z.array(sessionItemSchema),
  lowest_items: z.array(sessionItemSchema),
});

const sessionsCoverageSchema = z.object({
  gross_sales_excludes_tax: z.boolean(),
  gross_sales_excludes_tips: z.boolean(),
  gross_sales_excludes_discounts: z.boolean(),
  gross_sales_completed_orders_only: z.boolean(),
  limitations: z.array(z.string()),
});

export const reportsSessionsDataSchema = z.object({
  branch_id: z.number(),
  date_from: z.string(),
  date_to: z.string(),
  sessions_covered: z.number(),
  best_session: sessionHighlightSchema,
  lowest_session: sessionHighlightSchema,
  overall_top_item: z.object({
    item_label: z.string(),
    quantity: z.string(),
    gross_sales: z.string(),
  }),
  sessions: z.array(sessionBlockSchema),
  coverage: sessionsCoverageSchema.nullable().optional(),
});

export const reportsSessionsResponseSchema = z.object({
  success: z.boolean(),
  data: reportsSessionsDataSchema,
  message: nullableText,
  request_id: nullableText,
});

export type ReportsSessionsData = z.infer<typeof reportsSessionsDataSchema>;

export function parseReportsSessionsResponse(payload: unknown): ReportsSessionsData {
  return parseBranchReportResponse(
    payload,
    reportsSessionsResponseSchema,
    'Invalid sessions report response',
  );
}

export type ReportsSessionsSummaryStat = Readonly<{
  id: string;
  label: string;
  value: string;
  amount: string;
  helperText: string;
  accent: 'info' | 'warning' | 'success' | 'secondary';
}>;

export type ReportsSessionsItemRow = Readonly<{
  rank: number;
  item: string;
  unitsSold: string;
  sales: string;
}>;

export type ReportsSessionsViewModel = Readonly<{
  summaryStats: readonly ReportsSessionsSummaryStat[];
  coverageNote: string;
  periodLabel: string;
  sessionBlocks: readonly {
    id: string;
    name: string;
    hours: string;
    orders: string;
    netSales: string;
    topItems: readonly ReportsSessionsItemRow[];
    lowItems: readonly ReportsSessionsItemRow[];
  }[];
}>;

function formatMealSessionName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return 'Session';
  if (trimmed.toLowerCase() === 'all_day') return 'All day';
  if (trimmed.includes('_')) {
    return trimmed
      .split('_')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }
  return trimmed;
}

function sessionSlug(name: string, id: number | null): string {
  const fromName = name.trim().toLowerCase().replace(/_/g, '-').replace(/\s+/g, '-');
  if (fromName) return fromName;
  return id == null ? 'unassigned-session' : `session-${id}`;
}

function formatSoldQuantity(quantity: string): string {
  const parsed = Number.parseFloat(quantity);
  if (!Number.isFinite(parsed)) return quantity;
  return Number.isInteger(parsed) ? String(parsed) : String(parsed);
}

function formatUnitsSoldLabel(quantity: string): string {
  return `${formatSoldQuantity(quantity)} sold`;
}

function mapSessionItemRows(
  items: readonly { item_label: string; quantity: string; gross_sales: string }[],
): ReportsSessionsItemRow[] {
  return items.map((row, index) => ({
    rank: index + 1,
    item: row.item_label,
    unitsSold: formatUnitsSoldLabel(row.quantity),
    sales: formatInrAmount(row.gross_sales),
  }));
}

function sessionShareHelper(grossSales: string, totalGross: number, label: string): string {
  const amount = parseAmount(grossSales);
  if (totalGross <= 0) return label;
  const share = ((amount / totalGross) * 100).toFixed(1);
  return `${label} · ${share}% share`;
}

export function toReportsSessionsViewModel(data: ReportsSessionsData): ReportsSessionsViewModel {
  const totalGross = data.sessions.reduce((sum, row) => sum + parseAmount(row.gross_sales), 0);

  const summaryStats: ReportsSessionsSummaryStat[] = [
    {
      id: 'best-session',
      label: 'Best session',
      value: formatMealSessionName(data.best_session.meal_session_name),
      amount: formatInrAmount(data.best_session.gross_sales),
      helperText: sessionShareHelper(
        data.best_session.gross_sales,
        totalGross,
        'Highest net sales',
      ),
      accent: 'success',
    },
    {
      id: 'lowest-session',
      label: 'Lowest session',
      value: formatMealSessionName(data.lowest_session.meal_session_name),
      amount: formatInrAmount(data.lowest_session.gross_sales),
      helperText: sessionShareHelper(
        data.lowest_session.gross_sales,
        totalGross,
        'Lowest net sales',
      ),
      accent: 'warning',
    },
    {
      id: 'top-item',
      label: 'Top session item',
      value: data.overall_top_item.item_label,
      amount: `${formatSoldQuantity(data.overall_top_item.quantity)} sold`,
      helperText: `Gross ${formatInrAmount(data.overall_top_item.gross_sales)}`,
      accent: 'info',
    },
    {
      id: 'sessions-covered',
      label: 'Sessions covered',
      value: String(data.sessions_covered),
      amount: 'Meal sessions',
      helperText: data.sessions
        .map((row) => formatMealSessionName(row.meal_session_name))
        .join(' · '),
      accent: 'secondary',
    },
  ];

  const limitations = data.coverage?.limitations?.filter(Boolean) ?? [];
  const coverageNote =
    limitations.length > 0
      ? limitations.join(' ')
      : 'Net item sales after discounts and sales returns, excluding tax.';

  const sessionBlocks = data.sessions.map((session) => ({
    id: sessionSlug(session.meal_session_name, session.meal_session_id),
    name: formatMealSessionName(session.meal_session_name),
    hours: '—',
    orders: session.order_count.toLocaleString('en-IN'),
    netSales: formatInrAmount(session.gross_sales),
    topItems: mapSessionItemRows(session.top_items),
    lowItems: mapSessionItemRows(session.lowest_items),
  }));

  return {
    summaryStats,
    coverageNote,
    periodLabel: `Period: ${data.date_from} – ${data.date_to}`,
    sessionBlocks,
  };
}

// --- Payments (finance) ---

const paymentsTenderSchema = z.object({
  tender_type: z.string(),
  collected: z.string(),
  transaction_count: z.number(),
  collected_share_percent: nullableText,
  transaction_share_percent: nullableText,
});

const paymentsDailyTrendSchema = z.object({
  date: z.string(),
  total_collected: z.string(),
  transaction_count: z.number(),
  cash_collected: nullableText,
  card_collected: nullableText,
  upi_collected: nullableText,
  other_collected: nullableText,
});

const paymentsCoverageSchema = z.object({
  date_basis: z.string(),
  collected_excludes_tips: z.boolean(),
  captured_parent_payments_only: z.boolean(),
  refunds_included: z.boolean(),
  cash_variance_included: z.boolean(),
  limitations: z.array(z.string()),
});

export const reportsPaymentsDataSchema = z.object({
  branch_id: z.number(),
  date_from: z.string(),
  date_to: z.string(),
  compare_from: nullableText,
  compare_to: nullableText,
  total_collected: z.string(),
  total_tips_collected: z.string(),
  transaction_count: z.number(),
  previous_period_total_collected: nullableText,
  total_collected_change_percent: nullableText,
  by_tender_type: z.array(paymentsTenderSchema),
  daily_trends: z.array(paymentsDailyTrendSchema),
  coverage: paymentsCoverageSchema,
});

export const reportsPaymentsResponseSchema = z.object({
  success: z.boolean(),
  data: reportsPaymentsDataSchema,
  message: nullableText,
  request_id: nullableText,
});

export type ReportsPaymentsData = z.infer<typeof reportsPaymentsDataSchema>;

export function parseReportsPaymentsResponse(payload: unknown): ReportsPaymentsData {
  return parseBranchReportResponse(
    payload,
    reportsPaymentsResponseSchema,
    'Invalid payments report response',
  );
}

export type ReportsPaymentsKpi = Readonly<{
  id: string;
  label: string;
  value: string;
  changePercent?: number;
  changeLabel?: string;
  helperText?: string;
  accent: 'info' | 'warning' | 'success' | 'secondary';
}>;

export type ReportsPaymentsTenderRow = Readonly<{
  id: string;
  label: string;
  amount: string;
  share: number;
  color: string;
}>;

export type ReportsPaymentsAttentionItem = Readonly<{
  id: string;
  title: string;
  detail: string;
}>;

export type ReportsPaymentsViewModel = Readonly<{
  kpis: readonly ReportsPaymentsKpi[];
  collectionsTrend: {
    title: string;
    xLabels: readonly string[];
    primarySeries: readonly number[];
    yAxisStep: number;
  };
  tender: {
    total: string;
    rows: readonly ReportsPaymentsTenderRow[];
  };
  coverageNote: string;
  showCashReconciliation: boolean;
  reconciliationNote: string;
  attentionItems: readonly ReportsPaymentsAttentionItem[];
  periodLabel: string;
}>;

const PAYMENTS_TENDER_COLORS: Record<string, string> = {
  cash: '#2563eb',
  card: '#7c3aed',
  upi: '#16a34a',
  other: '#94a3b8',
};

function tenderTypeKey(tenderType: string): string {
  return tenderType.trim().toLowerCase().replace(/\s+/g, '_');
}

function formatTenderLabel(tenderType: string): string {
  const key = tenderTypeKey(tenderType);
  const labels: Record<string, string> = {
    cash: 'Cash',
    card: 'Card',
    upi: 'UPI',
    other: 'Other',
  };
  return labels[key] ?? tenderType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function paymentsTrendLabel(dateIso: string): string {
  return parseIsoDate(dateIso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function averageCollection(totalCollected: string, transactionCount: number): string {
  if (transactionCount <= 0) return '—';
  const total = parseAmount(totalCollected);
  if (total <= 0) return '—';
  return formatInrAmount(total / transactionCount);
}

export function toReportsPaymentsViewModel(data: ReportsPaymentsData): ReportsPaymentsViewModel {
  const collectedChange = parsePercent(data.total_collected_change_percent);
  const compareLabel =
    data.compare_from && data.compare_to
      ? `vs ${data.compare_from} – ${data.compare_to}`
      : 'vs previous period';

  const kpis: ReportsPaymentsKpi[] = [
    {
      id: 'net-collections',
      label: 'Net collections',
      value: formatInrAmount(data.total_collected),
      changePercent: collectedChange,
      changeLabel: collectedChange != null ? compareLabel : undefined,
      accent: 'info',
    },
    {
      id: 'tips-collected',
      label: 'Tips collected',
      value: formatInrAmount(data.total_tips_collected),
      helperText: data.coverage.collected_excludes_tips
        ? 'Tips excluded from net collections total'
        : undefined,
      accent: 'success',
    },
    {
      id: 'transaction-count',
      label: 'Transactions',
      value: data.transaction_count.toLocaleString('en-IN'),
      helperText: 'Captured parent payments in range',
      accent: 'secondary',
    },
    {
      id: 'previous-period',
      label: 'Previous period',
      value:
        data.previous_period_total_collected != null
          ? formatInrAmount(data.previous_period_total_collected)
          : '—',
      helperText: compareLabel,
      accent: 'info',
    },
    {
      id: 'avg-collection',
      label: 'Avg. collection',
      value: averageCollection(data.total_collected, data.transaction_count),
      helperText: 'Net collections ÷ transactions',
      accent: 'info',
    },
  ];

  const trendValues = data.daily_trends.map((point) => parseAmount(point.total_collected));
  const tenderRows: ReportsPaymentsTenderRow[] = data.by_tender_type
    .filter((row) => parseAmount(row.collected) > 0)
    .map((row) => {
      const id = tenderTypeKey(row.tender_type);
      return {
        id,
        label: formatTenderLabel(row.tender_type),
        amount: formatInrAmount(row.collected),
        share: parsePercent(row.collected_share_percent) ?? 0,
        color: PAYMENTS_TENDER_COLORS[id] ?? PAYMENTS_TENDER_COLORS.other,
      };
    });

  const limitations = data.coverage.limitations.filter(Boolean);
  const coverageNote =
    limitations.length > 0
      ? limitations.join(' ')
      : `Date basis: ${data.coverage.date_basis.replace(/_/g, ' ')}.`;

  const attentionItems: ReportsPaymentsAttentionItem[] = limitations.map((line, index) => ({
    id: `limitation-${index}`,
    title: index === 0 ? 'Report coverage' : `Note ${index + 1}`,
    detail: line,
  }));

  const reconciliationNote = data.coverage.cash_variance_included
    ? 'Shift-level cash evidence is included when reported by the branch.'
    : 'Cash shift reconciliation is not included in the payments report for this branch.';

  return {
    kpis,
    collectionsTrend: {
      title: 'Net collections · INR',
      xLabels: data.daily_trends.map((point) => paymentsTrendLabel(point.date)),
      primarySeries: trendValues,
      yAxisStep:
        trendValues.length > 0
          ? Math.max(1, Math.ceil(Math.max(...trendValues, 1) / 5 / 1000) * 1000)
          : 10_000,
    },
    tender: {
      total: formatInrAmount(data.total_collected),
      rows: tenderRows,
    },
    coverageNote,
    showCashReconciliation: data.coverage.cash_variance_included,
    reconciliationNote,
    attentionItems,
    periodLabel: `Period: ${data.date_from} – ${data.date_to}`,
  };
}
