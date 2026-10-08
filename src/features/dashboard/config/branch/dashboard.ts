import { flowPaths } from '@/config/shell/flow-paths';
import { organisationChartColors } from '@/features/dashboard/lib/organisation-chart-colors';
import { COMMON_DATE_RANGE_OPTIONS } from '../scopes';
import type { BranchDashboardOverview } from '@/features/dashboard/types/branch-dashboard';

export const branchDashboardCopy = {
  title: 'Sales Statistics',
  exportButton: 'Export Data',
  lowStockAlert: {
    title: 'Low Stock Alert',
    message: (low: number, out: number) => `${low} items low, ${out} out of stock`,
    cta: 'View inventory',
  },
  kpiSummary: {
    items: [
      { key: 'total', label: 'Total Sales', dataKey: 'totalSales', icon: 'lineChart' },
      { key: 'net', label: 'Net Sales', dataKey: 'netSales', icon: 'barChart' },
      { key: 'online', label: 'Online Sales', dataKey: 'onlineSales', icon: 'globe' },
      { key: 'offline', label: 'Offline Sales', dataKey: 'offlineSales', icon: 'banknote' },
    ],
  },
  dateRangeOptions: COMMON_DATE_RANGE_OPTIONS,
  periodOptions: [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'week', label: 'This week' },
  ] as const,
  salesStatisticsTitle: 'Sales Statistics',
  refreshAriaLabel: 'Refresh sales statistics',
  totalSalesBreakdownTitle: 'Total Sales',
  salesChartTitle: 'Sales',
  totalOrdersLabel: 'Total Orders',
  totalSalesLabel: 'Total Sales',
  onlineOrdersTitle: 'Online orders',
  onlineOrdersSummaryLabel: 'Total Online Sales',
  onlineOrdersCountLabel: 'Orders',
  platformColumn: 'PLATFORM',
  ordersColumn: 'ORDERS',
  orderTypeSummary: {
    dineIn: 'Dine In',
    takeAway: 'Take Away',
    delivery: 'Delivery',
  },
  expenses: {
    title: "Today's Expenses",
    totalLabel: 'Total Expenses',
  },
  leakage: {
    title: 'Leakage',
    groups: {
      kots: 'KOTs',
      bills: 'Bills',
    },
  },
  quickHelp: {
    title: 'Quick Help',
    outletIdLabel: 'Outlet ID',
    onlineStatus: 'Online',
    offlineStatus: 'Offline',
    whatsappCta: 'Contact on WhatsApp',
  },
  fallback: {
    banner: 'Showing sample dashboard figures until live branch data is available.',
  },
} as const;

export const branchDashboardFallbackData: BranchDashboardOverview = {
  outletName: 'Select a branch',
  lowStockAlert: {
    lowCount: 0,
    outOfStockCount: 0,
    inventoryHref: flowPaths.branch.menuAvailability,
  },
  kpis: {
    totalSales: {
      amount: 0,
      currency: 'INR',
      changePercent: 0,
      changeLabel: 'vs yesterday',
    },
    netSales: {
      amount: 0,
      currency: 'INR',
      changePercent: 0,
      changeLabel: 'vs yesterday',
    },
    onlineSales: {
      amount: 0,
      currency: 'INR',
      changePercent: 0,
      changeLabel: 'vs yesterday',
    },
    offlineSales: {
      amount: 0,
      currency: 'INR',
      changePercent: 0,
      changeLabel: 'vs yesterday',
    },
  },
  paymentBreakdown: {
    total: 0,
    items: [],
  },
  salesByOrderType: [],
  salesSummary: {
    totalOrders: 0,
    totalSales: 0,
  },
  onlineOrders: {
    totalSales: 0,
    totalOrders: 0,
    platforms: [
      { id: 'zomato', platform: 'Zomato', orders: 0 },
      { id: 'swiggy', platform: 'Swiggy', orders: 0 },
      { id: 'growthfalcons', platform: 'GrowthFalcons', orders: 0 },
    ],
  },
  orderTypeSummary: [
    {
      id: 'dine-in',
      label: 'Dine In',
      sales: 0,
      orders: 0,
      color: organisationChartColors.blue,
    },
    {
      id: 'take-away',
      label: 'Take Away',
      sales: 0,
      orders: 0,
      color: organisationChartColors.green,
    },
    {
      id: 'delivery',
      label: 'Delivery',
      sales: 0,
      orders: 0,
      color: organisationChartColors.pink,
    },
  ],
  expenses: {
    headerAmount: 0,
    changePercent: 0,
    changeLabel: 'vs yesterday',
    items: [],
    total: 0,
  },
  leakage: {
    kots: {
      items: [
        { label: 'Cancelled', value: 0 },
        { label: 'Modified', value: 0 },
        { label: 'Not used in bills', value: 0 },
        { label: 'Shifted', value: 0 },
      ],
    },
    bills: {
      items: [
        { label: 'Modified', value: 0 },
        { label: 'Re-printed', value: 0 },
        { label: 'Waived off', value: 0 },
      ],
    },
  },
  accountManager: {
    name: 'Hospixo Support',
    role: 'Your dedicated account manager',
    phone: '+91 98765 43210',
    online: true,
    outletId: '-',
    supportHours: '10:00 AM - 07:00 PM',
    supportMessage: 'Reach out for any billing, inventory, or operational support queries.',
  },
};

export function getDefaultBranchCustomRange(): Readonly<{ from: string; to: string }> {
  return { from: '2025-06-28', to: '2025-07-04' };
}
