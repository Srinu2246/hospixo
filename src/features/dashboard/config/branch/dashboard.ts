import { flowPaths } from '@/config/shell/flow-paths';
import { organisationChartColors } from '@/features/dashboard/lib/organisation-chart-colors';
import type { BranchDashboardOverview } from '@/features/dashboard/types/branch-dashboard';
import type { OrganisationDateRangeId } from '@/features/dashboard/types/organisation-dashboard';

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
  dateRangeOptions: [
    { id: 'today', label: 'Today' },
    { id: 'last-7-days', label: 'Last 7 days' },
    { id: 'last-30-days', label: 'Last 30 days' },
    { id: 'custom', label: 'Custom' },
  ] as const satisfies ReadonlyArray<{ id: OrganisationDateRangeId; label: string }>,
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
      amount: 42850,
      currency: 'INR',
      changePercent: 12.4,
      changeLabel: 'vs yesterday',
    },
    netSales: {
      amount: 42000,
      currency: 'INR',
      changePercent: 8.2,
      changeLabel: 'vs yesterday',
    },
    onlineSales: {
      amount: 20000,
      currency: 'INR',
      changePercent: -4.1,
      changeLabel: 'vs yesterday',
    },
    offlineSales: {
      amount: 22000,
      currency: 'INR',
      changePercent: 15.6,
      changeLabel: 'vs yesterday',
    },
  },
  paymentBreakdown: {
    total: 887260,
    items: [
      { label: 'Cash', amount: 142783, color: organisationChartColors.blue },
      { label: 'Card', amount: 53786, color: organisationChartColors.purple },
      { label: 'UPI', amount: 37730, color: organisationChartColors.green },
      { label: 'Other', amount: 652961, color: organisationChartColors.amber },
    ],
  },
  salesByOrderType: [
    {
      id: 'dine-in',
      label: 'Dine in',
      sales: 120000,
      orders: 420,
      color: organisationChartColors.blue,
    },
    {
      id: 'take-away',
      label: 'Take Away',
      sales: 85000,
      orders: 310,
      color: organisationChartColors.green,
    },
    {
      id: 'delivery',
      label: 'Delivery',
      sales: 145000,
      orders: 202,
      color: organisationChartColors.pink,
    },
  ],
  salesSummary: {
    totalOrders: 932,
    totalSales: 48560,
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
      sales: 848582,
      orders: 3321,
      color: organisationChartColors.blue,
    },
    {
      id: 'take-away',
      label: 'Take Away',
      sales: 6084,
      orders: 121,
      color: organisationChartColors.green,
    },
    {
      id: 'delivery',
      label: 'Delivery',
      sales: 32594,
      orders: 24,
      color: organisationChartColors.pink,
    },
  ],
  expenses: {
    headerAmount: 9580,
    changePercent: 6.2,
    changeLabel: 'vs yesterday',
    items: [
      { label: 'Food Purchases', amount: 26000 },
      { label: 'Utilities', amount: 13000 },
      { label: 'Delivery Commission', amount: 36000 },
      { label: 'Kitchen Wastage', amount: 3000 },
      { label: 'Miscellaneous', amount: 26000 },
    ],
    total: 130000,
  },
  leakage: {
    kots: {
      items: [
        { label: 'Cancelled', value: 27 },
        { label: 'Modified', value: 47 },
        { label: 'Not used in bills', value: 21 },
        { label: 'Shifted', value: 3 },
      ],
    },
    bills: {
      items: [
        { label: 'Modified', value: 3 },
        { label: 'Re-printed', value: 1 },
        { label: 'Waived off', value: 1 },
      ],
    },
  },
  accountManager: {
    name: 'Kumar Reddy',
    role: 'Your dedicated account manager',
    phone: '+91 98765 43210',
    online: true,
    outletId: '63284',
    supportHours: '10:00 AM - 07:00 PM',
    supportMessage: 'Reach out for any billing, inventory, or operational support queries.',
  },
};

export function getDefaultBranchCustomRange(): Readonly<{ from: string; to: string }> {
  return { from: '2025-06-28', to: '2025-07-04' };
}
