import type { PosOrderListItem } from '@/lib/schemas/pos/point-of-sale/all-orders/posOrdersSchema';

export type OrderType = 'all' | 'dine-in' | 'takeaway' | 'delivery' | 'online';
export type KitchenStatus = 'kot sent' | 'ready' | 'preparing' | 'billing' | 'draft';

/** UI row for the All Orders grid (mapped from API list item). */
export interface PosOrderItem {
  id: string; // Unique row identifier (public_id or id)
  orderNumber: string; // Formatted order number (e.g. #0001)
  type: 'dine-in' | 'takeaway' | 'delivery' | 'online'; // Order type
  typeLabel: string; // Display type label
  reference: string; // Table number or delivery partner (e.g. Table T002)
  kitchenStatus: KitchenStatus; // Kitchen status key
  kitchenStatusLabel: string; // Display kitchen status label
  amount: number; // Order amount in INR
  amountFormatted: string; // Formatted amount string (e.g. ₹0)
}

const ORDER_TYPE_UI: Record<string, PosOrderItem['type']> = {
  dine_in: 'dine-in',
  'dine-in': 'dine-in',
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

const KITCHEN_STATUS_MAP: Record<string, { status: KitchenStatus; label: string }> = {
  draft: { status: 'draft', label: 'Draft' },
  ordering: { status: 'kot sent', label: 'KOT Sent' },
  'kot sent': { status: 'kot sent', label: 'KOT Sent' },
  kot: { status: 'kot sent', label: 'KOT Sent' },
  preparing: { status: 'preparing', label: 'Preparing' },
  ready: { status: 'ready', label: 'Ready' },
  billing: { status: 'billing', label: 'Billing' },
  served: { status: 'ready', label: 'Ready' },
  in_progress: { status: 'preparing', label: 'Preparing' },
};

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function resolveKitchenStatus(item: PosOrderListItem): {
  kitchenStatus: KitchenStatus;
  kitchenStatusLabel: string;
} {
  const raw = (item.kitchen_badge ?? item.status ?? 'draft').toLowerCase().replace(/_/g, ' ');
  const mapped = KITCHEN_STATUS_MAP[raw];
  if (mapped) return { kitchenStatus: mapped.status, kitchenStatusLabel: mapped.label };
  return {
    kitchenStatus: 'draft',
    kitchenStatusLabel: raw.replace(/\b\w/g, (c) => c.toUpperCase()) || 'Draft',
  };
}

/** Map a POS all-orders API item to the All Orders grid row. */
export function toPosOrderItem(item: PosOrderListItem): PosOrderItem {
  const type = ORDER_TYPE_UI[item.order_type] ?? 'dine-in';
  const { kitchenStatus, kitchenStatusLabel } = resolveKitchenStatus(item);
  const reference = item.table_name ? `Table ${item.table_name}` : '—';

  return {
    id: item.public_id || String(item.id),
    orderNumber: item.order_number.startsWith('#') ? item.order_number : `#${item.order_number}`,
    type,
    typeLabel: ORDER_TYPE_LABEL[type],
    reference,
    kitchenStatus,
    kitchenStatusLabel,
    amount: item.grand_total,
    amountFormatted: formatInr(item.grand_total),
  };
}

/** Map API order_type filter from UI tab id. */
export function toApiOrderType(filter: OrderType): string | undefined {
  if (filter === 'all') return undefined;
  if (filter === 'dine-in') return 'dine_in';
  return filter;
}
