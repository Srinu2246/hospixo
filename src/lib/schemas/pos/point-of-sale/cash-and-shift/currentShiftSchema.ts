import { z } from 'zod';

import { ApiError } from '@/services/api/types';

const nullableText = z.string().nullable().optional();

/** Open shift row from GET /v1/branches/{branch_id}/shifts/current. */
export const currentShiftSchema = z.object({
  id: z.number().int(),
  branch_id: z.number().int(),
  cash_register_id: z.number().int().nullable().optional(),
  cash_register_name: z.string().nullable().optional(),
  shift_number: z.string().min(1),
  status: z.enum(['open', 'closed']),
  opened_by: z.string().min(1),
  opened_by_user_id: z.number().int().nullable().optional(),
  opened_at: z.string().min(1),
  opening_balance: z.coerce.number(),
  cash_in_drawer: z.coerce.number().optional(),
  total_sales: z.coerce.number().optional(),
  transaction_count: z.coerce.number().int().optional(),
});

/**
 * GET /v1/branches/{branch_id}/shifts/current
 * `data` is null when no shift is open.
 */
export const currentShiftEnvelopeSchema = z.object({
  success: z.boolean(),
  data: currentShiftSchema.nullable(),
  message: nullableText,
  request_id: nullableText,
});

export type CurrentShift = z.infer<typeof currentShiftSchema>;

/** Returns the current open shift, or `null` when none is open. */
export function parseCurrentShift(payload: unknown): CurrentShift | null {
  const parsed = currentShiftEnvelopeSchema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError('Unexpected current shift response', 502);
  }
  return parsed.data.data;
}

export function formatShiftCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatShiftStartTime(openedAt: string): string {
  const date = new Date(openedAt);
  if (Number.isNaN(date.getTime())) return openedAt;
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
