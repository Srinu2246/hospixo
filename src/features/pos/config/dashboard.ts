export type DashboardSummaryIcon = 'totalOrders' | 'pendingOrders' | 'ordersReady' | 'openBills';

export interface DashboardSummaryCard {
  id: string;
  label: string;
  value: number;
  trend: string;
  icon: DashboardSummaryIcon;
}

export type LiveOrderStatus = 'preparing' | 'ready' | 'billing';

export type LiveOrderAction = 'view' | 'pay' | 'edit';

export interface LiveOrderRow {
  id: string;
  orderNumber: string;
  table: string;
  customerName: string;
  status: LiveOrderStatus;
  time: string;
  action: LiveOrderAction;
}

export type FloorTableStatus = 'occupied' | 'vacant' | 'reserved' | 'cleaning';

export interface FloorTable {
  id: string;
  label: string;
  status: FloorTableStatus;
}

export interface OnlinePlatformStat {
  id: string;
  name: string;
  orders: number;
  logoSrc?: string;
}

export type ReadyOrderStatus = 'readyToServe' | 'waitingPickup' | 'waitingDriver';

export interface ReadyOrderItem {
  id: string;
  label: string;
  status: ReadyOrderStatus;
}

export type PaymentMethod = 'upi' | 'cash' | 'card';

export interface RecentTransaction {
  id: string;
  reference: string;
  amount: number;
  method: PaymentMethod;
}

export type NotificationSeverity = 'critical' | 'completed' | 'warning' | 'info';

export interface SystemNotification {
  id: string;
  title: string;
  severity: NotificationSeverity;
}

export interface ShiftInfo {
  started: string;
  ordersHandled: number;
  status: string;
}

export const dashboardSummaryCards: DashboardSummaryCard[] = [
  {
    id: 'total-orders',
    label: 'Total Orders',
    value: 112,
    trend: '↑ 12.4% vs yesterday',
    icon: 'totalOrders',
  },
  {
    id: 'pending-orders',
    label: 'Pending Orders',
    value: 7,
    trend: '↑ 12.4% vs yesterday',
    icon: 'pendingOrders',
  },
  {
    id: 'orders-ready',
    label: 'Orders Ready',
    value: 18,
    trend: '↑ 12.4% vs yesterday',
    icon: 'ordersReady',
  },
  {
    id: 'open-bills',
    label: 'Open Bills',
    value: 7,
    trend: '↑ 12.4% vs yesterday',
    icon: 'openBills',
  },
];

export const liveOrderQueue: LiveOrderRow[] = [
  {
    id: 'lo1',
    orderNumber: '#1042',
    table: 'T4',
    customerName: 'John Doe',
    status: 'preparing',
    time: '12m',
    action: 'view',
  },
  {
    id: 'lo2',
    orderNumber: '#1041',
    table: 'T2',
    customerName: 'Walk-in',
    status: 'ready',
    time: '18m',
    action: 'pay',
  },
  {
    id: 'lo3',
    orderNumber: '#1039',
    table: 'T7',
    customerName: 'Sarah Lee',
    status: 'billing',
    time: '25m',
    action: 'edit',
  },
  {
    id: 'lo4',
    orderNumber: '#1038',
    table: 'T1',
    customerName: 'Walk-in',
    status: 'preparing',
    time: '31m',
    action: 'view',
  },
];

export const floorTables: FloorTable[] = [
  { id: 't1', label: 'T1', status: 'vacant' },
  { id: 't2', label: 'T2', status: 'occupied' },
  { id: 't3', label: 'T3', status: 'reserved' },
  { id: 't4', label: 'T4', status: 'occupied' },
  { id: 't5', label: 'T5', status: 'cleaning' },
  { id: 't6', label: 'T6', status: 'vacant' },
  { id: 't7', label: 'T7', status: 'occupied' },
  { id: 't8', label: 'T8', status: 'reserved' },
];

export const floorStatusLegend: { status: FloorTableStatus; label: string }[] = [
  { status: 'occupied', label: 'Occupied' },
  { status: 'vacant', label: 'Vacant' },
  { status: 'reserved', label: 'Reserved' },
  { status: 'cleaning', label: 'Cleaning' },
];

export const onlineOrdersSummary = {
  totalSales: 0,
  orders: 0,
};

export const onlinePlatformStats: OnlinePlatformStat[] = [
  { id: 'zomato', name: 'Zomato', orders: 0 },
  { id: 'swiggy', name: 'Swiggy', orders: 0 },
  { id: 'growthfalcons', name: 'GrowthFalcons', orders: 0 },
];

export const readyOrders: ReadyOrderItem[] = [
  { id: 'r1', label: '#120 Table 6', status: 'readyToServe' },
  { id: 'r2', label: '#118 Table 2', status: 'waitingPickup' },
  { id: 'r3', label: '#115 Takeaway', status: 'waitingDriver' },
];

export const recentTransactions: RecentTransaction[] = [
  { id: 'tx1', reference: '#1024', amount: 840, method: 'upi' },
  { id: 'tx2', reference: '#1023', amount: 560, method: 'cash' },
  { id: 'tx3', reference: '#1022', amount: 1200, method: 'card' },
];

export const systemNotifications: SystemNotification[] = [
  { id: 'n1', title: 'Kitchen Delay', severity: 'critical' },
  { id: 'n2', title: 'Order Ready', severity: 'completed' },
  { id: 'n3', title: 'Low Stock Alert', severity: 'warning' },
  { id: 'n4', title: 'Shift End Reminder', severity: 'info' },
];

export const shiftInfo: ShiftInfo = {
  started: '09:00 AM',
  ordersHandled: 142,
  status: 'Shift Open',
};

export function getLiveOrderStatusLabel(status: LiveOrderStatus): string {
  const labels: Record<LiveOrderStatus, string> = {
    preparing: 'Preparing',
    ready: 'Ready',
    billing: 'Billing',
  };
  return labels[status];
}

export function getLiveOrderActionLabel(action: LiveOrderAction): string {
  const labels: Record<LiveOrderAction, string> = {
    view: 'View',
    pay: 'Pay',
    edit: 'Edit',
  };
  return labels[action];
}

export function getFloorStatusLabel(status: FloorTableStatus): string {
  const labels: Record<FloorTableStatus, string> = {
    occupied: 'Occupied',
    vacant: 'Vacant',
    reserved: 'Reserved',
    cleaning: 'Cleaning',
  };
  return labels[status];
}

export function getReadyOrderStatusLabel(status: ReadyOrderStatus): string {
  const labels: Record<ReadyOrderStatus, string> = {
    readyToServe: 'Ready to Serve',
    waitingPickup: 'Waiting Pickup',
    waitingDriver: 'Waiting Driver',
  };
  return labels[status];
}

export function getPaymentMethodLabel(method: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    upi: 'UPI',
    cash: 'Cash',
    card: 'Card',
  };
  return labels[method];
}

export function getNotificationSeverityLabel(severity: NotificationSeverity): string {
  const labels: Record<NotificationSeverity, string> = {
    critical: 'CRITICAL',
    completed: 'COMPLETED',
    warning: 'WARNING',
    info: 'INFO',
  };
  return labels[severity];
}

export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}
