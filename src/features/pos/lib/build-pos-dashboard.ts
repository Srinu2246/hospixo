import type { OnlineOrder } from '@/features/pos/config/online-orders';
import type { OpenOrder } from '@/features/pos/config/open-orders';
import type { ReadyOrder } from '@/features/pos/config/ready-list';
import type { PosTable, TableStatus } from '@/features/pos/config/tables';
import {
  floorStatusLegend,
  onlinePlatformStats as defaultPlatformStats,
  shiftInfo as defaultShiftInfo,
  systemNotifications as defaultNotifications,
  type DashboardSummaryCard,
  type FloorTable,
  type FloorTableStatus,
  type LiveOrderAction,
  type LiveOrderRow,
  type LiveOrderStatus,
  type OnlinePlatformStat,
  type PaymentMethod,
  type ReadyOrderItem,
  type ReadyOrderStatus,
  type RecentTransaction,
  type ShiftInfo,
  type SystemNotification,
} from '@/features/pos/config/dashboard';
import type {
  ActiveCashShift,
  CashShiftMetrics,
  CashTransaction,
} from '@/features/pos/types/cash-shift';

const LIVE_QUEUE_LIMIT = 8;
const FLOOR_TABLE_LIMIT = 9;
const READY_PANEL_LIMIT = 6;
const TRANSACTION_LIMIT = 5;

export type PosDashboardData = Readonly<{
  summaryCards: DashboardSummaryCard[];
  liveOrderQueue: LiveOrderRow[];
  floorTables: FloorTable[];
  floorLegend: typeof floorStatusLegend;
  onlineSummary: { totalSales: number; orders: number };
  onlinePlatforms: OnlinePlatformStat[];
  readyOrders: ReadyOrderItem[];
  recentTransactions: RecentTransaction[];
  notifications: SystemNotification[];
  shift: ShiftInfo;
}>;

export type BuildPosDashboardInput = Readonly<{
  openOrders: readonly OpenOrder[];
  readyOrders: readonly ReadyOrder[];
  onlineOrders: readonly OnlineOrder[];
  posTables: readonly PosTable[];
  cashTransactions: readonly CashTransaction[];
  activeShift: ActiveCashShift | null;
  shiftMetrics: CashShiftMetrics | null;
}>;

function mapKitchenToLiveStatus(kitchenStatus: OpenOrder['kitchenStatus']): LiveOrderStatus {
  switch (kitchenStatus) {
    case 'ready':
      return 'ready';
    case 'billing':
      return 'billing';
    default:
      return 'preparing';
  }
}

function resolveLiveOrderAction(order: OpenOrder): LiveOrderAction {
  if (order.kitchenStatus === 'billing' || order.paymentStatus === 'unpaid') {
    return order.kitchenStatus === 'billing' ? 'edit' : 'pay';
  }
  if (order.kitchenStatus === 'ready') return 'pay';
  return 'view';
}

function tableLabelFromReference(reference: string): string {
  const match = /table\s+(\S+)/i.exec(reference);
  if (match?.[1]) return match[1].toUpperCase().startsWith('T') ? match[1] : `T${match[1]}`;
  return reference.length > 12 ? `${reference.slice(0, 12)}…` : reference;
}

function customerLabel(order: OpenOrder): string {
  if (order.waiter?.trim()) return order.waiter.trim();
  if (order.type === 'takeaway' || order.type === 'delivery' || order.type === 'online') {
    return 'Guest';
  }
  return 'Walk-in';
}

export function buildLiveOrderQueue(orders: readonly OpenOrder[]): LiveOrderRow[] {
  return orders.slice(0, LIVE_QUEUE_LIMIT).map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    table: tableLabelFromReference(order.reference),
    customerName: customerLabel(order),
    status: mapKitchenToLiveStatus(order.kitchenStatus),
    time: order.age,
    action: resolveLiveOrderAction(order),
  }));
}

function mapTableStatus(status: TableStatus): FloorTableStatus {
  switch (status) {
    case 'available':
      return 'vacant';
    case 'cleaning':
      return 'cleaning';
    case 'billing':
    case 'occupied':
    case 'kotSent':
    case 'preparing':
    case 'ready':
      return 'occupied';
    default:
      return 'vacant';
  }
}

export function buildFloorTables(tables: readonly PosTable[]): FloorTable[] {
  const slice = tables.slice(0, FLOOR_TABLE_LIMIT);
  if (slice.length === 0) {
    return [];
  }
  return slice.map((table) => ({
    id: table.id,
    label: table.label,
    status: mapTableStatus(table.status),
  }));
}

