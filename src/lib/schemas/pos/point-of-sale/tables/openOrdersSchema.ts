import { z } from 'zod';

import type { PosTableItem, PosTableStatus } from '@/lib/mocks/pos/usePosTables.mocks';
import { ApiError } from '@/services/api/types';

const nullableText = z.string().nullable().optional();
const nullableNumber = z.number().nullable().optional();

/** One row from GET /v1/branches/{branch_id}/orders?status=open */
export const openOrderSchema = z.object({
  id: z.number(),
  public_id: nullableText,
  order_number: nullableText,
  order_type: z.string(),
  table_id: nullableNumber,
  table_name: nullableText,
  floor_id: nullableNumber,
  section_id: nullableNumber,
  guest_count: nullableNumber,
  status: z.string(),
  kitchen_badge: nullableText,
  payment_status: nullableText,
  grand_total: nullableNumber,
  opened_at: nullableText,
});

export const openOrderListDataSchema = z.object({
  items: z.array(openOrderSchema).default([]),
  total: z.number().optional(),
  page: z.number().optional(),
  page_size: z.number().optional(),
});

export const openOrderListEnvelopeSchema = z.object({
  success: z.boolean(),
  data: openOrderListDataSchema,
  message: nullableText,
  request_id: nullableText,
});

export type OpenOrder = z.infer<typeof openOrderSchema>;

export type SectionTableRow = {
  id: number;
  name: string;
  status: string;
  capacity?: number | null;
  archived_at?: string | null;
};

export function parseOpenOrders(payload: unknown): OpenOrder[] {
  const parsed = openOrderListEnvelopeSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.success) {
    throw new ApiError('Unexpected open orders response', 502);
  }
  return parsed.data.data.items;
}

function mapOrderStatus(order: OpenOrder): PosTableStatus {
  const payment = order.payment_status?.toLowerCase() ?? '';
  const status = order.status.toLowerCase();
  const kitchen = order.kitchen_badge?.toLowerCase() ?? '';

  if (status === 'cleaning' || kitchen === 'cleaning') return 'cleaning';
  if (payment === 'billing' || payment === 'partial' || status === 'billing') return 'billing';
  if (status === 'reserved' || kitchen === 'reserved' || payment === 'reserved') return 'reserved';
  return 'occupied';
}

function formatAmount(grandTotal: number | null | undefined): string | undefined {
  if (grandTotal == null || grandTotal <= 0) return undefined;
  return `Rs.${grandTotal.toLocaleString('en-IN')}`;
}

function orderToTableItem(
  order: OpenOrder,
  floorId: number,
  sectionId: number,
): PosTableItem | null {
  if (order.table_id == null) return null;
  const status = mapOrderStatus(order);
  return {
    id: String(order.table_id),
    name: order.table_name?.trim() || `Table ${order.table_id}`,
    floorId: String(order.floor_id ?? floorId),
    sectionId: String(order.section_id ?? sectionId),
    status,
    amount: formatAmount(order.grand_total),
    guests: order.guest_count ?? undefined,
    message: order.order_number ? `Order ${order.order_number}` : undefined,
  };
}

/**
 * Catalog tables stay available. An open dine-in order on the same table replaces status,
 * guests, and amount.
 */
export function mergeSectionTablesWithOpenOrders(
  tables: readonly SectionTableRow[],
  orders: readonly OpenOrder[],
  floorId: number,
  sectionId: number,
): PosTableItem[] {
  const ordersByTable = new Map<number, OpenOrder>();
  for (const order of orders) {
    if (order.table_id != null && !ordersByTable.has(order.table_id)) {
      ordersByTable.set(order.table_id, order);
    }
  }

  const cards: PosTableItem[] = [];
  const seen = new Set<number>();

  for (const table of tables) {
    if (table.archived_at || table.status.toLowerCase() === 'inactive') continue;
    seen.add(table.id);
    const order = ordersByTable.get(table.id);
    const capacity = table.capacity ?? undefined;
    if (!order) {
      cards.push({
        id: String(table.id),
        name: table.name,
        floorId: String(floorId),
        sectionId: String(sectionId),
        status: 'available',
        capacity,
        message: 'Tap to open',
      });
      continue;
    }
    const card = orderToTableItem(order, floorId, sectionId);
    if (card) cards.push({ ...card, name: table.name, capacity });
  }

  for (const [tableId, order] of ordersByTable) {
    if (seen.has(tableId)) continue;
    const card = orderToTableItem(order, floorId, sectionId);
    if (card) cards.push(card);
  }

  return cards;
}
