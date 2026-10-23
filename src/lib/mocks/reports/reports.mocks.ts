import type { HttpMethod, QueryParams } from '@/services/api/types';

import {
  reportsOrdersListResponseSchema,
  reportsOrdersSummaryResponseSchema,
  reportsOverviewResponseSchema,
  reportsPaymentsResponseSchema,
  reportsSalesResponseSchema,
  reportsSessionsResponseSchema,
  reportsUsersLogsResponseSchema,
  type ReportsUsersLogsShiftRow,
} from '@/lib/schemas/reports/reports/branchReports';

const ordersDailyMetrics = (
  gross: string,
  grand: string,
  collected: string,
): { gross_sales: string; grand_total: string; amount_collected: string } => ({
  gross_sales: gross,
  grand_total: grand,
  amount_collected: collected,
});

const ordersZeroDay = (businessDate: string) => ({
  business_date: businessDate,
  order_count: 0,
  gross_sales: '0.00',
  grand_total: '0.00',
  amount_collected: '0.00',
  dine_in: ordersDailyMetrics('0.00', '0.00', '0.00'),
  takeaway: ordersDailyMetrics('0.00', '0.00', '0.00'),
  delivery: ordersDailyMetrics('0.00', '0.00', '0.00'),
});

export const MOCK_REPORTS_OVERVIEW_RESPONSE = reportsOverviewResponseSchema.parse({
  success: true,
  message: 'OK',
  request_id: 'mock-reports-overview',
  data: {
    branch_id: 49,
    date_from: '2026-09-21',
    date_to: '2026-09-27',
    compare_from: '2026-09-14',
    compare_to: '2026-09-20',
    kpi_summary: {
      completed_orders: 142,
      gross_sales: '1752645.00',
      amount_collected: '1752645.00',
      transaction_count: 138,
      delivery_orders: 44,
      staff_on_shift: 8,
    },
    kpi_comparison: {
      completed_orders: 126,
      gross_sales: '1564200.00',
      amount_collected: '1564200.00',
      transaction_count: 122,
      delivery_orders: 39,
      staff_on_shift: 7,
    },
    kpi_change_percent: {
      completed_orders: '12.4',
      gross_sales: '12.0',
      amount_collected: '12.0',
      transaction_count: '13.1',
      delivery_orders: '12.8',
      staff_on_shift: '14.3',
    },
    sales_and_order_trends: [
      { business_date: '2026-09-21', gross_sales: '42000.00', completed_orders: 118 },
      { business_date: '2026-09-22', gross_sales: '48000.00', completed_orders: 132 },
      { business_date: '2026-09-23', gross_sales: '52000.00', completed_orders: 158 },
    ],
    comparison_trends: [
      { business_date: '2026-09-14', gross_sales: '35000.00', completed_orders: 102 },
      { business_date: '2026-09-15', gross_sales: '40000.00', completed_orders: 115 },
    ],
    order_type_performance: [
      {
        order_type: 'dine_in',
        completed_orders: 62,
        gross_sales: '768420.00',
        percentage_of_sales: '44',
      },
      {
        order_type: 'takeaway',
        completed_orders: 24,
        gross_sales: '298120.00',
        percentage_of_sales: '17',
      },
      {
        order_type: 'delivery',
        completed_orders: 44,
        gross_sales: '686105.00',
        percentage_of_sales: '31',
      },
    ],
    meal_session_performance: [
      {
        meal_session_id: 1,
        meal_session_name: 'Breakfast',
        completed_orders: 451,
        gross_sales: '88600.00',
        percentage_of_sales: '18.2',
      },
    ],
    top_selling_items: [],
    least_selling_items: [],
    finance_and_payment_summary: {
      gross_sales: '390500.00',
      amount_collected: '390500.00',
      transaction_count: 420,
      payments_by_method: [
        {
          payment_method: 'Cash',
          amount_collected: '142200.00',
          transaction_count: 180,
          percentage_of_collections: '36.4',
        },
      ],
    },
    staff_and_operations: {
      active_shifts: 2,
      completed_shifts: 6,
      staff_on_shift: 8,
      completed_orders: 1897,
      late_kitchen_orders: 14,
      average_preparation_time: '18m 24s',
    },
    recent_orders: [
      {
        order_id: 1,
        order_number: '#001',
        business_date: '2026-09-27',
        order_type: 'dine_in',
        status: 'completed',
        gross_sales: '1304.16',
        created_at: '2026-07-07T15:40:00.000Z',
      },
    ],
  },
});

export const MOCK_REPORTS_SALES_RESPONSE = reportsSalesResponseSchema.parse({
  success: true,
  message: 'OK',
  request_id: 'mock-reports-sales',
  data: {
    branch_id: 49,
    date_from: '2026-09-21',
    date_to: '2026-09-27',
    compare_from: '2026-09-14',
    compare_to: '2026-09-20',
    gross_sales: '376740.00',
    previous_period_gross_sales: '347200.00',
    gross_sales_change_percent: '8.4',
    by_order_type: [
      {
        order_type: 'dine_in',
        order_count: 1240,
        gross_sales: '284000.00',
        order_count_share_percent: '65.3',
        gross_sales_share_percent: '75.4',
      },
      {
        order_type: 'takeaway',
        order_count: 657,
        gross_sales: '92740.00',
        order_count_share_percent: '34.7',
        gross_sales_share_percent: '24.6',
      },
    ],
    daily_sales_trends: [
      { business_date: '2026-09-21', gross_sales: '50600.00', order_count: 118 },
      { business_date: '2026-09-22', gross_sales: '53140.00', order_count: 132 },
    ],
    by_meal_session: [
      {
        meal_session_id: 3,
        meal_session_name: 'Dinner',
        gross_sales: '186760.00',
        order_count: 840,
      },
    ],
    daily_breakdown: [
      {
        business_date: '2026-09-21',
        gross_sales: '50600.00',
        dine_in_gross_sales: '38420.00',
        takeaway_gross_sales: '12180.00',
        delivery_gross_sales: null,
        order_count: 118,
      },
    ],
    total_sales_by_order_type: [
      {
        order_type: 'dine_in',
        order_count: 1240,
        gross_sales: '284000.00',
        order_count_share_percent: '65.3',
        gross_sales_share_percent: '75.4',
      },
    ],
    coverage: {
      gross_sales_excludes_tax: true,
      gross_sales_excludes_tips: true,
      gross_sales_excludes_discounts: true,
      gross_sales_completed_orders_only: true,
      limitations: ['Net item sales after discounts and sales returns, excluding tax.'],
    },
  },
});

export const MOCK_REPORTS_ORDERS_SUMMARY_RESPONSE = reportsOrdersSummaryResponseSchema.parse({
  success: true,
  message: 'Orders summary report retrieved',
  request_id: 'mock-reports-orders-summary',
  data: {
    branch_id: 64,
    date_from: '2026-10-15',
    date_to: '2026-10-21',
    total_orders: 23,
    dine_in: {
      order_count: 17,
      share_percent: '73.91',
      gross_sales: '1275.00',
      grand_total: '1339.00',
      amount_collected: '3103.50',
    },
    takeaway: {
      order_count: 6,
      share_percent: '26.09',
      gross_sales: '0.00',
      grand_total: '0.00',
      amount_collected: '262.50',
    },
    delivery: {
      order_count: 0,
      share_percent: '0.00',
      gross_sales: '0.00',
      grand_total: '0.00',
      amount_collected: '0.00',
    },
    overall: {
      gross_sales: '1275.00',
      grand_total: '1339.00',
      amount_collected: '3366.00',
    },
    daily_order_trend: [
      {
        business_date: '2026-10-15',
        order_count: 4,
        gross_sales: '300.00',
        grand_total: '315.00',
        amount_collected: '1291.50',
        dine_in: ordersDailyMetrics('300.00', '315.00', '1029.00'),
        takeaway: ordersDailyMetrics('0.00', '0.00', '262.50'),
        delivery: ordersDailyMetrics('0.00', '0.00', '0.00'),
      },
      {
        business_date: '2026-10-18',
        order_count: 10,
        gross_sales: '975.00',
        grand_total: '1024.00',
        amount_collected: '1024.00',
        dine_in: ordersDailyMetrics('975.00', '1024.00', '1024.00'),
        takeaway: ordersDailyMetrics('0.00', '0.00', '0.00'),
        delivery: ordersDailyMetrics('0.00', '0.00', '0.00'),
      },
      ordersZeroDay('2026-10-19'),
      ordersZeroDay('2026-10-21'),
    ],
    payment_attribution:
      'Order counts include all order statuses by business_date. gross_sales and grand_total include completed orders only (non-voided line subtotals and order grand_total respectively). amount_collected sums captured parent payment amounts (excluding tips and refund rows) for orders whose business_date is in the selected range.',
  },
});

