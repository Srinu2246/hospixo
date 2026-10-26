import { z } from 'zod';

import { ApiError } from '@/services/api/types';

const nullableText = z.string().nullable().optional();

export const cashCounterStatusSchema = z.enum(['active', 'inactive']);

/** Single cash counter row (list / detail). */
export const cashCounterSchema = z.object({
  id: z.number().int(),
  branch_id: z.number().int(),
  name: z.string().min(1),
  status: cashCounterStatusSchema,
  open_shift_id: z.number().int().nullable(),
});

/** GET list envelope — `{ success, data: CashCounter[], message, request_id }`. */
export const cashCounterListEnvelopeSchema = z.object({
  success: z.boolean(),
  data: z.array(cashCounterSchema),
  message: nullableText,
  request_id: nullableText,
});

/** GET/POST/PATCH detail envelope — `{ success, data: CashCounter, ... }`. */
export const cashCounterDetailEnvelopeSchema = z.object({
  success: z.boolean(),
  data: cashCounterSchema,
  message: nullableText,
  request_id: nullableText,
});

/** POST /cash-registers body. */
export const createCashCounterBodySchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

/** PATCH /cash-registers/{id} body. */
export const updateCashCounterBodySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  status: cashCounterStatusSchema,
});

export const cashCounterFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  status: cashCounterStatusSchema.optional(),
});

export type CashCounter = z.infer<typeof cashCounterSchema>;
export type CashCounterFormValues = z.infer<typeof cashCounterFormSchema>;
export type CreateCashCounterBody = z.infer<typeof createCashCounterBodySchema>;
export type UpdateCashCounterBody = z.infer<typeof updateCashCounterBodySchema>;

/** Parse list API payload; returns the `data` rows. */
export function parseCashCounterList(payload: unknown): CashCounter[] {
  const parsed = cashCounterListEnvelopeSchema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError('Unexpected cash counters response', 502);
  }
  return parsed.data.data;
}

/** Parse detail / create / patch API payload; returns the `data` row. */
export function parseCashCounterDetail(payload: unknown): CashCounter {
  const parsed = cashCounterDetailEnvelopeSchema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError('Unexpected cash counter response', 502);
  }
  return parsed.data.data;
}
