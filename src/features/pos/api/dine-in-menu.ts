import { z } from 'zod';

import type { DineInMenuItem } from '@/features/pos/config/dine-in';

const dineInMenuResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      items: z.custom<DineInMenuItem[]>(),
      branchId: z.number().nullable(),
      loadError: z.string().nullable(),
    })
    .optional(),
  message: z.string().optional(),
});

export type DineInMenuResponse = z.infer<typeof dineInMenuResponseSchema>;

export async function fetchDineInMenu(outletId?: string | null): Promise<DineInMenuResponse> {
  const params = new URLSearchParams();
  if (outletId?.trim()) params.set('outlet', outletId.trim());
  const suffix = params.size > 0 ? `?${params.toString()}` : '';
  const response = await fetch(`/api/pos/dine-in/menu${suffix}`, { credentials: 'same-origin' });
  const json: unknown = await response.json();
  const parsed = dineInMenuResponseSchema.safeParse(json);
  if (parsed.success) return parsed.data;
  return { success: false, message: 'Unable to load menu.' };
}
