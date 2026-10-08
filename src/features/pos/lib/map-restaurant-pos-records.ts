import type { DuePayment, DuePaymentStatus } from '@/features/pos/config/due-payments';
import type { KitchenOrder, KitchenOrderStatus } from '@/features/kitchen/types';
import type { RestaurantOrderRecord } from '@/lib/api/restaurant-branch-pos';

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function mapDueStatus(raw: Record<string, unknown>): DuePaymentStatus {
  const status = asString(raw.status ?? raw.payment_status).toLowerCase();
  if (status.includes('paid')) return 'paid';
  if (status.includes('overdue')) return 'overdue';
  return 'pending';
}

export function mapDuePaymentRecord(record: RestaurantOrderRecord): DuePayment | null {
  const raw = record as Record<string, unknown>;
  const id = asString(raw.id ?? raw.payment_id ?? raw.order_id);
  if (!id) return null;

  const amount =
    asNumber(raw.amount_due) ||
    asNumber(raw.due_amount) ||
    asNumber(raw.balance_due) ||
    asNumber(raw.total) ||
    asNumber(raw.amount);

  return {
    id,
    guestName:
      asString(raw.guest_name) ||
      asString(raw.customer_name) ||
      asString(raw.payer_name) ||
      'Guest',
    guestId: asString(raw.guest_id ?? raw.customer_id ?? raw.reference_id, id),
    dueDate:
      asString(raw.due_date) ||
      asString(raw.due_at) ||
      asString(raw.created_at)?.slice(0, 10) ||
      '—',
    amount,
    status: mapDueStatus(raw),
  };
}

function mapKitchenStatus(raw: Record<string, unknown>): KitchenOrderStatus {
  const status = asString(raw.kitchen_status ?? raw.status).toLowerCase();
  if (status.includes('prep')) return 'preparing';
  if (status.includes('ready')) return 'ready';
  return 'new';
}

export function mapKitchenOrderRecord(record: RestaurantOrderRecord): KitchenOrder | null {
  const raw = record as Record<string, unknown>;
  const id = asString(raw.id ?? raw.order_id ?? raw.kitchen_order_id);
  if (!id) return null;

  const itemsRaw = Array.isArray(raw.items)
    ? raw.items
    : Array.isArray(raw.line_items)
      ? raw.line_items
      : [];

  const items = itemsRaw
    .map((entry, index) => {
      const line = entry as Record<string, unknown>;
      const lineId = asString(line.id ?? line.line_id, `${id}-${index}`);
      const name = asString(line.name ?? line.item_name, 'Item');
      const quantity = asNumber(line.quantity, 1);
      return {
        id: lineId,
        name,
        quantity,
        category: 'other' as const,
        notes: asString(line.notes ?? line.special_instructions) || undefined,
      };
    })
    .filter((line) => line.name);

  return {
    id,
    number: asString(raw.order_number ?? raw.number, id),
    status: mapKitchenStatus(raw),
    priority: asString(raw.priority).includes('high') ? 'high' : 'normal',
    channel: 'dine_in',
    tableLabel: asString(raw.table_label ?? raw.table_name ?? raw.reference) || undefined,
    stationId: asString(raw.station_id ?? raw.kitchen_station_id, 'main'),
    items,
    placedAt: asString(raw.placed_at ?? raw.created_at, new Date().toISOString()),
    elapsedLabel: asString(raw.elapsed_label ?? raw.age) || undefined,
  };
}