export function buildSummaryCards(
  orders: readonly OpenOrder[],
  ready: readonly ReadyOrder[],
): DashboardSummaryCard[] {
  const pending = orders.filter(
    (o) => o.kitchenStatus === 'kotSent' || o.kitchenStatus === 'preparing',
  ).length;
  const readyCount = ready.length;
  const openBills = orders.filter(
    (o) => o.kitchenStatus === 'billing' || o.paymentStatus === 'unpaid',
  ).length;
  const totalOrders = orders.length + readyCount;

  return [
    {
      id: 'total-orders',
      label: 'Total Orders',
      value: totalOrders,
      trend: 'Live store operations',
      icon: 'totalOrders',
    },
    {
      id: 'pending-orders',
      label: 'Pending Orders',
      value: pending,
      trend: 'Awaiting kitchen',
      icon: 'pendingOrders',
    },
    {
      id: 'orders-ready',
      label: 'Orders Ready',
      value: readyCount,
      trend: 'Ready to serve',
      icon: 'ordersReady',
    },
    {
      id: 'open-bills',
      label: 'Open Bills',
      value: openBills,
      trend: 'Unpaid or billing',
      icon: 'openBills',
    },
  ];
}

function mapReadyStatus(order: ReadyOrder): ReadyOrderStatus {
  const table = order.table.toLowerCase();
  if (table.includes('takeaway') || table.includes('pickup')) return 'waitingPickup';
  if (table.includes('delivery') || table.includes('online')) return 'waitingDriver';
  return 'readyToServe';
}

export function buildReadyPanelOrders(orders: readonly ReadyOrder[]): ReadyOrderItem[] {
  return orders.slice(0, READY_PANEL_LIMIT).map((order) => ({
    id: order.id,
    label: `${order.token} ${order.table}`,
    status: mapReadyStatus(order),
  }));
}

export function buildOnlineSummary(orders: readonly OnlineOrder[]): {
  totalSales: number;
  orders: number;
  platforms: OnlinePlatformStat[];
} {
  const totalSales = orders.reduce((sum, order) => sum + order.amount, 0);
  const platformCounts = new Map<string, number>();

  for (const order of orders) {
    const key = order.channel;
    platformCounts.set(key, (platformCounts.get(key) ?? 0) + 1);
  }

  const platforms: OnlinePlatformStat[] = defaultPlatformStats.map((platform) => {
    let channelKey: string | null = null;
    if (platform.id === 'zomato') channelKey = 'zomato';
    if (platform.id === 'swiggy') channelKey = 'swiggy';
    if (platform.id === 'growthfalcons') channelKey = 'website';

    return {
      ...platform,
      orders: channelKey ? (platformCounts.get(channelKey) ?? 0) : 0,
    };
  });

  return { totalSales, orders: orders.length, platforms };
}

function mapTxnMethod(type: CashTransaction['type']): PaymentMethod {
  switch (type) {
    case 'card_sale':
      return 'card';
    case 'cash_sale':
    case 'cash_in':
    case 'tip':
      return 'cash';
    default:
      return 'upi';
  }
}

export function buildRecentTransactions(
  transactions: readonly CashTransaction[],
): RecentTransaction[] {
  const sales = transactions.filter(
    (tx) => tx.type === 'cash_sale' || tx.type === 'card_sale' || tx.type === 'tip',
  );

  return sales.slice(0, TRANSACTION_LIMIT).map((tx) => ({
    id: tx.id,
    reference: tx.description.split('·')[0]?.trim() || tx.description.slice(0, 12),
    amount: Math.abs(tx.amount),
    method: mapTxnMethod(tx.type),
  }));
}

export function buildShiftInfo(
  activeShift: ActiveCashShift | null,
  metrics: CashShiftMetrics | null,
): ShiftInfo {
  if (!activeShift || !metrics) {
    return defaultShiftInfo;
  }

  return {
    started: activeShift.startTimeLabel,
    ordersHandled: metrics.transactions,
    status: metrics.status === 'active' ? 'Shift Open' : 'Shift Closed',
  };
}

export function buildPosDashboard(input: BuildPosDashboardInput): PosDashboardData {
  const online = buildOnlineSummary(input.onlineOrders);
  const transactions = buildRecentTransactions(input.cashTransactions);

  return {
    summaryCards: buildSummaryCards(input.openOrders, input.readyOrders),
    liveOrderQueue: buildLiveOrderQueue(input.openOrders),
    floorTables: buildFloorTables(input.posTables),
    floorLegend: floorStatusLegend,
    onlineSummary: { totalSales: online.totalSales, orders: online.orders },
    onlinePlatforms: online.platforms,
    readyOrders: buildReadyPanelOrders(input.readyOrders),
    recentTransactions:
      transactions.length > 0
        ? transactions
        : input.openOrders
            .filter((o) => o.paymentStatus === 'paid')
            .slice(0, TRANSACTION_LIMIT)
            .map((o) => ({
              id: o.id,
              reference: o.orderNumber,
              amount: o.amount,
              method: 'cash' as PaymentMethod,
            })),
    notifications: defaultNotifications,
    shift: buildShiftInfo(input.activeShift, input.shiftMetrics),
  };
}
