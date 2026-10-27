import { z } from 'zod';

import { parseBranchOrderDetail } from '@/lib/schemas/pos/point-of-sale/all-orders/branchOrderDetailSchema';
import {
  branchOrderSchema,
  parseBranchOrder,
} from '@/lib/schemas/pos/point-of-sale/tables/createBranchOrderSchema';
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
  expected_version: z.number().int().nonnegative(),
  branch_menu_id: coerceInt.positive(),
  items: z.array(addBranchOrderItemLineSchema).min(1),
});

export type AddBranchOrderItemsBody = z.infer<typeof addBranchOrderItemsBodySchema>;
export type AddBranchOrderItemLine = z.infer<typeof addBranchOrderItemLineSchema>;

export const addBranchOrderItemsDataSchema = z.object({
  order_id: coerceInt.nonnegative().optional(),
  expected_version: coerceInt.nonnegative().optional(),
  order: branchOrderSchema.optional(),
});

export type AddBranchOrderItemsData = z.infer<typeof addBranchOrderItemsDataSchema>;

/** POST /v1/branches/{branch_id}/orders/{order_id}/submit */
export const submitBranchOrderBodySchema = z.object({
  expected_version: z.number().int().nonnegative(),
});

export type SubmitBranchOrderBody = z.infer<typeof submitBranchOrderBodySchema>;

export const submitBranchOrderDataSchema = z.object({
  order_id: coerceInt.nonnegative().optional(),
  expected_version: coerceInt.nonnegative().optional(),
  order: branchOrderSchema.optional(),
  kot_number: z.string().nullable().optional(),
  submitted_item_count: coerceInt.nonnegative().optional(),
});

export type SubmitBranchOrderData = z.infer<typeof submitBranchOrderDataSchema>;

const successEnvelopeSchema = z.object({
  success: z.boolean(),
  data: z.unknown().nullable().optional(),
  message: nullableText,
  request_id: nullableText,
});

function normalizeOrderWritePayload(data: unknown): AddBranchOrderItemsData | null {
  const dataParsed = addBranchOrderItemsDataSchema.safeParse(data);
  if (dataParsed.success) {
    return dataParsed.data;
  }
  try {
    const order = branchOrderSchema.parse(data);
    return { order_id: order.id, expected_version: order.version ?? undefined, order };
  } catch {
    return null;
  }
}

/** Parse POST/DELETE …/items response (`data.order` with draft lines). */
export function parseAddBranchOrderItems(payload: unknown): AddBranchOrderItemsData | null {
  const envelope = successEnvelopeSchema.safeParse(payload);
  if (envelope.success && envelope.data.success) {
    const normalized = normalizeOrderWritePayload(envelope.data.data);
    if (normalized) return normalized;
    return null;
  }

  try {
    const detail = parseBranchOrderDetail(payload);
    return { order: branchOrderSchema.parse(detail) };
  } catch {
    throw new ApiError('Unexpected add order items response', 502);
  }
}

/** Parse DELETE …/items/{item_id} response (same envelope as add items). */
/** DELETE item responses match POST add-items envelope. */
export function parseRemoveBranchOrderItem(payload: unknown): AddBranchOrderItemsData | null {
  return parseAddBranchOrderItems(payload);
}

function normalizeSubmitOrderPayload(data: unknown): SubmitBranchOrderData | null {
  const dataParsed = submitBranchOrderDataSchema.safeParse(data);
  if (dataParsed.success) {
    return dataParsed.data;
  }
  if (data && typeof data === 'object' && 'order' in data) {
    const wrapped = submitBranchOrderDataSchema.safeParse(data);
    if (wrapped.success) return wrapped.data;
  }
  try {
    const order = branchOrderSchema.parse(data);
    return { order_id: order.id, expected_version: order.version ?? undefined, order };
  } catch {
    return null;
  }
}

/** Parse submit response — supports nested `data.order` (Captain submit / KOT). */
export function parseSubmitBranchOrder(payload: unknown): SubmitBranchOrderData | null {
  const envelope = successEnvelopeSchema.safeParse(payload);
  if (envelope.success && envelope.data.success) {
    const normalized = normalizeSubmitOrderPayload(envelope.data.data);
    if (normalized) return normalized;
    return null;
  }

  try {
    const order = parseBranchOrder(payload);
    return { order };
  } catch {
    try {
      const detail = parseBranchOrderDetail(payload);
      return { order: branchOrderSchema.parse(detail) };
    } catch {
      throw new ApiError('Unexpected submit order response', 502);
    }
  }
}
