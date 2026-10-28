import { z } from 'zod';

/** PATCH …/kitchen-status body `action` values. */
export const kitchenStatusActionSchema = z.enum(['start_preparing', 'mark_ready', 'complete']);

export const kitchenStatusRequestSchema = z.object({
  expected_version: z.number().int().min(1),
  action: kitchenStatusActionSchema,
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

export type KitchenStatusAction = z.infer<typeof kitchenStatusActionSchema>;
export type KitchenStatusRequestBody = z.infer<typeof kitchenStatusRequestSchema>;
export type KitchenStatusResponse = z.infer<typeof kitchenStatusResponseSchema>;

export function buildKitchenStatusRequestBody(input: {
  expectedVersion: number;
  action: KitchenStatusAction;
  preparationStationId?: number;
}): KitchenStatusRequestBody {
  const body: KitchenStatusRequestBody = {
    expected_version: input.expectedVersion,
    action: input.action,
  };
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
