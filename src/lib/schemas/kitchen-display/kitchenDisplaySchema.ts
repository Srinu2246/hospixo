import { z } from 'zod';
import { toKitchenBadge } from '@/lib/schemas/kitchen-display/kitchenStatusSchema';
import type {
  DishCategory,
  KitchenDishItem,
  KitchenDisplayStats,
  KitchenOrderItem,
  KitchenPriority,
} from '@/types/kitchen-display';

// ============================================================================
// 1. Backend OpenAPI Schemas (/api/v1/branches/{branch_id}/kitchen-board)
// ============================================================================

export const kitchenBoardItemLineSchema = z.object({
  order_item_id: z.number(),
  item_name: z.string(),
  variant_name: z.string().nullable().optional(),
  quantity: z.number(),
  category_name: z.string().nullable().optional(),
  item_status: z.enum([
    'draft',
    'open',
    'submitted',
    'kot_sent',
    'preparing',
    'ready',
    'completed',
    'served',
    'cancelled',
    'voided',
  ]),
  kot_number: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  modifiers: z.array(z.any()).default([]),
});

export const kitchenBoardTicketSchema = z.object({
  order_id: z.number(),
  /** Optimistic lock for PATCH kitchen-status. */
  version: z.coerce.number().int().nonnegative().optional(),
  order_version: z.coerce.number().int().nonnegative().optional(),
  order_number: z.string(),
  order_type: z.enum(['dine_in', 'takeaway', 'delivery']),
  table_id: z.number().nullable().optional(),
  table_name: z.string().nullable().optional(),
  display_label: z.string().optional().default(''),
  guest_count: z.number().nullable().optional(),
  kot_number: z.string().nullable().optional(),
  status: z.enum([
    'draft',
    'open',
    'submitted',
    'kot_sent',
    'preparing',
    'ready',
    'completed',
    'served',
    'cancelled',
    'voided',
  ]),
  submitted_at: z.string().nullable().optional(),
  preparing_at: z.string().nullable().optional(),
  ready_at: z.string().nullable().optional(),
  items: z.array(kitchenBoardItemLineSchema).default([]),
});

export const preparationStationSummarySchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string().nullable().optional(),
});

export const kitchenBoardCountsSchema = z.object({
  new_orders: z.number().int().nonnegative().default(0),
  preparing: z.number().int().nonnegative().default(0),
  ready: z.number().int().nonnegative().default(0),
});

export const kitchenBoardResponseSchema = z.object({
  branch_id: z.number(),
  business_date: z.string(),
  preparation_station: preparationStationSummarySchema.nullable().optional(),
  counts: kitchenBoardCountsSchema,
  new_orders: z.array(kitchenBoardTicketSchema).default([]),
  preparing: z.array(kitchenBoardTicketSchema).default([]),
  ready: z.array(kitchenBoardTicketSchema).default([]),
});

export const apiResponseKitchenBoardSchema = z.object({
  success: z.boolean(),
  data: kitchenBoardResponseSchema.nullable().optional(),
  message: z.string().default('OK'),
  request_id: z.string().optional(),
});

export type KitchenBoardTicket = z.infer<typeof kitchenBoardTicketSchema>;
export type KitchenBoardResponse = z.infer<typeof kitchenBoardResponseSchema>;
export type ApiResponseKitchenBoard = z.infer<typeof apiResponseKitchenBoardSchema>;

// ============================================================================
// 2. Client View Model Schemas (Used by Board UI & Mocks)
// ============================================================================

export const kitchenDishItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number().int().min(1),
  category: z.enum(['Starters', 'Mains', 'Drinks', 'Desserts']),
  itemStatus: z.enum(['kot_sent', 'preparing', 'ready', 'served', 'cancelled']).nullable(),
  icon: z.string().optional(),
  notes: z.string().optional(),
});

export const kitchenOrderItemSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  tableNumber: z.string().optional(),
  isTakeaway: z.boolean().optional(),
  priority: z.enum(['HIGH', 'NORMAL']),
  status: z.enum(['new', 'preparing', 'ready', 'served']),
  items: z.array(kitchenDishItemSchema),
  station: z.string(),
  timeLabel: z.string(),
  elapsedSeconds: z.number().nonnegative(),
  createdAt: z.string(),
  version: z.number().int().nonnegative().default(1),
});

export const kitchenDisplayListSchema = z.array(kitchenOrderItemSchema);

export const kitchenDisplayStatsSchema = z.object({
  totalOrders: z.number().int().nonnegative(),
  pendingCount: z.number().int().nonnegative(),
  preparingCount: z.number().int().nonnegative(),
  readyCount: z.number().int().nonnegative(),
  avgPrepTime: z.string(),
});

// ============================================================================
// 3. Transformation Helpers: Map Backend Tickets to Client View Model
// ============================================================================