export const MOCK_REPORTS_SESSIONS_RESPONSE = reportsSessionsResponseSchema.parse({
  success: true,
  message: 'OK',
  request_id: 'mock-reports-sessions',
  data: {
    branch_id: 49,
    date_from: '2026-09-21',
    date_to: '2026-09-27',
    sessions_covered: 3,
    best_session: {
      meal_session_id: 3,
      meal_session_name: 'Dinner',
      gross_sales: '186760.00',
      order_count: 840,
    },
    lowest_session: {
      meal_session_id: 1,
      meal_session_name: 'Breakfast',
      gross_sales: '88600.00',
      order_count: 451,
    },
    overall_top_item: {
      item_label: 'Chicken biryani',
      quantity: '455',
      gross_sales: '68250.00',
    },
    sessions: [
      {
        meal_session_id: 1,
        meal_session_name: 'Breakfast',
        order_count: 451,
        gross_sales: '88600.00',
        top_items: [
          { item_label: 'Masala dosa', quantity: '82', gross_sales: '9840.00' },
          { item_label: 'Idli vada', quantity: '64', gross_sales: '5760.00' },
        ],
        lowest_items: [
          { item_label: 'Veg sandwich', quantity: '6', gross_sales: '720.00' },
          { item_label: 'Pongal', quantity: '8', gross_sales: '960.00' },
        ],
      },
      {
        meal_session_id: 2,
        meal_session_name: 'Lunch',
        order_count: 618,
        gross_sales: '121380.00',
        top_items: [
          { item_label: 'Chicken biryani', quantity: '180', gross_sales: '27000.00' },
          { item_label: 'Butter naan', quantity: '142', gross_sales: '8520.00' },
        ],
        lowest_items: [
          { item_label: 'Veg soup', quantity: '8', gross_sales: '640.00' },
          { item_label: 'Curd rice', quantity: '18', gross_sales: '1620.00' },
        ],
      },
      {
        meal_session_id: 3,
        meal_session_name: 'Dinner',
        order_count: 840,
        gross_sales: '186760.00',
        top_items: [
          { item_label: 'Chicken biryani', quantity: '275', gross_sales: '41250.00' },
          { item_label: 'Paneer biryani', quantity: '198', gross_sales: '29700.00' },
        ],
        lowest_items: [
          { item_label: 'Veg soup', quantity: '12', gross_sales: '960.00' },
          { item_label: 'Raita', quantity: '15', gross_sales: '1125.00' },
        ],
      },
    ],
    coverage: {
      gross_sales_excludes_tax: true,
      gross_sales_excludes_tips: true,
      gross_sales_excludes_discounts: true,
      gross_sales_completed_orders_only: true,
      limitations: ['Net item sales after discounts and sales returns, excluding tax.'],
    },
  },
});

export const MOCK_REPORTS_PAYMENTS_RESPONSE = reportsPaymentsResponseSchema.parse({
  success: true,
  message: 'OK',
  request_id: 'mock-reports-payments',
  data: {
    branch_id: 49,
    date_from: '2026-09-21',
    date_to: '2026-09-27',
    compare_from: '2026-09-14',
    compare_to: '2026-09-20',
    total_collected: '368400.00',
    total_tips_collected: '12400.00',
    transaction_count: 412,
    previous_period_total_collected: '343800.00',
    total_collected_change_percent: '7.2',
    by_tender_type: [
      {
        tender_type: 'cash',
        collected: '142783.00',
        transaction_count: 98,
        collected_share_percent: '38.8',
        transaction_share_percent: '23.8',
      },
      {
        tender_type: 'card',
        collected: '53786.00',
        transaction_count: 64,
        collected_share_percent: '14.6',
        transaction_share_percent: '15.5',
      },
      {
        tender_type: 'upi',
        collected: '37730.00',
        transaction_count: 52,
        collected_share_percent: '10.2',
        transaction_share_percent: '12.6',
      },
      {
        tender_type: 'other',
        collected: '134101.00',
        transaction_count: 198,
        collected_share_percent: '36.4',
        transaction_share_percent: '48.1',
      },
    ],
    daily_trends: [
      {
        date: '2026-09-21',
        total_collected: '46000.00',
        transaction_count: 58,
        cash_collected: '18000.00',
        card_collected: '8000.00',
        upi_collected: '6000.00',
        other_collected: '14000.00',
      },
      {
        date: '2026-09-22',
        total_collected: '48200.00',
        transaction_count: 61,
        cash_collected: '19000.00',
        card_collected: '8200.00',
        upi_collected: '6200.00',
        other_collected: '14800.00',
      },
      {
        date: '2026-09-23',
        total_collected: '50800.00',
        transaction_count: 63,
        cash_collected: '20000.00',
        card_collected: '8600.00',
        upi_collected: '6400.00',
        other_collected: '15800.00',
      },
      {
        date: '2026-09-24',
        total_collected: '50800.00',
        transaction_count: 62,
        cash_collected: '19800.00',
        card_collected: '8500.00',
        upi_collected: '6300.00',
        other_collected: '16200.00',
      },
      {
        date: '2026-09-25',
        total_collected: '52400.00',
        transaction_count: 65,
        cash_collected: '20500.00',
        card_collected: '8800.00',
        upi_collected: '6500.00',
        other_collected: '16600.00',
      },
      {
        date: '2026-09-26',
        total_collected: '66400.00',
        transaction_count: 72,
        cash_collected: '26000.00',
        card_collected: '11000.00',
        upi_collected: '8200.00',
        other_collected: '21200.00',
      },
      {
        date: '2026-09-27',
        total_collected: '50000.00',
        transaction_count: 31,
        cash_collected: '19500.00',
        card_collected: '8400.00',
        upi_collected: '6100.00',
        other_collected: '16000.00',
      },
    ],
    coverage: {
      date_basis: 'payment_date',
      collected_excludes_tips: true,
      captured_parent_payments_only: true,
      refunds_included: false,
      cash_variance_included: false,
      limitations: [
        'Collected amounts use captured parent payment rows by payment date in branch timezone.',
        'Tips are reported separately and excluded from net collections.',
        'Cash shift reconciliation is not included in this report.',
      ],
    },
  },
});

type BranchReportsMockRequest = {
  method: HttpMethod;
  path: string;
  params?: QueryParams;
  body?: unknown;
};

const REPORTS_OVERVIEW_PATH = /^\/v1\/branches\/(\d+)\/reports\/overview$/;
const REPORTS_SALES_PATH = /^\/v1\/branches\/(\d+)\/reports\/sales$/;
const REPORTS_ORDERS_SUMMARY_PATH = /^\/v1\/branches\/(\d+)\/reports\/orders\/summary$/;
const REPORTS_ORDERS_LIST_PATH = /^\/v1\/branches\/(\d+)\/reports\/orders$/;
const REPORTS_SESSIONS_PATH = /^\/v1\/branches\/(\d+)\/reports\/sessions$/;
const REPORTS_PAYMENTS_PATH = /^\/v1\/branches\/(\d+)\/reports\/payments$/;
const REPORTS_USERS_LOGS_PATH = /^\/v1\/branches\/(\d+)\/reports\/users-logs$/;

const MOCK_USERS_LOGS_BILLING_USERS: readonly { userId: number; name: string }[] = [
  { userId: 101, name: 'Santhosh' },
  { userId: 102, name: 'Miller' },
  { userId: 103, name: 'Priya S.' },
  { userId: 104, name: 'Vijay' },
  { userId: 105, name: 'Rajesh' },
  { userId: 106, name: 'Ravi' },
  { userId: 107, name: 'Raghu' },
  { userId: 108, name: 'Nitesh' },
];

