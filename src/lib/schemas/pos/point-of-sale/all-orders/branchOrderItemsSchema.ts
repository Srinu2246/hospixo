import { z } from 'zod';

import { parseBranchOrderDetail } from '@/lib/schemas/pos/point-of-sale/all-orders/branchOrderDetailSchema';
import { parseBranchOrder } from '@/lib/schemas/pos/point-of-sale/tables/createBranchOrderSchema';
import { ApiError } from '@/services/api/types';

const coerceInt = z.coerce.number().int();
const nullableText = z.string().nullable().optional();

export const branchOrderItemModifierSelectionSchema = z.object({
  modifier_group_id: coerceInt.positive(),
  modifier_option_ids: z.array(coerceInt.positive()).default([]),
});

/** One line on POST /v1/branches/{branch_id}/orders/{order_id}/items */
export const addBranchOrderItemLineSchema = z.object({
  branch_menu_item_id: coerceInt.positive(),
  menu_item_variant_id: coerceInt.positive().optional(),
  preparation_station_id: coerceInt.positive().optional(),
  modifier_selections: z.array(branchOrderItemModifierSelectionSchema).default([]),
  quantity: coerceInt.positive(),
  tags: z.array(z.string()).default([]),
});

/** POST /v1/branches/{branch_id}/orders/{order_id}/items */
export const addBranchOrderItemsBodySchema = z.object({
  expected_version: coerceInt.positive().default(1),
  branch_menu_id: coerceInt.positive(),
  items: z.array(addBranchOrderItemLineSchema).min(1),
});

export type AddBranchOrderItemsBody = z.infer<typeof addBranchOrderItemsBodySchema>;
export type AddBranchOrderItemLine = z.infer<typeof addBranchOrderItemLineSchema>;

const successEnvelopeSchema = z.object({
  success: z.boolean(),
  data: z.unknown().nullable().optional(),
  message: nullableText,
  request_id: nullableText,
});

/** Parse add-items response — prefer order detail, else generic success. */
export function parseAddBranchOrderItems(payload: unknown) {
  try {
    return parseBranchOrderDetail(payload);
  } catch {
    const envelope = successEnvelopeSchema.safeParse(payload);
    if (envelope.success && envelope.data.success) {
      return envelope.data.data ?? null;
    }
    throw new ApiError('Unexpected add order items response', 502);
  }
}

/** Parse submit response — prefer order record, else generic success. */
export function parseSubmitBranchOrder(payload: unknown) {
  try {
    return parseBranchOrder(payload);
  } catch {
    try {
      return parseBranchOrderDetail(payload);
    } catch {
      const envelope = successEnvelopeSchema.safeParse(payload);
      if (envelope.success && envelope.data.success) {
        return envelope.data.data ?? null;
      }
      throw new ApiError('Unexpected submit order response', 502);
    }
  }
}
