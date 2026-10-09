import type { DineInOrderLine } from '@/features/pos/config/dine-in';
import type {
  OnlineOrder,
  OnlineOrderActionState,
  OnlineOrderChannel,
  OnlineOrderPriority,
} from '@/features/pos/config/online-orders';
import type {
  OpenOrder,
  OpenOrderKitchenStatus,
  OpenOrderPaymentStatus,
  OpenOrderType,
} from '@/features/pos/config/open-orders';
import type { ReadyListTab, ReadyOrder } from '@/features/pos/config/ready-list';
import { mapKitchenStatusToOpenOrder } from '@/features/pos/lib/order/kitchen-status';
import type { KitchenOrderStatus } from '@/features/kitchen/types';
import type { RestaurantOrderRecord } from '@/lib/api/restaurant-branch-pos';

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function rawRecord(record: RestaurantOrderRecord): Record<string, unknown> {
  return record as Record<string, unknown>;
}

function orderId(raw: Record<string, unknown>): string {
  return asString(raw.id ?? raw.order_id);
}

function kitchenStatusRaw(raw: Record<string, unknown>): string {
  return asString(raw.kitchen_status ?? raw.status).toLowerCase();
}

function orderStatusRaw(raw: Record<string, unknown>): string {
  return asString(raw.status ?? raw.order_status).toLowerCase();
}

function paymentStatusRaw(raw: Record<string, unknown>): string {
  return asString(raw.payment_status ?? raw.payment_state).toLowerCase();
}

function isTerminalOrder(raw: Record<string, unknown>): boolean {
  const kitchen = kitchenStatusRaw(raw);
  const status = orderStatusRaw(raw);
  return (
    kitchen.includes('served') ||
    kitchen.includes('completed') ||
    status.includes('completed') ||
    status.includes('cancelled') ||
    status.includes('closed')
  );
}

function mapLines(raw: Record<string, unknown>): DineInOrderLine[] {
  const itemsRaw = Array.isArray(raw.items)
    ? raw.items
    : Array.isArray(raw.line_items)
      ? raw.line_items
      : [];

  return itemsRaw
    .map((entry, index) => {
      const line = entry as Record<string, unknown>;
      const id = asString(line.id ?? line.line_id, `line-${index}`);
      const name = asString(line.name ?? line.item_name, 'Item');
      const quantity = asNumber(line.quantity, 1);
      const price = asNumber(line.unit_price) || asNumber(line.price) || asNumber(line.rate) || 0;
      const menuItemId = asString(line.menu_item_id ?? line.item_id, id);
      return {
        id,
        menuItemId,
        name,
        quantity,
        price,
        imageUrl: asString(line.image_url ?? line.imageUrl, ''),
        variant: asString(line.variant) || undefined,
        addOns: undefined,
        cookingPreference: asString(line.notes ?? line.special_instructions) || undefined,
      };
    })
    .filter((line) => line.name);
}

function itemsSummary(raw: Record<string, unknown>): string {
  const summary = asString(raw.items_summary ?? raw.item_summary);
  if (summary) return summary;
  const lines = mapLines(raw);
  if (lines.length === 0) return '—';
  return lines.map((line) => `${line.name} ×${line.quantity}`).join(', ');
}

function formatTimeLabel(raw: Record<string, unknown>): string {
  const explicit = asString(raw.time_label ?? raw.timeLabel);
  if (explicit) return explicit;
  const iso = asString(raw.placed_at ?? raw.created_at);
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
}

function formatAgeLabel(raw: Record<string, unknown>): string {
  const age = asString(raw.age ?? raw.elapsed_label);
  if (age) return age;
  const iso = asString(raw.placed_at ?? raw.created_at);
  if (!iso) return '—';
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return 'now';
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return 'now';
  return `${minutes}m`;
}

function mapOpenOrderType(raw: Record<string, unknown>): Exclude<OpenOrderType, 'all'> {
  const type = asString(raw.order_type ?? raw.type ?? raw.channel).toLowerCase();
  if (type.includes('dine')) return 'dineIn';
  if (type.includes('take')) return 'takeaway';
  if (type.includes('deliver')) return 'delivery';
  if (
    type.includes('online') ||
    type.includes('swiggy') ||
    type.includes('zomato') ||
    type.includes('web')
  ) {
    return 'online';
  }
  return 'dineIn';
}

function mapOpenKitchenStatus(raw: Record<string, unknown>): OpenOrderKitchenStatus {
  const kitchen = kitchenStatusRaw(raw);
  if (kitchen.includes('bill')) return 'billing';
  if (kitchen.includes('ready')) return 'ready';
  if (kitchen.includes('prep')) return 'preparing';
  const mapped = mapKitchenStatusToOpenOrder(
    (kitchen.includes('ready')
      ? 'ready'
      : kitchen.includes('prep')
        ? 'preparing'
        : 'new') as KitchenOrderStatus,
  );
  return mapped;
}

function mapOpenPaymentStatus(raw: Record<string, unknown>): OpenOrderPaymentStatus {
  const payment = paymentStatusRaw(raw);
  if (payment.includes('paid')) return 'paid';
  return 'unpaid';
}

function mapOnlineChannel(raw: Record<string, unknown>): Exclude<OnlineOrderChannel, 'all'> {
  const channel = asString(
    raw.channel ?? raw.source ?? raw.platform ?? raw.aggregator ?? raw.order_type,
  ).toLowerCase();
  if (channel.includes('swiggy')) return 'swiggy';
  if (channel.includes('zomato')) return 'zomato';
  if (channel.includes('web')) return 'website';
  return 'website';
}