function buildMockUsersLogsItems(): ReportsUsersLogsShiftRow[] {
  const seeds: readonly Omit<ReportsUsersLogsShiftRow, 'shift_id' | 'user_id' | 'opened_by'>[] = [
    {
      opened_at: '2026-07-22T10:04:03.000Z',
      opening_balance: '1764321.00',
      closed_at: null,
      closed_by: null,
      total_orders: 0,
      cash_collected: '0.00',
      upi_collected: '0.00',
      card_collected: '0.00',
      total_collected: '0.00',
      status: 'open',
    },
    {
      opened_at: '2026-07-21T10:04:03.000Z',
      opening_balance: '1750000.00',
      closed_at: '2026-07-22T23:59:59.000Z',
      closed_by: 'Miller',
      total_orders: 120,
      cash_collected: '1750009.00',
      upi_collected: '2636.00',
      card_collected: '0.00',
      total_collected: '1752645.00',
      status: 'closed',
    },
    {
      opened_at: '2026-07-19T12:38:16.000Z',
      opening_balance: '1761725.00',
      closed_at: '2026-07-21T23:59:59.000Z',
      closed_by: 'Priya S.',
      total_orders: 142,
      cash_collected: '1750009.00',
      upi_collected: '0.00',
      card_collected: '0.00',
      total_collected: '1750009.00',
      status: 'closed',
    },
    {
      opened_at: '2026-07-19T09:12:00.000Z',
      opening_balance: '1768938.00',
      closed_at: '2026-07-20T23:59:59.000Z',
      closed_by: 'Vijay',
      total_orders: 193,
      cash_collected: '1467570.00',
      upi_collected: '0.00',
      card_collected: '0.00',
      total_collected: '1467570.00',
      status: 'closed',
    },
    {
      opened_at: '2026-07-18T08:30:00.000Z',
      opening_balance: '1725874.00',
      closed_at: '2026-07-19T23:59:59.000Z',
      closed_by: 'Rajesh',
      total_orders: 0,
      cash_collected: '0.00',
      upi_collected: '0.00',
      card_collected: '0.00',
      total_collected: '0.00',
      status: 'closed',
    },
    {
      opened_at: '2026-07-17T07:45:00.000Z',
      opening_balance: '1705888.00',
      closed_at: '2026-07-18T23:59:59.000Z',
      closed_by: 'Ravi',
      total_orders: 122,
      cash_collected: '1792816.00',
      upi_collected: '0.00',
      card_collected: '0.00',
      total_collected: '1792816.00',
      status: 'closed',
    },
    {
      opened_at: '2026-07-17T18:02:03.000Z',
      opening_balance: '1781003.00',
      closed_at: '2026-07-17T23:59:59.000Z',
      closed_by: 'Raghu',
      total_orders: 121,
      cash_collected: '1719480.00',
      upi_collected: '0.00',
      card_collected: '0.00',
      total_collected: '1719480.00',
      status: 'closed',
    },
    {
      opened_at: '2026-07-17T09:18:00.000Z',
      opening_balance: '1713162.00',
      closed_at: '2026-07-16T23:59:59.000Z',
      closed_by: 'Nitesh',
      total_orders: 132,
      cash_collected: '1748481.00',
      upi_collected: '0.00',
      card_collected: '0.00',
      total_collected: '1748481.00',
      status: 'closed',
    },
  ];

  return Array.from({ length: 31 }, (_, index) => {
    const billing = MOCK_USERS_LOGS_BILLING_USERS[index % MOCK_USERS_LOGS_BILLING_USERS.length];
    const seed = seeds[index % seeds.length];
    return {
      shift_id: 5000 + index + 1,
      user_id: billing.userId,
      opened_by: billing.name,
      ...seed,
    };
  });
}

const MOCK_USERS_LOGS_ALL_ITEMS = buildMockUsersLogsItems();

export const MOCK_REPORTS_USERS_LOGS_RESPONSE = reportsUsersLogsResponseSchema.parse({
  success: true,
  message: 'OK',
  request_id: 'mock-reports-users-logs',
  data: {
    summary: {
      total_invoices: 142,
      total_invoices_change_percent: '12.4',
      gross_sales: '1752645.00',
      gross_sales_change_percent: '9.8',
      staff_worked: 8,
      staff_worked_change_percent: '4.2',
      total_collected: '1752645.00',
      total_collected_change_percent: '9.8',
      open_shifts: 2,
      closed_shifts: 6,
    },
    items: MOCK_USERS_LOGS_ALL_ITEMS.slice(0, 10),
    total: MOCK_USERS_LOGS_ALL_ITEMS.length,
    page: 1,
    page_size: 10,
  },
});

export const REPORTS_USERS_LOGS_BILLING_FILTER_OPTIONS = [
  { value: 'all', label: 'All Billing User' },
  ...MOCK_USERS_LOGS_BILLING_USERS.map((user) => ({
    value: String(user.userId),
    label: user.name,
    userId: user.userId,
  })),
] as const;

export function resolveBranchReportsMock(request: BranchReportsMockRequest): unknown | undefined {
  const overviewMatch = REPORTS_OVERVIEW_PATH.exec(request.path);
  if (overviewMatch && request.method === 'GET') {
    const branchId = Number(overviewMatch[1]);
    const data = MOCK_REPORTS_OVERVIEW_RESPONSE.data;

    return {
      ...MOCK_REPORTS_OVERVIEW_RESPONSE,
      data: {
        ...data,
        branch_id: branchId,
        date_from: String(request.params?.date_from ?? data.date_from),
        date_to: String(request.params?.date_to ?? data.date_to),
        compare_from: request.params?.compare_from
          ? String(request.params.compare_from)
          : data.compare_from,
        compare_to: request.params?.compare_to
          ? String(request.params.compare_to)
          : data.compare_to,
      },
    };
  }

  const salesMatch = REPORTS_SALES_PATH.exec(request.path);
  if (salesMatch && request.method === 'GET') {
    const branchId = Number(salesMatch[1]);
    const data = MOCK_REPORTS_SALES_RESPONSE.data;

    return {
      ...MOCK_REPORTS_SALES_RESPONSE,
      data: {
        ...data,
        branch_id: branchId,
        date_from: String(request.params?.date_from ?? data.date_from),
        date_to: String(request.params?.date_to ?? data.date_to),
        compare_from: request.params?.compare_from
          ? String(request.params.compare_from)
          : data.compare_from,
        compare_to: request.params?.compare_to
          ? String(request.params.compare_to)
          : data.compare_to,
      },
    };
  }

  const ordersSummaryMatch = REPORTS_ORDERS_SUMMARY_PATH.exec(request.path);
  if (ordersSummaryMatch && request.method === 'GET') {
    const branchId = Number(ordersSummaryMatch[1]);
    const data = MOCK_REPORTS_ORDERS_SUMMARY_RESPONSE.data;

    return {
      ...MOCK_REPORTS_ORDERS_SUMMARY_RESPONSE,
      data: {
        ...data,
        branch_id: branchId,
        date_from: String(request.params?.from_date ?? request.params?.date_from ?? data.date_from),
        date_to: String(request.params?.to_date ?? request.params?.date_to ?? data.date_to),
      },
    };
  }

  const ordersListMatch = REPORTS_ORDERS_LIST_PATH.exec(request.path);
  if (ordersListMatch && request.method === 'GET') {
    let items = [...MOCK_ORDERS_LIST_ALL_ITEMS];

    const orderTypeParam = request.params?.order_type;
    if (typeof orderTypeParam === 'string' && orderTypeParam.trim()) {
      const normalized = orderTypeParam.trim().toLowerCase();
      items = items.filter((row) => row.order_type.toLowerCase() === normalized);
    }

    const searchParam = request.params?.search;
    if (typeof searchParam === 'string' && searchParam.trim()) {
      const needle = searchParam.trim().toLowerCase();
      items = items.filter((row) => row.order_number.toLowerCase().includes(needle));
    }

    const page = Math.max(1, Number(request.params?.page ?? 1) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number(request.params?.page_size ?? reportsOrdersCopy.pageSize) || 8),
    );
    const total = items.length;
    const start = (page - 1) * pageSize;

    return {
      ...MOCK_REPORTS_ORDERS_LIST_RESPONSE,
      data: {
        items: items.slice(start, start + pageSize),
        total,
        page,
        page_size: pageSize,
      },
    };
  }

  const sessionsMatch = REPORTS_SESSIONS_PATH.exec(request.path);
  if (sessionsMatch && request.method === 'GET') {
    const branchId = Number(sessionsMatch[1]);
    const data = MOCK_REPORTS_SESSIONS_RESPONSE.data;

    return {
      ...MOCK_REPORTS_SESSIONS_RESPONSE,
      data: {
        ...data,
        branch_id: branchId,
        date_from: String(request.params?.date_from ?? data.date_from),
        date_to: String(request.params?.date_to ?? data.date_to),
      },
    };
  }

  const paymentsMatch = REPORTS_PAYMENTS_PATH.exec(request.path);
  if (paymentsMatch && request.method === 'GET') {
    const branchId = Number(paymentsMatch[1]);
    const data = MOCK_REPORTS_PAYMENTS_RESPONSE.data;

    return {
      ...MOCK_REPORTS_PAYMENTS_RESPONSE,
      data: {
        ...data,
        branch_id: branchId,
        date_from: String(request.params?.date_from ?? data.date_from),
        date_to: String(request.params?.date_to ?? data.date_to),
        compare_from: request.params?.compare_from
          ? String(request.params.compare_from)
          : data.compare_from,
        compare_to: request.params?.compare_to
          ? String(request.params.compare_to)
          : data.compare_to,
      },
    };
  }

  const usersLogsMatch = REPORTS_USERS_LOGS_PATH.exec(request.path);
  if (usersLogsMatch && request.method === 'GET') {
    const summary = MOCK_REPORTS_USERS_LOGS_RESPONSE.data.summary;
    let items = [...MOCK_USERS_LOGS_ALL_ITEMS];

    const userIdParam = request.params?.user_id;
    if (userIdParam != null && String(userIdParam).trim() !== '') {
      const userId = Number(userIdParam);
      if (Number.isFinite(userId)) {
        items = items.filter((row) => row.user_id === userId);
      }
    }

    const searchParam = request.params?.search;
    if (typeof searchParam === 'string' && searchParam.trim()) {
      const needle = searchParam.trim().toLowerCase();
      items = items.filter((row) => row.opened_by.toLowerCase().includes(needle));
    }

    const sortBy = String(request.params?.sort_by ?? 'opened_at');
    const sortOrder = String(request.params?.sort_order ?? 'desc').toLowerCase() === 'asc' ? 1 : -1;
    items.sort((left, right) => {
      const pick = (row: ReportsUsersLogsShiftRow): string | number => {
        if (sortBy === 'user_id') return row.user_id;
        if (sortBy === 'opening_balance') return Number.parseFloat(row.opening_balance) || 0;
        if (sortBy === 'status') return row.status;
        if (sortBy === 'closed_at') return row.closed_at ?? '';
        return row.opened_at;
      };
      const leftValue = pick(left);
      const rightValue = pick(right);
      if (leftValue < rightValue) return -1 * sortOrder;
      if (leftValue > rightValue) return 1 * sortOrder;
      return 0;
    });

    const page = Math.max(1, Number(request.params?.page ?? 1) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(request.params?.page_size ?? 10) || 10));
    const total = items.length;
    const start = (page - 1) * pageSize;

    return {
      ...MOCK_REPORTS_USERS_LOGS_RESPONSE,
      data: {
        summary,
        items: items.slice(start, start + pageSize),
        total,
        page,
        page_size: pageSize,
      },
    };
  }

  return undefined;
}

