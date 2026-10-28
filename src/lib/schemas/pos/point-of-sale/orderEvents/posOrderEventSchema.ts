import { z } from 'zod';

export const POS_ORDER_STREAM_FATAL_CLOSE_CODES = new Set([4401, 4403, 4404]);

const posOrderStreamReadySchema = z.object({
  type: z.literal('ready'),
  organization_id: z.number().optional(),
  branch_id: z.number().optional(),
  live: z.boolean().optional(),
  heartbeat_seconds: z.number().optional(),
  expires_at: z.string().optional(),
  server_time: z.string().optional(),
});

const posOrderStreamKitchenSchema = z
  .object({
    action: z.string().optional(),
    previous_status: z.string().optional(),
    status: z.string().optional(),
    preparation_station_id: z.number().nullable().optional(),
    voided: z.boolean().optional(),
    kot_number: z.string().optional(),
  })
  .optional();

export const posOrderStreamEventSchema = z.object({
  type: z.literal('event'),
  v: z.number().optional(),
  event: z.string(),
  event_id: z.string(),
  occurred_at: z.string().optional(),
  organization_id: z.number().optional(),
  company_id: z.number().optional(),
  branch_id: z.number().optional(),
  order_id: z.union([z.number(), z.string()]),
  order_number: z.string().optional(),
  order_type: z.string().optional(),
  table_id: z.number().nullable().optional(),
  status: z.string().optional(),
  payment_status: z.string().optional(),
  version: z.number().optional(),
  business_date: z.string().optional(),
  item_ids: z.array(z.number()).optional(),
  item_ids_truncated: z.boolean().optional(),
  actor_user_id: z.number().optional(),
  kitchen: posOrderStreamKitchenSchema,
});

const posOrderStreamResyncSchema = z.object({ type: z.literal('resync') });
const posOrderStreamPingSchema = z.object({ type: z.enum(['ping', 'pong']) });
const posOrderStreamTokenRefreshedSchema = z.object({
  type: z.literal('token_refreshed'),
  expires_at: z.string().optional(),
});
const posOrderStreamErrorSchema = z.object({
  type: z.literal('error'),
  message: z.string().optional(),
});

export type PosOrderStreamReady = z.infer<typeof posOrderStreamReadySchema>;
export type PosOrderStreamEvent = z.infer<typeof posOrderStreamEventSchema>;

export function parsePosOrderStreamMessage(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function parsePosOrderStreamMessageTyped(raw: string) {
  const payload = parsePosOrderStreamMessage(raw);
  if (!payload || typeof payload !== 'object') return null;

  const ready = posOrderStreamReadySchema.safeParse(payload);
  if (ready.success) return ready.data;

  const resync = posOrderStreamResyncSchema.safeParse(payload);
  if (resync.success) return resync.data;

  const ping = posOrderStreamPingSchema.safeParse(payload);
  if (ping.success) return ping.data;

  const tokenRefreshed = posOrderStreamTokenRefreshedSchema.safeParse(payload);
  if (tokenRefreshed.success) return tokenRefreshed.data;

  const error = posOrderStreamErrorSchema.safeParse(payload);
  if (error.success) return error.data;

  const event = posOrderStreamEventSchema.safeParse(payload);
  if (event.success) return event.data;

  return null;
}

export function shouldPlayKitchenAlertForStreamEvent(message: PosOrderStreamEvent): boolean {
  if (message.event === 'order.submitted') return true;
  if (message.event === 'order.kitchen_status_changed') {
    return message.kitchen?.status === 'preparing' || message.kitchen?.action === 'start_preparing';
  }
  return false;
}
