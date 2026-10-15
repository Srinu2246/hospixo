export interface PosMetricCardData {
  id: string;
  title: string;
  value: number | string;
  trend: string;
  trendDirection: 'up' | 'down';
  comparisonText: string;
  iconType: 'orders' | 'pending' | 'ready' | 'bills';
}

export interface PosLiveOrder {
  id: string;
  orderNumber: string;
  table: string;
  customerName: string;
  status: 'preparing' | 'ready' | 'billing';
  time: string;
  action: 'View' | 'Pay' | 'Edit';
}

export type TableStatus = 'vacant' | 'occupied' | 'reserved' | 'cleaning';

export interface PosFloorTable {
  id: string;
  tableNumber: string;
  status: TableStatus;
  statusLabel: string;
}

export interface PosOnlinePlatform {
  id: string;
  name: string;
  orders: number;
  iconKey: 'zomato' | 'swiggy' | 'growthfalcons';
}

export interface PosOnlineSummary {
  totalSales: string;
  totalOrders: number;
  period: string;
  platforms: PosOnlinePlatform[];
}

export interface PosReadyOrder {
  id: string;
  orderNumber: string;
  destination: string;
  status: 'readyToServe' | 'waitingPickup' | 'waitingDriver';
  statusLabel: string;
}

export interface PosRecentTransaction {
  id: string;
  txNumber: string;
  amount: string;
  method: 'upi' | 'cash' | 'card';
  statusLabel: string;
}

export interface PosSystemNotification {
  id: string;
  message: string;
  status: string;
  severity: 'critical' | 'completed' | 'pending' | 'offline';
}

export interface PosShiftInfo {
  started: string;
  ordersHandled: number;
  status: string;
  statusColor: 'success' | 'warning' | 'error';
}

export const POS_METRIC_CARDS: PosMetricCardData[] = [
  {
    id: 'total-orders',
    title: 'TOTAL ORDERS',
    value: 112,
    trend: '12.4%',
    trendDirection: 'up',
    comparisonText: 'vs yesterday',
    iconType: 'orders',
  },
  {
    id: 'pending-orders',
    title: 'PENDING ORDERS',
    value: 7,
    trend: '12.4%',
    trendDirection: 'up',
    comparisonText: 'vs yesterday',
    iconType: 'pending',
  },
  {
    id: 'orders-ready',
    title: 'ORDERS READY',
    value: 18,
    trend: '12.4%',
    trendDirection: 'up',
    comparisonText: 'vs yesterday',
    iconType: 'ready',
  },
  {
    id: 'open-bills',
    title: 'OPEN BILLS',
    value: 7,
    trend: '12.4%',
    trendDirection: 'up',
    comparisonText: 'vs yesterday',
    iconType: 'bills',
  },
];

export const POS_LIVE_ORDERS: PosLiveOrder[] = [
  {
    id: '1',
    orderNumber: '#124',
    table: 'T12',
    customerName: 'Rahul',
    status: 'preparing',
    time: '8 min ago',
    action: 'View',
  },
  {
    id: '2',
    orderNumber: '#125',
    table: 'T08',
    customerName: 'Anil',
    status: 'ready',
    time: '12 min ago',
    action: 'Pay',
  },
  {
    id: '3',
    orderNumber: '#126',
    table: 'TW',
    customerName: 'Priya',
    status: 'billing',
    time: '3 min ago',
    action: 'Edit',
  },
  {
    id: '4',
    orderNumber: '#127',
    table: 'T03',
    customerName: 'Ravi',
    status: 'preparing',
    time: '5 min ago',
    action: 'View',
  },
  {
    id: '5',
    orderNumber: '#128',
    table: 'T15',
    customerName: 'Kiran',
    status: 'ready',
    time: '9 min ago',
    action: 'Pay',
  },
];

export const POS_FLOOR_TABLES: PosFloorTable[] = [
  { id: 't1', tableNumber: 'T1', status: 'occupied', statusLabel: 'Occupied' },
  { id: 't2', tableNumber: 'T2', status: 'vacant', statusLabel: 'Vacant' },
  { id: 't3', tableNumber: 'T3', status: 'reserved', statusLabel: 'Reserved' },
  { id: 't4', tableNumber: 'T4', status: 'occupied', statusLabel: 'Occupied' },
  { id: 't5', tableNumber: 'T5', status: 'cleaning', statusLabel: 'Cleaning' },
  { id: 't6', tableNumber: 'T6', status: 'vacant', statusLabel: 'Vacant' },
  { id: 't7', tableNumber: 'T6', status: 'occupied', statusLabel: 'Occupied' },
  { id: 't8', tableNumber: 'T7', status: 'cleaning', statusLabel: 'Cleaning' },
  { id: 't9', tableNumber: 'T8', status: 'vacant', statusLabel: 'Vacant' },
];

export const POS_ONLINE_SUMMARY: PosOnlineSummary = {
  totalSales: '₹ 0',
  totalOrders: 0,
  period: 'Today',
  platforms: [
    { id: 'zomato', name: 'Zomato', orders: 0, iconKey: 'zomato' },
    { id: 'swiggy', name: 'Swiggy', orders: 0, iconKey: 'swiggy' },
    { id: 'growthfalcons', name: 'GrowthFalcons', orders: 0, iconKey: 'growthfalcons' },
  ],
};

export const POS_READY_ORDERS: PosReadyOrder[] = [
  {
    id: 'ro-1',
    orderNumber: '#120',
    destination: 'Table 6',
    status: 'readyToServe',
    statusLabel: 'Ready to Serve',
  },
  {
    id: 'ro-2',
    orderNumber: '#121',
    destination: 'Takeaway',
    status: 'waitingPickup',
    statusLabel: 'Waiting Pickup',
  },
  {
    id: 'ro-3',
    orderNumber: '#122',
    destination: 'Takeaway',
    status: 'waitingPickup',
    statusLabel: 'Waiting Pickup',
  },
  {
    id: 'ro-4',
    orderNumber: '#123',
    destination: 'Delivery',
    status: 'waitingDriver',
    statusLabel: 'Waiting Driver',
  },
];

export const POS_RECENT_TRANSACTIONS: PosRecentTransaction[] = [
  { id: 'tx-1', txNumber: '#1024', amount: '₹840', method: 'upi', statusLabel: 'UPI' },
  { id: 'tx-2', txNumber: '#1025', amount: '₹520', method: 'cash', statusLabel: 'Cash' },
  { id: 'tx-3', txNumber: '#1026', amount: '₹1380', method: 'card', statusLabel: 'Card' },
  { id: 'tx-4', txNumber: '#1027', amount: '₹1380', method: 'card', statusLabel: 'Card' },
];

export const POS_SYSTEM_NOTIFICATIONS: PosSystemNotification[] = [
  {
    id: 'sn-1',
    message: 'Kitchen Delay: Main burner prep slow',
    status: 'CRITICAL',
    severity: 'critical',
  },
  {
    id: 'sn-2',
    message: 'Order Ready: Table T05 Chicken Tikka',
    status: 'COMPLETED',
    severity: 'completed',
  },
  {
    id: 'sn-3',
    message: 'Table Requesting Bill: Table T12',
    status: 'PENDING',
    severity: 'pending',
  },
  {
    id: 'sn-4',
    message: 'Printer Offline: KOT Printer 2',
    status: 'OFFLINE',
    severity: 'offline',
  },
];

export const POS_SHIFT_INFO: PosShiftInfo = {
  started: '09:00 AM',
  ordersHandled: 142,
  status: 'Shift Open',
  statusColor: 'success',
};
