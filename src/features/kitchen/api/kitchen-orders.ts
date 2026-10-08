import { z } from 'zod';

import type { KitchenOrder } from '@/features/kitchen/types';

const kitchenOrdersResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      orders: z.custom<KitchenOrder[]>(),
      branchId: z.number().nullable(),
      loadError: z.string().nullable(),
    })
    .optional(),
  message: z.string().optional(),
});

export type KitchenOrdersResponse = z.infer<typeof kitchenOrdersResponseSchema>;

export async function fetchKitchenOrders(outletId?: string | null): Promise<KitchenOrdersResponse> {
  const params = new URLSearchParams();
  if (outletId?.trim()) params.set('outlet', outletId.trim());
  const suffix = params.size > 0 ? `?${params.toString()}` : '';
  const response = await fetch(`/api/kitchen/orders${suffix}`, { credentials: 'same-origin' });
  const json: unknown = await response.json();
  const parsed = kitchenOrdersResponseSchema.safeParse(json);
  if (parsed.success) return parsed.data;
  return { success: false, message: 'Unable to load kitchen orders.' };
}