export function isOnlineAggregatorRecord(record: RestaurantOrderRecord): boolean {
  const raw = rawRecord(record);
  const type = mapOpenOrderType(raw);
  if (type === 'online') return true;
  const channel = mapOnlineChannel(raw);
  return channel !== 'website' || asString(raw.channel).toLowerCase().includes('online');
}

function mapOnlinePriority(raw: Record<string, unknown>): OnlineOrderPriority {
  const priority = asString(raw.priority ?? raw.urgency).toLowerCase();
  const status = orderStatusRaw(raw);
  const kitchen = kitchenStatusRaw(raw);
  if (status.includes('new') || status.includes('pending')) return 'new';
  if (priority.includes('high') || priority.includes('rush')) return 'high';
  if (kitchen.includes('ready')) return 'ready';
  return 'normal';
}

function mapOnlineActionState(raw: Record<string, unknown>): OnlineOrderActionState {
  const status = orderStatusRaw(raw);
  const kitchen = kitchenStatusRaw(raw);
  if (status.includes('cancel') || status.includes('reject')) return 'pickedUp';
  if (
    status.includes('picked') ||
    status.includes('delivered') ||
    status.includes('completed') ||
    kitchen.includes('served')
  ) {
    return 'pickedUp';
  }
  if (kitchen.includes('ready')) return 'readyForPickupDone';
  if (status.includes('accept') || kitchen.includes('prep') || kitchen.includes('new')) {
    return 'readyForPickup';
  }
  if (
    status.includes('pending') ||
    status.includes('new') ||
    status.includes('await') ||
    status === ''
  ) {
    return 'pendingAccept';
  }
  return 'readyForPickup';
}

function mapReadyTab(raw: Record<string, unknown>): ReadyListTab {
  const kitchen = kitchenStatusRaw(raw);
  const status = orderStatusRaw(raw);
  if (kitchen.includes('served') || status.includes('completed') || status.includes('served')) {
    return 'history';
  }
  if (kitchen.includes('ready')) return 'active';
  return 'pending';
}

export function mapOpenOrderRecord(record: RestaurantOrderRecord): OpenOrder | null {
  const raw = rawRecord(record);
  const id = orderId(raw);
  if (!id) return null;
  if (isTerminalOrder(raw)) return null;

  const lines = mapLines(raw);
  const amount =
    asNumber(raw.total) ||
    asNumber(raw.amount) ||
    asNumber(raw.grand_total) ||
    lines.reduce((sum, line) => sum + line.price * line.quantity, 0);

  return {
    id,
    orderNumber: asString(raw.order_number ?? raw.number, `#${id}`),
    type: mapOpenOrderType(raw),
    reference:
      asString(raw.reference ?? raw.table_label ?? raw.table_name) ||
      asString(raw.external_reference) ||
      '—',
    kitchenStatus: mapOpenKitchenStatus(raw),
    paymentStatus: mapOpenPaymentStatus(raw),
    age: formatAgeLabel(raw),
    amount,
    tableId: asString(raw.table_id ?? raw.tableId) || undefined,
    lines: lines.length > 0 ? lines : undefined,
    waiter: asString(raw.waiter ?? raw.waiter_name) || undefined,
    kitchenOrderId: asString(raw.kitchen_order_id) || id,
  };
}

export function mapOnlineOrderRecord(record: RestaurantOrderRecord): OnlineOrder | null {
  const raw = rawRecord(record);
  const id = orderId(raw);
  if (!id) return null;
  if (!isOnlineAggregatorRecord(record)) return null;
  if (isTerminalOrder(raw) && mapOnlineActionState(raw) === 'pickedUp') return null;

  const amount =
    asNumber(raw.total) ||
    asNumber(raw.amount) ||
    asNumber(raw.grand_total) ||
    asNumber(raw.payable_amount);

  const payment = paymentStatusRaw(raw);
  const prepaid =
    raw.prepaid === true ||
    payment.includes('paid') ||
    asString(raw.payment_type).toLowerCase().includes('pre');

  return {
    id,
    orderNumber: asString(raw.order_number ?? raw.number, `#${id}`),
    channel: mapOnlineChannel(raw),
    timeLabel: formatTimeLabel(raw),
    priority: mapOnlinePriority(raw),
    itemsSummary: itemsSummary(raw),
    prepaid,
    amount,
    actionState: mapOnlineActionState(raw),
  };
}

export function mapReadyOrderRecord(record: RestaurantOrderRecord): ReadyOrder | null {
  const raw = rawRecord(record);
  const id = orderId(raw);
  if (!id) return null;

  const tab = mapReadyTab(raw);
  const kitchen = kitchenStatusRaw(raw);
  const status = orderStatusRaw(raw);
  const inReadyWorkflow =
    kitchen.includes('ready') ||
    kitchen.includes('prep') ||
    kitchen.includes('new') ||
    kitchen.includes('kot') ||
    kitchen.includes('served') ||
    status.includes('served') ||
    status.includes('completed');
  if (!inReadyWorkflow) return null;

  const lines = mapLines(raw);
  const itemCount =
    asNumber(raw.item_count) || lines.reduce((sum, line) => sum + line.quantity, 0) || lines.length;

  const payment = mapOpenPaymentStatus(raw);

  return {
    id,
    table:
      asString(raw.table_label ?? raw.table_name ?? raw.reference) ||
      asString(raw.order_type, 'Counter'),
    token: asString(raw.token ?? raw.order_number ?? raw.number, `#${id}`),
    itemCount,
    itemSummary: itemsSummary(raw),
    readyAgo: formatAgeLabel(raw),
    priority: asString(raw.priority).includes('high') ? 'high' : 'normal',
    payment: payment === 'paid' ? 'paid' : 'pending',
    tab,
  };
}