// --- Reports UI copy and screen fixtures ---

export const REPORTS_TAB_IDS = [
  'overview',
  'sales',
  'orders',
  'sessions',
  'finance',
  'users-logs',
] as const;

export type ReportsTabId = (typeof REPORTS_TAB_IDS)[number];

export const reportsTabItems: ReadonlyArray<{ id: ReportsTabId; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'sales', label: 'Sales' },
  { id: 'orders', label: 'Orders' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'finance', label: 'Finance' },
  { id: 'users-logs', label: 'Users Logs' },
];

export function isReportsTabId(value: string | null | undefined): value is ReportsTabId {
  return REPORTS_TAB_IDS.includes(value as ReportsTabId);
}

export const reportsPageCopy = {
  businessOverviewTitle: 'Business Overview',
  businessOverviewSubtitle: 'Track your business performance and key metrics across all outlets.',
  exportLabel: 'Export data',
  dateRangeLabel: 'Jun 28–Jul 4, 2025',
  salesOrderTrendTitle: 'Sales and Order Trend',
  salesOrderTrendSubtitle: 'Compare sales and order volume over time.',
  orderTypePerformanceTitle: 'Order Type Performance',
  orderTypePerformanceSubtitle: '142 total orders',
  recentOrdersTitle: 'Recent orders',
  recentOrdersSubtitle: 'Source orders · Selected week · Latest first',
  recentOrdersAction: 'View all orders',
  recentOrdersFooter: 'Showing 1–4 of 1,909 orders · Includes 12 cancelled orders',
  sessionPerformanceTitle: 'Session performance',
  sessionPerformanceSubtitle: 'Sorted by share of net sales · Selected week',
  sessionPerformanceAction: 'View all sessions',
  financeSummaryTitle: 'Finance and payment summary',
  financeSummaryBadge: 'Partial · Reconciliation',
  financeSummarySubtitle: 'Net collections and tender mix · Selected week',
  financeSummaryAction: 'View finance',
  staffOperationsTitle: 'Staff and operations',
  staffOperationsBadge: 'Partial · Sample sources',
  staffOperationsSubtitle: 'Workforce and order throughput · Selected week',
  staffOperationsAction: 'View operations',
  tabPlaceholder: 'This report view is coming soon.',
} as const;

export type ReportsOverviewKpi = Readonly<{
  id: string;
  label: string;
  value: string;
  changePercent: number;
  changeLabel: string;
  footer?: string;
}>;

export type ReportsOrderChannelKpi = Readonly<{
  id: 'dine-in' | 'takeaway' | 'delivery';
  label: string;
  count: number;
  shareLabel: string;
}>;

export type ReportsOrderTypeRow = Readonly<{
  id: string;
  label: string;
  sharePercent: number;
  count: number;
  amount: string;
}>;

export const MOCK_REPORTS_OVERVIEW_KPIS: readonly ReportsOverviewKpi[] = [
  {
    id: 'completed-orders',
    label: 'Completed Orders',
    value: '142',
    changePercent: 12.4,
    changeLabel: 'vs yesterday',
  },
  {
    id: 'amount-collected',
    label: 'Amount Collected',
    value: '₹17,52,645',
    changePercent: 0,
    changeLabel: '',
    footer: '100% reconciled of net sales',
  },
  {
    id: 'staff-on-shift',
    label: 'Staff on Shift',
    value: '8',
    changePercent: 0,
    changeLabel: '',
    footer: '6 closed shifts · 2 still open',
  },
];

export const MOCK_REPORTS_ORDER_CHANNELS: readonly ReportsOrderChannelKpi[] = [
  { id: 'dine-in', label: 'Dine-In', count: 62, shareLabel: '41% of 151 total orders' },
  { id: 'takeaway', label: 'Takeaway', count: 24, shareLabel: '16% of 151 total orders' },
  { id: 'delivery', label: 'Delivery', count: 44, shareLabel: '29% of 151 total orders' },
];

export const MOCK_REPORTS_ORDER_TYPE_ROWS: readonly ReportsOrderTypeRow[] = [
  {
    id: 'dine-in',
    label: 'Dine-In',
    sharePercent: 44,
    count: 62,
    amount: '₹7,68,420',
  },
  {
    id: 'takeaway',
    label: 'Takeaway',
    sharePercent: 17,
    count: 24,
    amount: '₹2,98,120',
  },
  {
    id: 'delivery',
    label: 'Delivery',
    sharePercent: 31,
    count: 44,
    amount: '₹6,86,105',
  },
];

export const MOCK_REPORTS_TOP_SALES = {
  title: 'TOP SALES SUMMARY',
  headline: 'Highest net sales this week',
  dayLabel: 'Sunday, 27 Sep',
  amount: '≈ ₹69,00,000',
} as const;

export const MOCK_REPORTS_WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export const MOCK_REPORTS_SALES_TREND = {
  title: 'Net sales (INR)',
  highlightedLabel: 'Wed',
  primarySeries: [42_000, 48_000, 52_000, 45_000, 58_000, 65_000, 70_000],
  comparisonSeries: [35_000, 40_000, 44_000, 38_000, 50_000, 58_000, 62_000],
  primaryLegendLabel: '21–27 Sep 2026',
  comparisonLegendLabel: '14–20 Sep 2026',
  yAxisStep: 20_000,
} as const;

