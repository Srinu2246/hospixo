import type {
  PosKitchenBadge,
  PosOrderListItem,
  PosOrderStatus,
  PosOrderType,
} from '@/lib/schemas/pos/point-of-sale/all-orders/posOrdersSchema';

export type OrderType = 'all' | 'dine-in' | 'takeaway' | 'delivery' | 'online';
export type KitchenStatus =
  'kot sent' | 'preparing' | 'ready' | 'served' | 'cancelled' | 'billing' | 'draft';

/** UI row for the All Orders grid (mapped from API list item). */
export interface PosOrderItem {
  id: string;
  orderApiId: number;
  orderNumber: string;
  type: Exclude<OrderType, 'all'>;
  typeLabel: string;
  reference: string;
  tableId: number | null;
  tableName: string | null;
  kitchenStatus: KitchenStatus;
  kitchenStatusLabel: string;
  amount: number;
  amountFormatted: string;
  /** Relative time label for captain mobile cards. */
  elapsedLabel?: string;
}

function formatElapsedLabel(openedAt: string): string | undefined {
  const at = Date.parse(openedAt);
  if (Number.isNaN(at)) return undefined;
  const minutes = Math.max(1, Math.round((Date.now() - at) / 60_000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
}

const ORDER_TYPE_UI: Record<PosOrderType, PosOrderItem['type']> = {
  dine_in: 'dine-in',
  takeaway: 'takeaway',
  delivery: 'delivery',
  online: 'online',
};

const ORDER_TYPE_LABEL: Record<PosOrderItem['type'], string> = {
  'dine-in': 'Dine-in',
  takeaway: 'Takeaway',
  delivery: 'Delivery',
  online: 'Online',
};

const KITCHEN_FROM_BADGE: Record<PosKitchenBadge, { status: KitchenStatus; label: string }> = {
  kot_sent: { status: 'kot sent', label: 'KOT Sent' },
  preparing: { status: 'preparing', label: 'Preparing' },
  ready: { status: 'ready', label: 'Ready' },
  served: { status: 'served', label: 'Served' },
  cancelled: { status: 'cancelled', label: 'Cancelled' },
  draft: { status: 'draft', label: 'Draft' },
  ordering: { status: 'kot sent', label: 'KOT Sent' },
  'kot sent': { status: 'kot sent', label: 'KOT Sent' },
  billing: { status: 'billing', label: 'Billing' },
};

const KITCHEN_FROM_STATUS: Record<PosOrderStatus, { status: KitchenStatus; label: string }> = {
  draft: { status: 'draft', label: 'Draft' },
  open: { status: 'preparing', label: 'Preparing' },
  submitted: { status: 'kot sent', label: 'KOT Sent' },
  completed: { status: 'served', label: 'Served' },
  cancelled: { status: 'cancelled', label: 'Cancelled' },
  voided: { status: 'cancelled', label: 'Voided' },
  ordering: { status: 'kot sent', label: 'KOT Sent' },
  billing: { status: 'billing', label: 'Billing' },
  in_progress: { status: 'preparing', label: 'Preparing' },
  served: { status: 'served', label: 'Served' },
  closed: { status: 'billing', label: 'Billing' },
};

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

/** Map a POS all-orders API item to the All Orders grid row. */
export function toPosOrderItem(item: PosOrderListItem): PosOrderItem {
  const type = ORDER_TYPE_UI[item.order_type];
  const kitchen = item.kitchen_badge
    ? KITCHEN_FROM_BADGE[item.kitchen_badge]
    : KITCHEN_FROM_STATUS[item.status];

  return {
    id: item.public_id || String(item.id),
    orderApiId: item.id,
    orderNumber: item.order_number.startsWith('#') ? item.order_number : `#${item.order_number}`,
    type,
    typeLabel: ORDER_TYPE_LABEL[type],
    reference: item.table_name ? `Table ${item.table_name}` : '—',
    tableId: item.table_id ?? null,
    tableName: item.table_name ?? null,
    kitchenStatus: kitchen.status,
    kitchenStatusLabel: kitchen.label,
    amount: item.grand_total,
    amountFormatted: formatInr(item.grand_total),
    elapsedLabel: formatElapsedLabel(item.opened_at),
  };
}

/** Map API order_type filter from UI tab id. */
export function toApiOrderType(filter: OrderType): string | undefined {
  if (filter === 'all') return undefined;
  if (filter === 'dine-in') return 'dine_in';
  return filter;
}
