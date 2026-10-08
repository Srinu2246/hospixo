import { z } from 'zod';

import type { PosCashShiftPayload } from '@/features/pos/api/cash-shift.server';

const cashShiftResponseSchema = z.object({
  success: z.boolean(),
  data: z.custom<PosCashShiftPayload>().optional(),
  message: z.string().optional(),
});

export type PosCashShiftResponse = z.infer<typeof cashShiftResponseSchema>;

export async function fetchPosCashShift(): Promise<PosCashShiftResponse> {
  const response = await fetch('/api/pos/cash-shift', { credentials: 'same-origin' });
  const json: unknown = await response.json();
  const parsed = cashShiftResponseSchema.safeParse(json);
  if (parsed.success) return parsed.data;
  return { success: false, message: 'Unable to load cash counter.' };
}
