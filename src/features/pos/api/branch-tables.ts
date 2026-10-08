import { z } from 'zod';

import type { BranchTablesOverview } from '@/features/pos/types/branch-tables';

const branchTablesResponseSchema = z.object({
  success: z.boolean(),
  data: z.custom<BranchTablesOverview>().optional(),
  message: z.string().optional(),
});

export type BranchTablesResponse = z.infer<typeof branchTablesResponseSchema>;

export async function fetchBranchTablesOverview(
  floorId?: number | null,
): Promise<BranchTablesOverview> {
  const params = new URLSearchParams();
  if (floorId != null && floorId > 0) {
    params.set('floor_id', String(floorId));
  }
  const suffix = params.toString() ? `?${params.toString()}` : '';

  const response = await fetch(`/api/pos/branch-tables${suffix}`, {
    credentials: 'same-origin',
    cache: 'no-store',
  });

  const json: unknown = await response.json();
  const parsed = branchTablesResponseSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error('Invalid branch tables response.');
  }

  if (!response.ok || !parsed.data.success || !parsed.data.data) {
    throw new Error(parsed.data.message ?? 'Unable to load branch tables.');
  }

  return parsed.data.data;
}
