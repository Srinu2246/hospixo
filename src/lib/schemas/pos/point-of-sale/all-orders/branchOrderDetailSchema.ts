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

const branchOrderLineModifierSchema = z.object({
  modifier_group_id: coerceInt.optional(),
  modifier_group_name: nullableText,
  modifier_option_id: coerceInt.optional(),
  modifier_option_name: nullableText,
  price_adjustment: z.coerce.number().optional(),
});

/** Line item on GET order detail and submit `data.order.items`. */
export const branchOrderItemSchema = z
  .object({
    id: coerceInt,
    menu_item_id: coerceInt.optional(),
    branch_menu_item_id: coerceInt.optional(),
    name: z.string().optional(),
    item_name: z.string().optional(),
    variant_name: nullableText,
    quantity: coerceInt.positive(),
    unit_price: z.coerce.number(),
    line_total: z.coerce.number().optional(),
    line_subtotal: z.coerce.number().optional(),
    taxable_amount: z.coerce.number().optional(),
    tax_total: z.coerce.number().optional(),
    category_name: nullableText,
    notes: nullableText,
    /** Legacy mock field */
    status: z.string().optional(),
    /** API field after submit — `draft` until fired to kitchen */
    item_status: z.string().optional(),
    kot_number: nullableText,
    submitted_at: nullableText,
    preparing_at: nullableText,
    ready_at: nullableText,
    completed_at: nullableText,
    preparation_station_id: nullableNumber,
    preparation_station_name: nullableText,
    tags: z.array(z.string()).optional(),
    modifiers: z.array(branchOrderLineModifierSchema).optional(),
  })
  .transform((row) => ({
    ...row,
    name: (row.item_name ?? row.name ?? 'Item').trim(),
  }));

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
  version: nullableNumber,
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
