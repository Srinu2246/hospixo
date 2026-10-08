import { z } from 'zod';

import type { PosFloor, PosTable } from '@/features/pos/config/tables';

const posTablesResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      floors: z.custom<PosFloor[]>(),
      tables: z.custom<PosTable[]>(),
      branchId: z.number().nullable(),
      source: z.enum(['backend', 'fallback']),
      loadError: z.string().nullable(),
    })
    .optional(),
  message: z.string().optional(),
});

export type PosTablesResponse = z.infer<typeof posTablesResponseSchema>;

export async function fetchPosTables(outletId?: string | null): Promise<PosTablesResponse> {
  const params = new URLSearchParams();
  if (outletId?.trim()) {
    params.set('outlet', outletId.trim());
  }
  const suffix = params.size > 0 ? `?${params.toString()}` : '';
  const response = await fetch(`/api/pos/tables${suffix}`, {
    credentials: 'same-origin',
  });
  const json: unknown = await response.json();
  const parsed = posTablesResponseSchema.safeParse(json);
  if (parsed.success) return parsed.data;
  return { success: false, message: 'Unable to load tables.' };
}
