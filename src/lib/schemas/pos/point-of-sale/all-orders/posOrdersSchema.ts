import { z } from 'zod';

import { ApiError } from '@/services/api/types';

const nullableText = z.string().nullable().optional();
const nullableNumber = z.number().nullable().optional();

/** Single order row from GET branch/POS all-orders list. */
export const posOrderListItemSchema = z.object({
  id: z.number().int(),
  public_id: z.string().min(1),
  order_number: z.string().min(1),
  order_type: z.string().min(1),
  table_id: nullableNumber,
  table_name: nullableText,
  floor_id: nullableNumber,
  section_id: nullableNumber,
  guest_count: nullableNumber,
  status: z.string().min(1),
  kitchen_badge: nullableText,
  payment_status: nullableText,
  grand_total: z.number(),
  opened_at: z.string().min(1),
});

export const posOrderListDataSchema = z.object({
  items: z.array(posOrderListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  page_size: z.number().int().positive(),
});

export const posOrderListEnvelopeSchema = z.object({
  success: z.boolean(),
  data: posOrderListDataSchema,
  message: nullableText,
  request_id: nullableText,
});

export type PosOrderListItem = z.infer<typeof posOrderListItemSchema>;
export type PosOrderListData = z.infer<typeof posOrderListDataSchema>;
export type PosOrderListEnvelope = z.infer<typeof posOrderListEnvelopeSchema>;

export function parsePosOrderList(payload: unknown): PosOrderListData {
  const parsed = posOrderListEnvelopeSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.success) {
    throw new ApiError('Unexpected all-orders response', 502);
  }
  return parsed.data.data;
}
