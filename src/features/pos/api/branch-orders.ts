import { z } from 'zod';

import type { OnlineOrder } from '@/features/pos/config/online-orders';
import type { OpenOrder } from '@/features/pos/config/open-orders';
import type { ReadyOrder } from '@/features/pos/config/ready-list';

const branchOrdersEnvelope = <T extends z.ZodType>(ordersSchema: T) =>
  z.object({
    success: z.boolean(),
    data: z
      .object({
        orders: ordersSchema,
        branchId: z.number().nullable(),
        loadError: z.string().nullable(),
      })
      .optional(),
    message: z.string().optional(),
  });

const onlineOrdersResponseSchema = branchOrdersEnvelope(z.custom<OnlineOrder[]>());
const readyOrdersResponseSchema = branchOrdersEnvelope(z.custom<ReadyOrder[]>());
const openOrdersResponseSchema = branchOrdersEnvelope(z.custom<OpenOrder[]>());

export type OnlineOrdersApiResponse = z.infer<typeof onlineOrdersResponseSchema>;
export type ReadyOrdersApiResponse = z.infer<typeof readyOrdersResponseSchema>;
export type OpenOrdersApiResponse = z.infer<typeof openOrdersResponseSchema>;

function outletQuery(outletId?: string | null): string {
  const params = new URLSearchParams();
  if (outletId?.trim()) params.set('outlet', outletId.trim());
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export async function fetchOnlineOrders(
  outletId?: string | null,
): Promise<OnlineOrdersApiResponse> {
  const response = await fetch(`/api/pos/online-orders${outletQuery(outletId)}`, {
    credentials: 'same-origin',
  });
  const json: unknown = await response.json();
  const parsed = onlineOrdersResponseSchema.safeParse(json);
  if (parsed.success) return parsed.data;
  return { success: false, message: 'Unable to load online orders.' };
}

export async function fetchReadyOrders(outletId?: string | null): Promise<ReadyOrdersApiResponse> {
  const response = await fetch(`/api/pos/ready-orders${outletQuery(outletId)}`, {
    credentials: 'same-origin',
  });
  const json: unknown = await response.json();
  const parsed = readyOrdersResponseSchema.safeParse(json);
  if (parsed.success) return parsed.data;
  return { success: false, message: 'Unable to load ready orders.' };
}

export async function fetchOpenOrders(outletId?: string | null): Promise<OpenOrdersApiResponse> {
  const response = await fetch(`/api/pos/branch-orders${outletQuery(outletId)}`, {
    credentials: 'same-origin',
  });
  const json: unknown = await response.json();
  const parsed = openOrdersResponseSchema.safeParse(json);
  if (parsed.success) return parsed.data;
  return { success: false, message: 'Unable to load orders.' };
}

export type PatchBranchOrderBody = Readonly<Record<string, unknown>>;

export async function patchBranchOrder(
  orderId: string,
  body: PatchBranchOrderBody,
  outletId?: string | null,
): Promise<{ success: boolean; message?: string }> {
  const response = await fetch(
    `/api/pos/orders/${encodeURIComponent(orderId)}${outletQuery(outletId)}`,
    {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  const json = (await response.json()) as { success?: boolean; message?: string };
  if (!response.ok || !json.success) {
    return { success: false, message: json.message ?? 'Unable to update order.' };
  }
  return { success: true };
}
