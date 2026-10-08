import { z } from 'zod';

import type { DuePayment } from '@/features/pos/config/due-payments';

const duePaymentsResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      payments: z.custom<DuePayment[]>(),
      branchId: z.number().nullable(),
      loadError: z.string().nullable(),
    })
    .optional(),
  message: z.string().optional(),
});

export type DuePaymentsResponse = z.infer<typeof duePaymentsResponseSchema>;

export async function fetchDuePayments(outletId?: string | null): Promise<DuePaymentsResponse> {
  const params = new URLSearchParams();
  if (outletId?.trim()) params.set('outlet', outletId.trim());
  const suffix = params.size > 0 ? `?${params.toString()}` : '';
  const response = await fetch(`/api/pos/due-payments${suffix}`, { credentials: 'same-origin' });
  const json: unknown = await response.json();
  const parsed = duePaymentsResponseSchema.safeParse(json);
  if (parsed.success) return parsed.data;
  return { success: false, message: 'Unable to load due payments.' };
}
