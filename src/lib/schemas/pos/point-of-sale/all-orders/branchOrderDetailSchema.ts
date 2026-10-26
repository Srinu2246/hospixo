import { z } from 'zod';

import {
  posKitchenBadgeSchema,
  posOrderStatusSchema,
  posOrderTypeSchema,
  posPaymentStatusSchema,
} from '@/lib/schemas/pos/point-of-sale/all-orders/posOrdersSchema';
import { ApiError } from '@/services/api/types';

const nullableText = z.string().nullable().optional();
const nullableNumber = z.number().nullable().optional();
const coerceInt = z.coerce.number().int();

/** Line item on GET /v1/branches/{branch_id}/orders/{order_id}. */
export const branchOrderItemSchema = z.object({
  id: coerceInt,
  menu_item_id: coerceInt.optional(),
  branch_menu_item_id: coerceInt.optional(),
  name: z.string().min(1),
  quantity: coerceInt.positive(),
  unit_price: z.coerce.number(),
  line_total: z.coerce.number().optional(),
  notes: nullableText,
  status: z.string().optional(),
});

export type BranchOrderItem = z.infer<typeof branchOrderItemSchema>;

/** Full order from GET /v1/branches/{branch_id}/orders/{order_id}. */
export const branchOrderDetailSchema = z.object({
  id: coerceInt.positive(),
  public_id: nullableText,
  order_number: nullableText,
  order_type: posOrderTypeSchema,
  branch_id: nullableNumber,
  table_id: nullableNumber,
  table_name: nullableText,
  floor_id: nullableNumber,
  section_id: nullableNumber,
  guest_count: nullableNumber,
  status: posOrderStatusSchema,
  kitchen_badge: posKitchenBadgeSchema.nullable().optional(),
  payment_status: posPaymentStatusSchema.nullable().optional(),
  grand_total: z.coerce.number().optional(),
  subtotal: z.coerce.number().optional(),
  opened_at: nullableText,
  items: z.array(branchOrderItemSchema).default([]),
});

export type BranchOrderDetail = z.infer<typeof branchOrderDetailSchema>;

export const branchOrderDetailEnvelopeSchema = z.object({
  success: z.boolean(),
  data: branchOrderDetailSchema.nullable().optional(),
  message: nullableText,
  request_id: nullableText,
});

/** Parse GET branch order detail envelope. */
export function parseBranchOrderDetail(payload: unknown): BranchOrderDetail {
  const parsed = branchOrderDetailEnvelopeSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.success || !parsed.data.data) {
    throw new ApiError('Unexpected order detail response', 502);
  }
  return parsed.data.data;
}
