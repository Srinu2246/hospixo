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

/** API order lifecycle status. */
export const posOrderStatusSchema = z.enum([
  'draft',
  'ordering',
  'billing',
  'in_progress',
  'served',
  'open',
  'closed',
]);

/** Kitchen badge shown on the list (nullable when not set). */
export const posKitchenBadgeSchema = z.enum([
  'draft',
  'ordering',
  'kot sent',
  'preparing',
  'ready',
  'billing',
]);

/** Payment status on the list. */
export const posPaymentStatusSchema = z.enum(['pending', 'billing', 'paid', 'partial']);

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
  })
  .refine((item) => item.order_type !== 'dine_in' || (item.table_id != null && item.table_id > 0), {
    message: 'dine_in orders require table_id',
    path: ['table_id'],
  });

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
export type PosOrderListItem = z.infer<typeof posOrderListItemSchema>;
export type PosOrderListData = z.infer<typeof posOrderListDataSchema>;
export type PosOrderListEnvelope = z.infer<typeof posOrderListEnvelopeSchema>;

/** Parse GET branch orders list envelope. Rejects non-contract shapes. */
export function parsePosOrderList(payload: unknown): PosOrderListData {
  const parsed = posOrderListEnvelopeSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.success) {
    throw new ApiError('Unexpected all-orders response', 502);
  }
  return parsed.data.data;
}
