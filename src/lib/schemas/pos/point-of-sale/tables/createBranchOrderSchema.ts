import { z } from 'zod';

import { ApiError } from '@/services/api/types';

const nullableText = z.string().nullable().optional();
const nullableNumber = z.number().nullable().optional();

/** POST /v1/branches/{branch_id}/orders */
export const createBranchOrderBodySchema = z.object({
  table_id: z.number().int().positive(),
  order_type: z.literal('dine_in'),
  guest_count: z.number().int().min(1),
  meal_session_id: z.number().int().nonnegative(),
});

export type CreateBranchOrderBody = z.infer<typeof createBranchOrderBodySchema>;

/** Created / full branch order record (create response `data`). */
export const branchOrderSchema = z
  .object({
    id: z.number(),
    public_id: nullableText,
    order_number: nullableText,
    order_type: z.string(),
    branch_id: nullableNumber,
    table_id: nullableNumber,
    table_name: nullableText,
    floor_id: nullableNumber,
    section_id: nullableNumber,
    guest_count: nullableNumber,
    business_date: nullableText,
    meal_session_id: nullableNumber,
    currency: nullableText,
    status: z.string(),
    payment_status: nullableText,
    opened_at: nullableText,
    created_by_user_id: nullableNumber,
    version: nullableNumber,
    subtotal: nullableNumber,
    discount_total: nullableNumber,
    tax_total: nullableNumber,
    cgst_total: nullableNumber,
    sgst_total: nullableNumber,
    igst_total: nullableNumber,
    calculated_total: nullableNumber,
    round_off: nullableNumber,
    grand_total: nullableNumber,
    amount_paid: nullableNumber,
    tip_total: nullableNumber,
    balance_due: nullableNumber,
    invoice_number: nullableText,
    closed_at: nullableText,
    cancellation_reason: nullableText,
    items: z.array(z.unknown()).optional(),
    payments: z.array(z.unknown()).optional(),
  })
  .passthrough();

export type BranchOrder = z.infer<typeof branchOrderSchema>;

export const createBranchOrderEnvelopeSchema = z.object({
  success: z.boolean(),
  data: branchOrderSchema.nullable().optional(),
  message: nullableText,
  request_id: nullableText,
});

export function parseBranchOrder(payload: unknown): BranchOrder {
  const parsed = createBranchOrderEnvelopeSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.success || !parsed.data.data) {
    throw new ApiError('Unexpected create order response', 502);
  }
  return parsed.data.data;
}
