import { z } from 'zod';

import { ApiError } from '@/services/api/types';

const nullableText = z.string().nullable().optional();
const coerceInt = z.coerce.number().int();
const nullableInt = z.preprocess(
  (value) => (value === null || value === undefined || value === '' ? null : value),
  coerceInt.nullable().optional(),
);

/** API order_type values for branch POS orders list. */
export const posOrderTypeSchema = z.enum(['dine_in', 'takeaway', 'delivery', 'online']);

/** API order lifecycle status (GET /v1/branches/{branch_id}/orders `status` filter + row `status`). */
export const posOrderStatusSchema = z.enum([
  'draft',
  'open',
  'submitted',
  'completed',
  'cancelled',
  'voided',
  /** Legacy / client-only values still seen in older payloads. */
  'ordering',
  'billing',
  'in_progress',
  'served',
  'closed',
]);

/**
 * Kitchen badge. Canonical values match the backend `KitchenBadge` enum.
 * Legacy list values stay so older payloads still parse.
 */
export const posKitchenBadgeSchema = z.enum([
  'kot_sent',
  'preparing',
  'ready',
  'served',
  'cancelled',
  'draft',
  'ordering',
  'kot sent',
  'billing',
]);

/** Payment status on the list. */
export const posPaymentStatusSchema = z.enum([
  'pending',
  'billing',
  'paid',
  'partial',
  'partially_paid',
  'failed',
]);

export const posOrderListLineSchema = z.object({
  name: z.string().min(1),
  quantity: coerceInt.positive(),
  kitchenStatus: z.string().optional(),
  submittedAt: nullableText,
  preparingAt: nullableText,
  readyAt: nullableText,
  completedAt: nullableText,
  tags: z.array(z.string()).optional(),
});

/** Single order row from GET branch/POS all-orders list. */
export const posOrderListItemSchema = z
  .object({
    id: coerceInt.positive(),
    public_id: z.string().min(1),
    order_number: z.string().min(1),
    order_type: posOrderTypeSchema,
    table_id: nullableInt,
    table_name: nullableText,
    floor_id: nullableInt,
    section_id: nullableInt,
    guest_count: nullableInt,
    status: posOrderStatusSchema,
    kitchen_badge: posKitchenBadgeSchema.nullable().optional(),
    payment_status: posPaymentStatusSchema.nullable().optional(),
    grand_total: z.coerce.number(),
    opened_at: z.string().min(1),
    closed_at: nullableText,
    version: nullableInt,
    /** Cart lines when the list API embeds `items`. */
    listLines: z.array(posOrderListLineSchema).optional(),
  })
  .refine((item) => item.order_type !== 'dine_in' || (item.table_id != null && item.table_id > 0), {
    message: 'dine_in orders require table_id',
    path: ['table_id'],
  });

const branchOrdersListTableSchema = z.object({
  id: coerceInt,
  name: nullableText,
  floor_id: nullableInt,
  section_id: nullableInt,
});

const branchOrdersListTotalsSchema = z.object({
  grand_total: z.coerce.number(),
});

const branchOrdersListLineKitchenSchema = z.object({
  status: z.string().optional(),
  kot_number: nullableText,
  submitted_at: nullableText,
  preparing_at: nullableText,
  ready_at: nullableText,
  completed_at: nullableText,
  preparation_station_id: nullableInt,
  preparation_station_name: nullableText,
});

const branchOrdersListLineSchema = z.object({
  id: coerceInt,
  item_name: z.string().min(1),
  quantity: coerceInt.positive(),
  tags: z.array(z.string()).optional(),
  pricing: z
    .object({
      unit_price: z.coerce.number().optional(),
      line_total: z.coerce.number().optional(),
    })
    .optional(),
  kitchen: branchOrdersListLineKitchenSchema.optional(),
});

/** Live GET /v1/branches/{branch_id}/orders row (`data.orders[]`). */
const branchOrdersListRowSchema = z.object({
  id: coerceInt.positive(),
  public_id: z.string().min(1),
  order_number: z.string().min(1),
  order_type: posOrderTypeSchema,
  status: posOrderStatusSchema,
  kitchen_badge: posKitchenBadgeSchema.nullable().optional(),
  payment_status: posPaymentStatusSchema.nullable().optional(),
  guest_count: nullableInt,
  version: nullableInt,
  opened_at: z.string().min(1),
  closed_at: nullableText,
  table: branchOrdersListTableSchema.optional(),
  table_id: nullableInt,
  table_name: nullableText,
  floor_id: nullableInt,
  section_id: nullableInt,
  totals: branchOrdersListTotalsSchema.optional(),
  grand_total: z.coerce.number().optional(),
  items: z.array(branchOrdersListLineSchema).default([]),
});