export const MOCK_REPORTS_ORDERS_TREND = {
  title: 'Orders',
  highlightedLabel: 'Wed',
  primarySeries: [118, 132, 158, 141, 165, 182, 196],
  comparisonSeries: [102, 115, 138, 125, 148, 171, 184],
  primaryLegendLabel: '21–27 Sep 2026',
  comparisonLegendLabel: '14–20 Sep 2026',
  yAxisStep: 50,
} as const;

export type ReportsRecentOrderRow = Readonly<{
  id: string;
  orderNo: string;
  orderType: string;
  orderTypeVariant: 'dine-in' | 'takeaway' | 'delivery';
  captain: string;
  qty: number;
  amount: string;
  grandTotal: string;
  grandTotalMeta?: string;
  created: string;
  status: 'successful' | 'cancelled';
}>;

export const MOCK_REPORTS_RECENT_ORDERS: readonly ReportsRecentOrderRow[] = [
  {
    id: '1',
    orderNo: '#001',
    orderType: 'Dine-in',
    orderTypeVariant: 'dine-in',
    captain: 'Rohan',
    qty: 4,
    amount: '1,240.00',
    grandTotal: '1,304.16',
    grandTotalMeta: '[Tip: 48.00] [16.16]',
    created: '07 Jul 2026 15:40',
    status: 'successful',
  },
  {
    id: '2',
    orderNo: '#002',
    orderType: 'Takeaway',
    orderTypeVariant: 'takeaway',
    captain: 'Priya',
    qty: 2,
    amount: '680.00',
    grandTotal: '714.40',
    created: '07 Jul 2026 14:22',
    status: 'successful',
  },
  {
    id: '3',
    orderNo: '#003',
    orderType: 'Delivery',
    orderTypeVariant: 'delivery',
    captain: 'Amit',
    qty: 3,
    amount: '920.00',
    grandTotal: '966.00',
    created: '07 Jul 2026 13:05',
    status: 'cancelled',
  },
  {
    id: '4',
    orderNo: '#004',
    orderType: 'Dine-in',
    orderTypeVariant: 'dine-in',
    captain: 'Rohan',
    qty: 6,
    amount: '2,180.00',
    grandTotal: '2,289.00',
    created: '07 Jul 2026 12:48',
    status: 'successful',
  },
];

export type ReportsSessionPerformanceRow = Readonly<{
  id: string;
  session: string;
  sharePercent: number;
  orders: number;
  sales: string;
}>;

export const MOCK_REPORTS_SESSION_PERFORMANCE: readonly ReportsSessionPerformanceRow[] = [
  { id: 'breakfast', session: 'Breakfast', sharePercent: 18.2, orders: 451, sales: '₹88,600' },
  { id: 'lunch', session: 'Lunch', sharePercent: 32.2, orders: 618, sales: '₹1,21,380' },
  { id: 'dinner', session: 'Dinner', sharePercent: 49.6, orders: 840, sales: '₹1,86,760' },
];

export type ReportsFinanceStat = Readonly<{
  id: string;
  label: string;
  value: string;
  helperText: string;
  accent: 'success' | 'info';
}>;

export const MOCK_REPORTS_FINANCE_STATS: readonly ReportsFinanceStat[] = [
  {
    id: 'net-collections',
    label: 'Net collections',
    value: '₹3,90,500',
    helperText: 'Gross receipts less refunds and reversals',
    accent: 'success',
  },
  {
    id: 'cash',
    label: 'Cash',
    value: '₹1,42,200',
    helperText: 'Counted tender · End of day',
    accent: 'info',
  },
  {
    id: 'upi',
    label: 'UPI',
    value: '₹1,68,400',
    helperText: 'Digital wallet and UPI rails',
    accent: 'info',
  },
  {
    id: 'card',
    label: 'Card',
    value: '₹79,900',
    helperText: 'Credit and debit card settlements',
    accent: 'info',
  },
];

export type ReportsOperationsStat = Readonly<{
  id: string;
  label: string;
  value: string;
  helperText: string;
  accent: 'info' | 'success' | 'secondary' | 'warning';
}>;

export const MOCK_REPORTS_OPERATIONS_STATS: readonly ReportsOperationsStat[] = [
  {
    id: 'staff-worked',
    label: 'Staff worked',
    value: '42',
    helperText: 'Unique staff with clocked time',
    accent: 'info',
  },
  {
    id: 'completed-shifts',
    label: 'Completed shifts',
    value: '38',
    helperText: 'Closed shift records this week',
    accent: 'success',
  },
  {
    id: 'active-staff',
    label: 'Active staff',
    value: '4',
    helperText: 'At last refresh · Not a historical week count',
    accent: 'secondary',
  },
  {
    id: 'completed-orders',
    label: 'Completed orders',
    value: '1,897',
    helperText: 'Order ledger · Excludes 12 cancellations',
    accent: 'success',
  },
  {
    id: 'late-kitchen',
    label: 'Late kitchen orders',
    value: '18',
    helperText: 'Sample late flags · Dinner session',
    accent: 'warning',
  },
  {
    id: 'avg-prep',
    label: 'Average prep time',
    value: 'Unavailable',
    helperText: 'Preparation timestamps required',
    accent: 'info',
  },
];

export const reportsSalesCopy = {
  title: 'Sales Reports',
  subtitle: 'Understand sales performance across your selected branch and period.',
  dateRangeLabel: 'Jun 28–Jul 4, 2025',
  exportLabel: 'Export data',
  netSalesNote: 'Net item sales after discounts and sales returns, excluding tax.',
  trendTitle: 'Sales trend',
  trendSubtitle: 'Net sales by business date · Daily totals, not cumulative.',
  periodLabel: 'Period: 21–27 Sep 2026',
  compareLabel: 'Compare: 14–20 Sep 2026',
  orderTypeTitle: 'Sales by order type',
  orderTypeSubtitle: 'Share of net sales · Select a type to filter this report.',
  sessionTitle: 'Sales by session',
  sessionSubtitle: 'Ranked by net sales, highest first · Select a session to filter in place.',
  sessionAction: 'View session analysis',
  breakdownTitle: 'Sales breakdown',
  breakdownSubtitle: 'Aggregated net sales · One row per business date · INR',
  ctaTitle: 'Want to inspect the transactions behind sales?',
  ctaBody:
    'View the orders contributing to this period. Keeps Hotel Mayukha Jungle Theme · 21–27 Sep 2026 · All types · All sessions.',
  ctaButton: 'View orders',
} as const;

export const MOCK_REPORTS_SALES_SUMMARY = [
  {
    id: 'total-sales',
    label: 'Total sales',
    value: '₹3,76,740',
    changePercent: 8.4,
    changeLabel: 'vs 14–20 Sep 2026',
    helperText: 'Sample order sales · Coverage unverified',
    accent: 'info' as const,
  },
  {
    id: 'dine-in-sales',
    label: 'Dine-in sales',
    value: '₹2,84,000',
    footerText: '75.4% of sales',
    helperText: 'Sample order sales · Coverage unverified',
    accent: 'info' as const,
  },
  {
    id: 'takeaway-sales',
    label: 'Takeaway sales',
    value: '₹92,740',
    footerText: '24.6% of sales',
    helperText: 'Sample order sales · Coverage unverified',
    accent: 'warning' as const,
  },
] as const;

export const MOCK_REPORTS_SALES_TREND_CHART = {
  title: 'Net sales (INR)',
  xLabels: [
    'Mon 21 Sep',
    'Tue 22 Sep',
    'Wed 23 Sep',
    'Thu 24 Sep',
    'Fri 25 Sep',
    'Sat 26 Sep',
    'Sun 27 Sep',
  ],
  highlightedLabel: 'Wed 23 Sep',
  primarySeries: [42_000, 48_000, 52_000, 45_000, 58_000, 65_000, 70_000],
  comparisonSeries: [35_000, 40_000, 44_000, 38_000, 50_000, 58_000, 62_000],
  primaryLegendLabel: 'Sales · 21–27 Sep 2026',
  comparisonLegendLabel: 'Previous period · 14–20 Sep 2026',
  yAxisStep: 20_000,
} as const;

