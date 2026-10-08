import type { DineInOrderLine } from '@/features/pos/config/dine-in';
import { orderDetailsSeedLines } from '@/features/pos/config/order-details';
import { posOrderActions } from '@/features/pos/config/order-actions';
import { resolveLinesAmount } from '@/features/pos/lib/order/lines';

export type OpenOrderType = 'all' | 'dineIn' | 'takeaway' | 'delivery' | 'online';

export { posOrderActions as openOrderActions };

export type OpenOrderKitchenStatus = 'kotSent' | 'ready' | 'preparing' | 'billing';

export type OpenOrderPaymentStatus = 'paid' | 'unpaid';

export interface OpenOrder {
  id: string;
  orderNumber: string;
  type: Exclude<OpenOrderType, 'all'>;
  reference: string;
  kitchenStatus: OpenOrderKitchenStatus;
  paymentStatus: OpenOrderPaymentStatus;
  age: string;
  amount: number;
  /** Linked table for dine-in add-items flow. */
  tableId?: string;
  /** Cart lines backing this open order. */
  lines?: DineInOrderLine[];
  waiter?: string;
  /** Kitchen display ticket id. */
  kitchenOrderId?: string;
}

export const openOrdersPageMeta = {
  title: 'Open Orders',
  searchPlaceholder: 'Order, table or bill no.',
  syncLabel: 'Online - synced',
  downloadReportLabel: 'Download Report',
  tableTimeLabel: 'Time',
};

export const openOrdersTopFilters: { id: OpenOrderType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'dineIn', label: 'Dine-In' },
  { id: 'takeaway', label: 'Takeaway' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'online', label: 'Online' },
];

export const openOrdersPillFilters: { id: OpenOrderType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'dineIn', label: 'Dine-in' },
  { id: 'takeaway', label: 'Takeaway' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'online', label: 'Online' },
];

export const openOrdersFooterSummary = {
  runningOrders: 6,
  awaitingKitchen: 2,
  readyToSettle: 2,
  currentPage: 1,
};

export const openOrders: OpenOrder[] = [
  {
    id: 'o1',
    orderNumber: '#1042',
    type: 'dineIn',
    reference: 'Table T4',
    kitchenStatus: 'kotSent',
    paymentStatus: 'unpaid',
    age: '12m',
    amount: 882,
    tableId: 't4',
    waiter: 'Rohit K.',
    lines: orderDetailsSeedLines,
    kitchenOrderId: 'ord-1024',
  },
  {
    id: 'o2',
    orderNumber: '#1041',
    type: 'takeaway',
    reference: 'Counter 2',
    kitchenStatus: 'ready',
    paymentStatus: 'paid',
    age: '18m',
    amount: 540,
  },
  {
    id: 'o3',
    orderNumber: '#1040',
    type: 'delivery',
    reference: 'Partner #D882',
    kitchenStatus: 'preparing',
    paymentStatus: 'paid',
    age: '24m',
    amount: 760,
  },
  {
    id: 'o4',
    orderNumber: '#1039',
    type: 'online',
    reference: 'Swiggy #SW1024',
    kitchenStatus: 'billing',
    paymentStatus: 'paid',
    age: '31m',
    amount: 680,
  },
  {
    id: 'o5',
    orderNumber: '#1038',
    type: 'dineIn',
    reference: 'Table T2',
    kitchenStatus: 'ready',
    paymentStatus: 'unpaid',
    age: '36m',
    amount: 1250,
    tableId: 't2',
    waiter: 'Ravi',
    lines: [],
  },
  {
    id: 'o6',
    orderNumber: '#1037',
    type: 'online',
    reference: 'Zomato #ZM882',
    kitchenStatus: 'preparing',
    paymentStatus: 'paid',
    age: '42m',
    amount: 420,
  },
];

export function formatOpenOrderAmount(amount: number) {
  return `Rs.${amount.toLocaleString('en-IN')}`;
}

/** Prefer line-item totals when cart lines exist — keeps list amount in sync. */
export function resolveOpenOrderAmount(order: OpenOrder) {
  return resolveLinesAmount(order.lines, order.amount);
}

export function formatOpenOrderTime(age: string) {
  if (age === 'now') return 'Just now';
  if (/^\d+m$/.test(age)) return `${age.replace('m', ' min')} ago`;
  return age;
}

export function getOpenOrderTypeLabel(type: Exclude<OpenOrderType, 'all'>) {
  return openOrdersTopFilters.find((item) => item.id === type)?.label ?? type;
}

export function getKitchenStatusLabel(status: OpenOrderKitchenStatus) {
  switch (status) {
    case 'kotSent':
      return 'KOT Sent';
    case 'ready':
      return 'Ready';
    case 'preparing':
      return 'Preparing';
    case 'billing':
      return 'Billing';
    default:
      return status;
  }
}

export function getPaymentStatusLabel(status: OpenOrderPaymentStatus) {
  return status === 'paid' ? 'Paid' : 'Unpaid';
}

export function getOpenOrdersSummaryText() {
  const { runningOrders, awaitingKitchen, readyToSettle } = openOrdersFooterSummary;
  return `Showing ${runningOrders} running orders • ${awaitingKitchen} awaiting kitchen, ${readyToSettle} ready to settle`;
}