const branchOrdersListPaginationSchema = z.object({
  total: z.coerce.number().int().nonnegative(),
  page: z.coerce.number().int().positive(),
  page_size: z.coerce.number().int().positive(),
});

const branchOrdersListDataSchema = z.object({
  orders: z.array(branchOrdersListRowSchema),
  pagination: branchOrdersListPaginationSchema,
});

const branchOrdersListEnvelopeSchema = z.object({
  success: z.boolean(),
  data: branchOrdersListDataSchema,
  message: nullableText,
  request_id: nullableText,
});

function normalizeBranchOrdersListRow(
  row: z.infer<typeof branchOrdersListRowSchema>,
): z.infer<typeof posOrderListItemSchema> {
  const tableId = row.table?.id ?? row.table_id ?? null;
  const tableName = row.table?.name ?? row.table_name ?? null;
  return {
    id: row.id,
    public_id: row.public_id,
    order_number: row.order_number,
    order_type: row.order_type,
    table_id: tableId,
    table_name: tableName,
    floor_id: row.table?.floor_id ?? row.floor_id ?? null,
    section_id: row.table?.section_id ?? row.section_id ?? null,
    guest_count: row.guest_count ?? null,
    status: row.status,
    kitchen_badge: row.kitchen_badge ?? null,
    payment_status: row.payment_status ?? null,
    grand_total: row.totals?.grand_total ?? row.grand_total ?? 0,
    opened_at: row.opened_at,
    closed_at: row.closed_at ?? null,
    version: row.version ?? null,
    listLines: row.items.map((line) => ({
      name: line.item_name,
      quantity: line.quantity,
      kitchenStatus: line.kitchen?.status,
      submittedAt: line.kitchen?.submitted_at ?? null,
      preparingAt: line.kitchen?.preparing_at ?? null,
      readyAt: line.kitchen?.ready_at ?? null,
      completedAt: line.kitchen?.completed_at ?? null,
      tags: line.tags,
    })),
  };
}

export type BranchOrdersListQuery = {
  status?: 'all' | 'open' | 'draft' | 'submitted' | 'completed' | 'cancelled' | 'voided';
  kitchen_badge?: 'all' | 'preparing' | 'ready';
  order_type?: 'dine_in' | 'takeaway' | 'delivery' | 'online';
  page?: number;
  page_size?: number;
  search?: string;
};

export const posOrderListDataSchema = z.object({
  items: z.array(posOrderListItemSchema),
  total: z.coerce.number().int().nonnegative(),
  page: z.coerce.number().int().positive(),
  page_size: z.coerce.number().int().positive(),
});

export const posOrderListEnvelopeSchema = z.object({
  success: z.boolean(),
  data: posOrderListDataSchema,
  message: nullableText,
  request_id: nullableText,
});

export type PosOrderType = z.infer<typeof posOrderTypeSchema>;
export type PosOrderStatus = z.infer<typeof posOrderStatusSchema>;
export type PosKitchenBadge = z.infer<typeof posKitchenBadgeSchema>;
export type PosOrderListLine = z.infer<typeof posOrderListLineSchema>;
export type PosOrderListItem = z.infer<typeof posOrderListItemSchema>;
export type PosOrderListData = z.infer<typeof posOrderListDataSchema>;
export type PosOrderListEnvelope = z.infer<typeof posOrderListEnvelopeSchema>;

/** Parse GET branch orders list envelope. Rejects non-contract shapes. */
export function parsePosOrderList(payload: unknown): PosOrderListData {
  const legacy = posOrderListEnvelopeSchema.safeParse(payload);
  if (legacy.success && legacy.data.success) {
    return legacy.data.data;
  }

  const modern = branchOrdersListEnvelopeSchema.safeParse(payload);
  if (modern.success && modern.data.success) {
    const { orders, pagination } = modern.data.data;
    return {
      items: orders.map((row) => posOrderListItemSchema.parse(normalizeBranchOrdersListRow(row))),
      total: pagination.total,
      page: pagination.page,
      page_size: pagination.page_size,
    };
  }

  throw new ApiError('Unexpected all-orders response', 502);
}