export const MOCK_REPORTS_SALES_BY_ORDER_TYPE = [
  {
    id: 'dine-in',
    label: 'Dine-in',
    amount: '₹2,84,000',
    orders: 1240,
    sharePercent: 75.4,
    changePercent: 10.2,
  },
  {
    id: 'takeaway',
    label: 'Takeaway',
    amount: '₹92,740',
    orders: 657,
    sharePercent: 24.6,
    changePercent: 3.1,
  },
] as const;

export const MOCK_REPORTS_SALES_BY_SESSION = [
  { id: 'dinner', session: 'Dinner', sharePercent: 49.6, orders: 840, sales: '₹1,86,760' },
  { id: 'lunch', session: 'Lunch', sharePercent: 32.2, orders: 618, sales: '₹1,21,380' },
  { id: 'breakfast', session: 'Breakfast', sharePercent: 18.2, orders: 451, sales: '₹88,600' },
] as const;

export type ReportsSalesBreakdownRow = Readonly<{
  id: string;
  date: string;
  dineIn: string;
  takeaway: string;
  delivery: string;
  total: string;
}>;

export const MOCK_REPORTS_SALES_BREAKDOWN: readonly ReportsSalesBreakdownRow[] = [
  {
    id: 'mon',
    date: 'Mon 21 Sep',
    dineIn: '₹38,420',
    takeaway: '₹12,180',
    delivery: '—',
    total: '₹50,600',
  },
  {
    id: 'tue',
    date: 'Tue 22 Sep',
    dineIn: '₹41,200',
    takeaway: '₹11,940',
    delivery: '—',
    total: '₹53,140',
  },
  {
    id: 'wed',
    date: 'Wed 23 Sep',
    dineIn: '₹44,800',
    takeaway: '₹13,260',
    delivery: '—',
    total: '₹58,060',
  },
  {
    id: 'thu',
    date: 'Thu 24 Sep',
    dineIn: '₹39,600',
    takeaway: '₹12,700',
    delivery: '—',
    total: '₹52,300',
  },
  {
    id: 'fri',
    date: 'Fri 25 Sep',
    dineIn: '₹48,900',
    takeaway: '₹14,120',
    delivery: '—',
    total: '₹63,020',
  },
  {
    id: 'sat',
    date: 'Sat 26 Sep',
    dineIn: '₹52,400',
    takeaway: '₹15,240',
    delivery: '—',
    total: '₹67,640',
  },
  {
    id: 'sun',
    date: 'Sun 27 Sep',
    dineIn: '₹58,680',
    takeaway: '₹13,300',
    delivery: '—',
    total: '₹71,980',
  },
];

export const MOCK_REPORTS_SALES_BREAKDOWN_FOOTER: ReportsSalesBreakdownRow = {
  id: 'total',
  date: 'Total · 21–27 Sep 2026',
  dineIn: '₹2,84,000',
  takeaway: '₹92,740',
  delivery: '—',
  total: '₹3,76,740',
};

export const reportsOrdersCopy = {
  title: 'Orders Reports',
  subtitle:
    'Review orders, captain assignments, and order status across your selected branch and period.',
  exportLabel: 'Export data',
  applyLabel: 'Apply Now',
  sessionLabel: 'Session Wise',
  orderTypeLabel: 'Order Type',
  orderIdLabel: 'Order ID',
  orderIdPlaceholder: 'Enter Order ID',
  searchLabel: 'Search',
  attributionNote: 'Net item sales after discounts and sales returns, excluding tax.',
  pageSize: 8,
} as const;

export const MOCK_REPORTS_ORDERS_SESSION_OPTIONS = [
  'All Sessions',
  'Breakfast',
  'Lunch',
  'Dinner',
] as const;

export const MOCK_REPORTS_ORDERS_TYPE_OPTIONS = [
  'All Order Type',
  'Dine-in',
  'Takeaway',
  'Delivery',
] as const;

export const MOCK_REPORTS_ORDERS_SUMMARY = [
  {
    id: 'total-orders',
    label: 'Total orders',
    value: '130',
    footerText: 'Across selected period',
    accent: 'info' as const,
  },
  {
    id: 'dine-in-orders',
    label: 'Dine-in',
    value: '62',
    footerText: '41% of 151 total orders',
    accent: 'info' as const,
  },
  {
    id: 'takeaway-orders',
    label: 'Takeaway',
    value: '24',
    footerText: '16% of 151 total orders',
    accent: 'warning' as const,
  },
  {
    id: 'delivery-orders',
    label: 'Delivery',
    value: '44',
    footerText: '29% of 151 total orders',
    accent: 'success' as const,
  },
] as const;

export const MOCK_REPORTS_ORDERS_TABLE_ROWS: readonly ReportsRecentOrderRow[] = [
  {
    id: 'o1',
    orderNo: '#001',
    orderType: 'Dine-in',
    orderTypeVariant: 'dine-in',
    captain: 'Rohan',
    qty: 4,
    amount: '1,240.00',
    grandTotal: '1,304.16',
    grandTotalMeta: '[Tip: 48.00] [16.16]',
    created: '07 Jul 2025 15:40',
    status: 'successful',
  },
  {
    id: 'o2',
    orderNo: '#002',
    orderType: 'Takeaway',
    orderTypeVariant: 'takeaway',
    captain: 'Aarav',
    qty: 2,
    amount: '680.00',
    grandTotal: '714.40',
    created: '07 Jul 2025 14:22',
    status: 'successful',
  },
  {
    id: 'o3',
    orderNo: '#003',
    orderType: 'Delivery',
    orderTypeVariant: 'delivery',
    captain: 'Vihaan',
    qty: 3,
    amount: '920.00',
    grandTotal: '966.00',
    created: '07 Jul 2025 13:05',
    status: 'cancelled',
  },
  {
    id: 'o4',
    orderNo: '#004',
    orderType: 'Dine-in',
    orderTypeVariant: 'dine-in',
    captain: 'Rohan',
    qty: 6,
    amount: '2,180.00',
    grandTotal: '2,289.00',
    created: '07 Jul 2025 12:48',
    status: 'successful',
  },
  {
    id: 'o5',
    orderNo: '#005',
    orderType: 'Delivery',
    orderTypeVariant: 'delivery',
    captain: 'Aarav',
    qty: 5,
    amount: '1,450.00',
    grandTotal: '1,522.50',
    created: '07 Jul 2025 11:30',
    status: 'successful',
  },
  {
    id: 'o6',
    orderNo: '#006',
    orderType: 'Takeaway',
    orderTypeVariant: 'takeaway',
    captain: 'Vihaan',
    qty: 1,
    amount: '320.00',
    grandTotal: '336.00',
    created: '07 Jul 2025 10:15',
    status: 'successful',
  },
  {
    id: 'o7',
    orderNo: '#007',
    orderType: 'Dine-in',
    orderTypeVariant: 'dine-in',
    captain: 'Rohan',
    qty: 3,
    amount: '890.00',
    grandTotal: '934.50',
    created: '06 Jul 2025 20:10',
    status: 'cancelled',
  },
  {
    id: 'o8',
    orderNo: '#008',
    orderType: 'Takeaway',
    orderTypeVariant: 'takeaway',
    captain: 'Aarav',
    qty: 2,
    amount: '540.00',
    grandTotal: '567.00',
    created: '06 Jul 2025 19:02',
    status: 'successful',
  },
];

