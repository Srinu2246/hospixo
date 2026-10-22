import { z } from 'zod';

import { ApiError } from '@/services/api/types';

const nullableText = z.string().nullable().optional();

/**
 * GET /v1/branches/{branch_id}/shifts/current
 * `data` is null when no shift is open.
 */
export const currentShiftEnvelopeSchema = z.object({
  success: z.boolean(),
  data: z.unknown().nullable(),
  message: nullableText,
  request_id: nullableText,
});

/** Returns the current shift payload, or `null` when none is open. */
export function parseCurrentShift(payload: unknown): unknown | null {
  const parsed = currentShiftEnvelopeSchema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError('Unexpected current shift response', 502);
  }
  return parsed.data.data;
}
