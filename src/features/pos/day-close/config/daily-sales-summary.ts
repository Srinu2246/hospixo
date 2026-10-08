import { routes } from '@/config/routes';

export const dailySalesSummaryPageMeta = {
  title: 'Daily Sales Summary',
  subtitle: 'Review final performance metrics for May 17, 2026',
  backLabel: 'Back',
  confirmLabel: 'Confirm & Finalize Day Close',
  backHref: routes.platform.pos.cashReconciliation,
  confirmHref: routes.platform.pos.dayCloseClosing,
};

export const dailySalesMetrics = [
  { id: 'gross-revenue', label: 'Gross Revenue', value: '₹84,290.00' },
  { id: 'total-orders', label: 'Total Orders', value: '142' },
  { id: 'avg-order-value', label: 'Avg Order Value', value: '₹593.50' },
  { id: 'total-guests', label: 'Total Guests', value: '384' },
] as const;

export interface HourlySalesPoint {
  id: string;
  label: string;
  value: number;
}

export const dailySalesHourlyTrend: HourlySalesPoint[] = [
  { id: '10am', label: '10am', value: 35 },
  { id: '12pm', label: '12pm', value: 88 },
  { id: '2pm', label: '2pm', value: 52 },
  { id: '4pm', label: '4pm', value: 28 },
  { id: '6pm', label: '6pm', value: 82 },
  { id: '8pm', label: '8pm', value: 96 },
  { id: '10pm', label: '10pm', value: 44 },
];

export const dailySalesPaymentMethodsMeta = {
  title: 'Payment Methods',
  periodLabel: 'Today',
  distributionLabel: 'Distribution',
  totalAmount: 84290,
};

export interface PaymentMethodItem {
  id: 'cash' | 'card' | 'upi';
  label: string;
  amount: number;
  percent: number;
  badgeClass: 'badgeCash' | 'badgeCard' | 'badgeUpi';
}

export const dailySalesPaymentMethods: PaymentMethodItem[] = [
  { id: 'cash', label: 'Cash', amount: 18200, percent: 22, badgeClass: 'badgeCash' },
  { id: 'card', label: 'Card', amount: 45090, percent: 53, badgeClass: 'badgeCard' },
  { id: 'upi', label: 'UPI', amount: 21000, percent: 25, badgeClass: 'badgeUpi' },
];

export const dailySalesTopItemsMeta = {
  title: 'Top Selling Items',
  columns: {
    item: 'Item Name',
    qty: 'Qty',
    revenue: 'Revenue',
  },
};

export interface TopSellingItem {
  id: string;
  name: string;
  qty: number;
  revenue: number;
}

export const dailySalesTopItems: TopSellingItem[] = [
  { id: 'butter-chicken', name: 'Butter Chicken', qty: 24, revenue: 12480 },
  { id: 'paneer-tikka', name: 'Paneer Tikka', qty: 18, revenue: 6840 },
  { id: 'garlic-naan', name: 'Garlic Naan', qty: 42, revenue: 3360 },
  { id: 'mango-lassi', name: 'Mango Lassi', qty: 15, revenue: 2250 },
  { id: 'dal-makhani', name: 'Dal Makhani', qty: 12, revenue: 4200 },
];

export function formatDailySalesAmount(amount: number) {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function formatDailySalesRevenue(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}
