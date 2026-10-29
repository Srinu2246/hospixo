import { z } from 'zod';

export const readyOrderLineSchema = z.object({
  /** Order line id from branch orders API; used for stable React keys. */
  lineId: z.string().min(1).optional(),
  name: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const readyOrderItemSchema = z.object({
  id: z.string().min(1),
  table: z.string().min(1),
  readyTimeAgo: z.string().min(1),
  token: z.string().min(1),
  priority: z.enum(['HIGH', 'NORMAL']),
  itemsCount: z.number().int().positive(),
  status: z.literal('Ready'),
  dishSummary: z.string().min(1),
  paymentStatus: z.enum(['PAID', 'PENDING']),
  /** Captain ready-list tab (Ready to serve / Preparing / Served). */
  queue: z.enum(['active', 'pending', 'history']).default('active'),
  /** Items already handed to the table. */
  servedCount: z.number().int().nonnegative().default(0),
  /** Ticket size used by the progress label. */
  totalCount: z.number().int().positive().optional(),
  /** Lines still waiting to be served. */
  lines: z.array(readyOrderLineSchema).default([]),
  /** Clock time under the served label, for example "12:32 PM". */
  servedClock: z.string().min(1).optional(),
  /** Optimistic lock from GET /v1/branches/{branch_id}/orders/{order_id}. */
  orderVersion: z.number().int().min(1).optional(),
});

export type ReadyOrderLine = z.infer<typeof readyOrderLineSchema>;
export type ReadyOrderItem = z.infer<typeof readyOrderItemSchema>;
export type ReadyOrderQueue = ReadyOrderItem['queue'];

export const readyOrderListSchema = z.array(readyOrderItemSchema);