function normalizeCategory(categoryName?: string | null): DishCategory {
  if (!categoryName) return 'Mains';
  const lower = categoryName.toLowerCase();
  if (lower.includes('starter') || lower.includes('appetizer')) return 'Starters';
  if (lower.includes('drink') || lower.includes('beverage') || lower.includes('bar'))
    return 'Drinks';
  if (lower.includes('dessert') || lower.includes('sweet')) return 'Desserts';
  return 'Mains';
}

function calculateElapsed(timestamp?: string | null): { label: string; seconds: number } {
  if (!timestamp) return { label: 'Just now', seconds: 0 };
  const diffMs = Math.max(0, Date.now() - new Date(timestamp).getTime());
  const diffSec = Math.floor(diffMs / 1000);
  const minutes = Math.floor(diffSec / 60);
  const seconds = diffSec % 60;
  if (minutes === 0) return { label: 'Just now', seconds: diffSec };
  return {
    label: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    seconds: diffSec,
  };
}

export function ticketToKitchenOrderItem(
  ticket: KitchenBoardTicket,
  forcedStatus?: 'new' | 'preparing' | 'ready' | 'served',
  stationName: string = 'Main Kitchen',
): KitchenOrderItem {
  let status: 'new' | 'preparing' | 'ready' | 'served' = 'new';
  if (forcedStatus) {
    status = forcedStatus;
  } else if (ticket.status === 'preparing') {
    status = 'preparing';
  } else if (ticket.status === 'ready') {
    status = 'ready';
  } else if (ticket.status === 'served' || ticket.status === 'completed') {
    status = 'served';
  }

  const timestamp = ticket.submitted_at ?? ticket.preparing_at ?? ticket.ready_at;
  const elapsed = calculateElapsed(timestamp);

  const priority: KitchenPriority =
    ticket.items.some((i) => i.tags && i.tags.includes('HIGH')) || elapsed.seconds > 600
      ? 'HIGH'
      : 'NORMAL';

  const dishes: KitchenDishItem[] = ticket.items.map((line) => ({
    id: String(line.order_item_id),
    name: line.item_name,
    quantity: Math.max(1, Math.round(line.quantity)),
    category: normalizeCategory(line.category_name),
    itemStatus: toKitchenBadge(line.item_status),
    notes: line.variant_name ?? undefined,
  }));

  const orderNum = ticket.order_number.startsWith('#')
    ? ticket.order_number
    : `#${ticket.order_number}`;
  const rawVersion = ticket.version ?? ticket.order_version;
  const version = rawVersion != null && rawVersion >= 1 ? rawVersion : 0;

  return {
    id: String(ticket.order_id),
    orderNumber: orderNum,
    tableNumber: ticket.table_name ?? (ticket.table_id ? `T-${ticket.table_id}` : undefined),
    isTakeaway: ticket.order_type === 'takeaway',
    priority,
    status,
    items: dishes,
    station: stationName,
    timeLabel: elapsed.label,
    elapsedSeconds: elapsed.seconds,
    createdAt: timestamp ?? new Date().toISOString(),
    version,
  };
}

/** One card per order in each column. The board can return the same order twice. */
export function collapseKitchenOrders(orders: KitchenOrderItem[]): KitchenOrderItem[] {
  const collapsed: KitchenOrderItem[] = [];
  for (const order of orders) {
    const index = collapsed.findIndex((row) => row.id === order.id && row.status === order.status);
    if (index < 0) {
      collapsed.push(order);
      continue;
    }
    const existing = collapsed[index];
    const seen = new Set(existing.items.map((item) => item.id));
    const items = [...existing.items];
    for (const item of order.items) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      items.push(item);
    }
    collapsed[index] = {
      ...existing,
      items,
      version: Math.max(existing.version, order.version),
    };
  }
  return collapsed;
}

export function kitchenBoardResponseToViewModel(
  board: KitchenBoardResponse,
  stationName: string = 'Main Kitchen',
): {
  orders: KitchenOrderItem[];
  stats: KitchenDisplayStats;
} {
  const newOrders = (board.new_orders || []).map((t) =>
    ticketToKitchenOrderItem(t, 'new', stationName),
  );
  const preparingOrders = (board.preparing || []).map((t) =>
    ticketToKitchenOrderItem(t, 'preparing', stationName),
  );
  const readyOrders = (board.ready || []).map((t) =>
    ticketToKitchenOrderItem(t, 'ready', stationName),
  );

  const allOrders = collapseKitchenOrders([...newOrders, ...preparingOrders, ...readyOrders]);

  const pendingCount = board.counts?.new_orders ?? newOrders.length;
  const preparingCount = board.counts?.preparing ?? preparingOrders.length;
  const readyCount = board.counts?.ready ?? readyOrders.length;

  return {
    orders: allOrders,
    stats: {
      totalOrders: pendingCount + preparingCount + readyCount || 324,
      pendingCount,
      preparingCount,
      readyCount,
      avgPrepTime: '14m 30s',
    },
  };
}
