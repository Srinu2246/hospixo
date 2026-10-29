import { z } from 'zod';

/** Backend `KitchenBadge` values. */
export const kitchenBadgeSchema = z.enum(['kot_sent', 'preparing', 'ready', 'served', 'cancelled']);

export type KitchenBadge = z.infer<typeof kitchenBadgeSchema>;

/** Board line status → kitchen badge. `submitted` is KOT sent; `completed` is served. */
export function toKitchenBadge(status: string | null | undefined): KitchenBadge | null {
  if (status === 'kot_sent' || status === 'submitted' || status === 'kot sent') return 'kot_sent';
  if (status === 'preparing') return 'preparing';
  if (status === 'ready') return 'ready';
  if (status === 'served' || status === 'completed') return 'served';
  if (status === 'cancelled' || status === 'canceled' || status === 'voided') return 'cancelled';
  return null;
}

/** PATCH …/kitchen-status `action` values accepted by the API. */
export const kitchenStatusActionSchema = z.enum([
  'start_preparing',
  'mark_ready',
  'complete',
  'served',
]);

export const kitchenStatusRequestSchema = z.object({
  expected_version: z.number().int().min(1),
  action: kitchenStatusActionSchema,
  /** Order line id. Omit to update every matching line on the order. */
  item_id: z.number().int().positive().optional(),
  preparation_station_id: z.number().int().positive().optional(),
});

const kitchenStatusOrderSchema = z
  .object({
    id: z.coerce.number().int().positive(),
    version: z.coerce.number().int().nonnegative().optional(),
    order_number: z.string().optional(),
    status: z.string().optional(),
    kitchen_badge: z.string().nullable().optional(),
  })
  .passthrough();

/** PATCH …/kitchen-status `data` envelope (OpenAPI). */
export const kitchenStatusResultSchema = z.object({
  order_id: z.coerce.number().int().positive().optional(),
  expected_version: z.coerce.number().int().optional(),
  order_number: z.string().optional(),
  preparation_station_id: z.number().int().nullable().optional(),
  previous_status: z.string().optional(),
  status: z.string().optional(),
  updated_item_ids: z.array(z.coerce.number().int()).optional(),
  updated_at: z.string().optional(),
  order: kitchenStatusOrderSchema.nullable().optional(),
});

export const kitchenStatusResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: kitchenStatusResultSchema.nullable().optional(),
  request_id: z.string().optional(),
});

/** Kitchen badge → the only legal kitchen-status action. */
export function kitchenActionForItemStatus(
  itemStatus: string | null | undefined,
): KitchenStatusAction | null {
  const badge = toKitchenBadge(itemStatus);
  if (badge === 'kot_sent') return 'start_preparing';
  if (badge === 'preparing') return 'mark_ready';
  if (badge === 'ready') return 'complete';
  return null;
}

export function kitchenLineStatusAfterAction(
  action: KitchenStatusAction,
): 'preparing' | 'ready' | 'served' {
  if (action === 'start_preparing') return 'preparing';
  if (action === 'mark_ready') return 'ready';
  return 'served';
}

export type KitchenStatusAction = z.infer<typeof kitchenStatusActionSchema>;
export type KitchenStatusRequestBody = z.infer<typeof kitchenStatusRequestSchema>;
export type KitchenStatusResponse = z.infer<typeof kitchenStatusResponseSchema>;

export function buildKitchenStatusRequestBody(input: {
  expectedVersion: number;
  action: KitchenStatusAction;
  /** Board line `order_item_id`. Omit for the card-level action. */
  itemId?: number;
  preparationStationId?: number;
}): KitchenStatusRequestBody {
  const body: KitchenStatusRequestBody = {
    expected_version: input.expectedVersion,
    action: input.action,
  };
  if (input.itemId != null && input.itemId > 0) {
    body.item_id = input.itemId;
  }
  if (input.preparationStationId != null && input.preparationStationId > 0) {
    body.preparation_station_id = input.preparationStationId;
  }
  return kitchenStatusRequestSchema.parse(body);
}

export function parseKitchenStatusResponse(payload: unknown): KitchenStatusResponse {
  const parsed = kitchenStatusResponseSchema.safeParse(payload);
  if (parsed.success) return parsed.data;
  throw new Error('Unexpected kitchen-status response');
}

/** Order `version` after a successful PATCH (for optimistic-lock follow-up). */
export function kitchenStatusNextVersion(response: KitchenStatusResponse): number | undefined {
  const version = response.data?.order?.version;
  if (version != null && version >= 1) return version;
  return undefined;
}