function mockOrdersListItemFromRow(
  row: ReportsRecentOrderRow,
  orderId: number,
): {
  order_id: number;
  order_number: string;
  order_type: string;
  captain_name: string;
  total_item_quantity: string;
  gross_sales: string;
  grand_total: string;
  tip_amount: string | null;
  created_at: string;
  reporting_status: string;
} {
  const orderType =
    row.orderTypeVariant === 'takeaway'
      ? 'takeaway'
      : row.orderTypeVariant === 'delivery'
        ? 'delivery'
        : 'dine_in';

  return {
    order_id: orderId,
    order_number: row.orderNo.replace(/^#/, ''),
    order_type: orderType,
    captain_name: row.captain,
    total_item_quantity: String(row.qty),
    gross_sales: row.amount.replace(/,/g, ''),
    grand_total: row.grandTotal.replace(/,/g, ''),
    tip_amount: row.grandTotalMeta?.includes('Tip:') ? '48.00' : '0.00',
    created_at: '2026-07-07T10:15:00.000Z',
    reporting_status: row.status === 'cancelled' ? 'cancelled' : 'successful',
  };
}

const MOCK_ORDERS_LIST_ALL_ITEMS = MOCK_REPORTS_ORDERS_TABLE_ROWS.map((row, index) =>
  mockOrdersListItemFromRow(row, index + 1),
);

export const MOCK_REPORTS_ORDERS_LIST_RESPONSE = reportsOrdersListResponseSchema.parse({
  success: true,
  message: 'OK',
  request_id: 'mock-reports-orders-list',
  data: {
    items: MOCK_ORDERS_LIST_ALL_ITEMS.slice(0, reportsOrdersCopy.pageSize),
    total: MOCK_ORDERS_LIST_ALL_ITEMS.length,
    page: 1,
    page_size: reportsOrdersCopy.pageSize,
  },
});

export const reportsSessionsCopy = {
  title: 'Sessions Reports',
  subtitle: 'Understand how each meal session performs and which items are driving sales.',
  dateRangeLabel: 'Jun 28–Jul 4, 2025',
  exportLabel: 'Export data',
  periodLabel: 'Period: 21–27 Sep 2026',
  topItemsTitle: 'Top 5 selling items',
  lowItemsTitle: 'Lowest selling items',
  ordersLabel: 'Orders',
  netSalesLabel: 'Net sales',
} as const;

export const MOCK_REPORTS_SESSIONS_SUMMARY = [
  {
    id: 'best-session',
    label: 'Best session',
    value: 'Dinner',
    amount: '₹1,86,760',
    helperText: 'Highest net sales · 49.6% share',
    accent: 'success' as const,
  },
  {
    id: 'lowest-session',
    label: 'Lowest session',
    value: 'Breakfast',
    amount: '₹68,600',
    helperText: 'Lowest net sales · 18.2% share',
    accent: 'warning' as const,
  },
  {
    id: 'top-item',
    label: 'Top session item',
    value: 'Chicken biryani',
    amount: '455 sold',
    helperText: 'Across Lunch and Dinner',
    accent: 'info' as const,
  },
  {
    id: 'sessions-covered',
    label: 'Sessions covered',
    value: '3',
    amount: 'Meal sessions',
    helperText: 'Breakfast · Lunch · Dinner',
    accent: 'secondary' as const,
  },
] as const;

export type ReportsSessionItemRow = Readonly<{
  rank: number;
  item: string;
  unitsSold: string;
  sales: string;
}>;

export type ReportsSessionBlock = Readonly<{
  id: string;
  name: string;
  hours: string;
  orders: string;
  netSales: string;
  topItems: readonly ReportsSessionItemRow[];
  lowItems: readonly ReportsSessionItemRow[];
}>;

export const MOCK_REPORTS_SESSION_BLOCKS: readonly ReportsSessionBlock[] = [
  {
    id: 'breakfast',
    name: 'Breakfast',
    hours: '7 AM–11 AM',
    orders: '210',
    netSales: '₹68,600',
    topItems: [
      { rank: 1, item: 'Masala dosa', unitsSold: '82 sold', sales: '₹9,840' },
      { rank: 2, item: 'Idli vada', unitsSold: '64 sold', sales: '₹5,760' },
      { rank: 3, item: 'Chicken upma', unitsSold: '51 sold', sales: '₹7,650' },
      { rank: 4, item: 'Poori', unitsSold: '48 sold', sales: '₹4,320' },
      { rank: 5, item: 'Paneer dosa', unitsSold: '41 sold', sales: '₹6,150' },
    ],
    lowItems: [
      { rank: 1, item: 'Veg sandwich', unitsSold: '6 sold', sales: '₹720' },
      { rank: 2, item: 'Pongal', unitsSold: '8 sold', sales: '₹960' },
      { rank: 3, item: 'Cheese dosa', unitsSold: '9 sold', sales: '₹1,350' },
      { rank: 4, item: 'Bread omelette', unitsSold: '11 sold', sales: '₹1,320' },
      { rank: 5, item: 'Fruit bowl', unitsSold: '13 sold', sales: '₹1,560' },
    ],
  },
  {
    id: 'lunch',
    name: 'Lunch',
    hours: '12 PM–3 PM',
    orders: '618',
    netSales: '₹1,21,380',
    topItems: [
      { rank: 1, item: 'Chicken biryani', unitsSold: '180 sold', sales: '₹9,840' },
      { rank: 2, item: 'Butter naan', unitsSold: '142 sold', sales: '₹9,840' },
      { rank: 3, item: 'Paneer biryani', unitsSold: '118 sold', sales: '₹9,840' },
      { rank: 4, item: 'Chicken curry', unitsSold: '104 sold', sales: '₹9,840' },
      { rank: 5, item: 'Veg biryani', unitsSold: '96 sold', sales: '₹9,840' },
    ],
    lowItems: [
      { rank: 1, item: 'Veg soup', unitsSold: '8 sold', sales: '₹9,840' },
      { rank: 2, item: 'Mushroom curry', unitsSold: '11 sold', sales: '₹9,840' },
      { rank: 3, item: 'Fish fry', unitsSold: '13 sold', sales: '₹9,840' },
      { rank: 4, item: 'Veg sandwich', unitsSold: '15 sold', sales: '₹9,840' },
      { rank: 5, item: 'Curd rice', unitsSold: '18 sold', sales: '₹9,840' },
    ],
  },
  {
    id: 'dinner',
    name: 'Dinner',
    hours: '7 PM–11 PM',
    orders: '840',
    netSales: '₹1,86,760',
    topItems: [
      { rank: 1, item: 'Chicken biryani', unitsSold: '275 sold', sales: '₹9,840' },
      { rank: 2, item: 'Butter naan', unitsSold: '238 sold', sales: '₹9,840' },
      { rank: 3, item: 'Chicken tikka', unitsSold: '196 sold', sales: '₹9,840' },
      { rank: 4, item: 'Paneer curry', unitsSold: '174 sold', sales: '₹9,840' },
      { rank: 5, item: 'Garlic naan', unitsSold: '160 sold', sales: '₹9,840' },
    ],
    lowItems: [
      { rank: 1, item: 'Veg soup', unitsSold: '7 sold', sales: '₹9,840' },
      { rank: 2, item: 'Fruit bowl', unitsSold: '9 sold', sales: '₹9,840' },
      { rank: 3, item: 'Pasta', unitsSold: '12 sold', sales: '₹9,840' },
      { rank: 4, item: 'Mushroom starter', unitsSold: '14 sold', sales: '₹9,840' },
      { rank: 5, item: 'Lemon rice', unitsSold: '16 sold', sales: '₹9,840' },
    ],
  },
];

export const reportsFinanceCopy = {
  title: 'Finance Reports',
  subtitle:
    'Track collections, outstanding payments, payment methods, and reconciliation for the selected period.',
  dateRangeLabel: 'Jun 28–Jul 4, 2025',
  exportLabel: 'Export data',
  trendTitle: 'Collections trend',
  trendCaption: 'Illustrative daily values · total ₹3,68,400 for 21–27 Sep 2026',
  tenderTitle: 'Total Sales',
  tenderSubtitle: 'Share of net collections · rounded proportions',
  reconciliationTitle: 'Cash reconciliation',
  reconciliationSubtitle: 'Cash · 21 Sep 2026 · Reported values',
  reconciliationDate: '21 Sep 2026',
  shiftTitle: 'Shift evidence · #0930 B',
  shiftMeta: 'Cashier Ravi · 21 Sep 2026',
  reconciliationNote:
    'Paid-in and paid-out evidence has not been supplied for this POS shift. "Not recorded" does not mean ₹0.',
  attentionTitle: 'Needs attention',
} as const;

export const MOCK_REPORTS_FINANCE_PAGE_KPIS = [
  {
    id: 'net-collections',
    label: 'Net collections',
    value: '₹3,68,400',
    changePercent: 7.2,
    changeLabel: 'vs 14–20 Sep 2026',
    accent: 'info' as const,
  },
  {
    id: 'cash-variance',
    label: 'Cash variance',
    value: '₹1,200',
    helperText: 'Absolute difference · 2 affected shifts',
    accent: 'warning' as const,
  },
  {
    id: 'net-sales',
    label: 'Net sales',
    value: '₹3,76,740',
    helperText: 'Discounts & returns already accounted for',
    accent: 'info' as const,
  },
  {
    id: 'recipe-cost',
    label: 'Recorded recipe cost',
    value: '₹2,34,140',
    helperText: 'Partial recipe-cost coverage',
    accent: 'secondary' as const,
  },
  {
    id: 'contribution',
    label: 'Recorded contribution',
    value: '₹1,42,600',
    helperText: 'Not final profit',
    accent: 'success' as const,
  },
] as const;

export const MOCK_REPORTS_FINANCE_COLLECTIONS_TREND = {
  title: 'Net collections · INR',
  xLabels: ['21 Sep', '22 Sep', '23 Sep', '24 Sep', '25 Sep', '26 Sep', '27 Sep'],
  primarySeries: [46_000, 48_200, 50_800, 50_800, 52_400, 66_400, 50_000],
  yAxisStep: 40_000,
} as const;

export const MOCK_REPORTS_FINANCE_TENDER = {
  total: '₹887,260',
  rows: [
    { id: 'cash', label: 'Cash', amount: '₹142,783', share: 16, color: '#2563eb' },
    { id: 'card', label: 'Card', amount: '₹53,786', share: 6, color: '#7c3aed' },
    { id: 'upi', label: 'UPI', amount: '₹37,730', share: 4, color: '#16a34a' },
    { id: 'other', label: 'Other', amount: '₹652,961', share: 74, color: '#94a3b8' },
  ],
} as const;

export const MOCK_REPORTS_FINANCE_RECONCILIATION = [
  { id: 'expected', label: 'Expected cash · reported', value: '₹82,400' },
  { id: 'counted', label: 'Counted cash · reported', value: '₹81,200' },
  { id: 'variance', label: 'Variance · reported', value: '−₹1,200' },
  { id: 'paid-in', label: 'Paid-in', value: 'Not recorded' },
  { id: 'paid-out', label: 'Paid-out', value: 'Not recorded' },
] as const;

export const MOCK_REPORTS_FINANCE_ATTENTION = [
  { id: 'checks', title: '12 unpaid checks', detail: '₹6,450 outstanding' },
  { id: 'variance', title: '2 cash shifts have variance', detail: '₹1,200 absolute difference' },
  { id: 'refunds', title: '3 refunds pending', detail: '₹2,850 awaiting completion' },
] as const;

export const reportsUsersLogsCopy = {
  title: 'Users Logs',
  subtitle: 'Review employee activity, shifts, and actions for the selected date range.',
  dateRangeLabel: 'Jun 28–Jul 4, 2025',
  exportLabel: 'Export data',
  filterDate: '01 Jul 2025',
  applyLabel: 'Apply Now',
  billingUserLabel: 'Billing User',
  billingUserDefault: 'All Billing User',
  searchLabel: 'Search',
  searchPlaceholder: 'Search',
  pageSize: 10,
} as const;

export type ReportsUsersLogsSummary = Readonly<{
  id: string;
  label: string;
  value: string;
  accent: 'info' | 'warning' | 'success' | 'secondary';
  changePercent?: number;
  changeLabel?: string;
  footerText?: string;
  closedShifts?: string;
  openShifts?: string;
}>;

export const MOCK_REPORTS_USERS_LOGS_SUMMARY: readonly ReportsUsersLogsSummary[] = [
  {
    id: 'total-invoices',
    label: 'Total invoices',
    value: '142',
    changePercent: 12.4,
    changeLabel: 'vs yesterday',
    accent: 'info',
  },
  {
    id: 'net-sales',
    label: 'Net sales',
    value: '₹17,52,645',
    changePercent: 9.8,
    changeLabel: 'vs yesterday',
    accent: 'info',
  },
  {
    id: 'staff-worked',
    label: 'Staff worked',
    value: '8',
    accent: 'info',
    closedShifts: '6 closed shifts',
    openShifts: '2 still open',
  },
  {
    id: 'total-collected',
    label: 'Total collected',
    value: '₹17,52,645',
    footerText: '100% reconciled of net sales',
    accent: 'info',
  },
];

export const MOCK_REPORTS_USERS_LOGS_BILLING_USERS = [
  'All Billing User',
  'Santhosh',
  'Miller',
  'Priya S.',
  'Vijay',
  'Rajesh',
  'Ravi',
  'Raghu',
  'Nitesh',
] as const;

export type ReportsUserLogRow = Readonly<{
  id: string;
  openedBy: string;
  openedAt: string;
  openingBalance: string;
  closedAt: string;
  closedBy: string;
  totalOrders: string;
  cashCollected: string;
  upiCollected: string;
  cardCollected: string;
  totalCollected: string;
}>;

const USER_LOG_SEEDS: readonly Omit<ReportsUserLogRow, 'id'>[] = [
  {
    openedBy: 'Santhosh',
    openedAt: '22 Jul 2026 10:04:03',
    openingBalance: '1,764,321.00',
    closedAt: '—',
    closedBy: '—',
    totalOrders: '—',
    cashCollected: '—',
    upiCollected: '—',
    cardCollected: '—',
    totalCollected: '—',
  },
  {
    openedBy: 'Miller',
    openedAt: '21 Jul 2026 10:04:03',
    openingBalance: '1,750,000.00',
    closedAt: '22 Jul 2026 23:59:59',
    closedBy: 'Miller',
    totalOrders: '120',
    cashCollected: '1,750,009.00',
    upiCollected: '2,636.00',
    cardCollected: '0.00',
    totalCollected: '1,752,645.00',
  },
  {
    openedBy: 'Priya S.',
    openedAt: '19 Jul 2026 12:38:16',
    openingBalance: '1,761,725.00',
    closedAt: '21 Jul 2026 23:59:59',
    closedBy: 'Priya S.',
    totalOrders: '142',
    cashCollected: '1,750,009.00',
    upiCollected: '0.00',
    cardCollected: '0.00',
    totalCollected: '1,750,009.00',
  },
  {
    openedBy: 'Vijay',
    openedAt: '19 Jul 2026 09:12:00',
    openingBalance: '1,768,938.00',
    closedAt: '20 Jul 2026 23:59:59',
    closedBy: 'Vijay',
    totalOrders: '193',
    cashCollected: '1,467,570.00',
    upiCollected: '0.00',
    cardCollected: '0.00',
    totalCollected: '1,467,570.00',
  },
  {
    openedBy: 'Rajesh',
    openedAt: '18 Jul 2026 08:30:00',
    openingBalance: '1,725,874.00',
    closedAt: '19 Jul 2026 23:59:59',
    closedBy: 'Rajesh',
    totalOrders: '0',
    cashCollected: '0.00',
    upiCollected: '0.00',
    cardCollected: '0.00',
    totalCollected: '0.00',
  },
  {
    openedBy: 'Ravi',
    openedAt: '17 Jul 2026 07:45:00',
    openingBalance: '1,705,888.00',
    closedAt: '18 Jul 2026 23:59:59',
    closedBy: 'Ravi',
    totalOrders: '122',
    cashCollected: '1,792,816.00',
    upiCollected: '0.00',
    cardCollected: '0.00',
    totalCollected: '1,792,816.00',
  },
  {
    openedBy: 'Raghu',
    openedAt: '17 Jul 2026 18:02:03',
    openingBalance: '1,781,003.00',
    closedAt: '17 Jul 2026 23:59:59',
    closedBy: 'Raghu',
    totalOrders: '121',
    cashCollected: '1,719,480.00',
    upiCollected: '0.00',
    cardCollected: '0.00',
    totalCollected: '1,719,480.00',
  },
  {
    openedBy: 'Nitesh',
    openedAt: '17 Jul 2026 09:18:00',
    openingBalance: '1,713,162.00',
    closedAt: '16 Jul 2026 23:59:59',
    closedBy: 'Nitesh',
    totalOrders: '132',
    cashCollected: '1,748,481.00',
    upiCollected: '0.00',
    cardCollected: '0.00',
    totalCollected: '1,748,481.00',
  },
];

export const MOCK_REPORTS_USER_LOG_ROWS: readonly ReportsUserLogRow[] = Array.from(
  { length: 31 },
  (_, index) => {
    const seed = USER_LOG_SEEDS[index % USER_LOG_SEEDS.length];
    return { id: `user-log-${index + 1}`, ...seed };
  },
);
