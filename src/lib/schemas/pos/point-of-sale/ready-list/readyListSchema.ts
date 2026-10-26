import { z } from 'zod';

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
  /** Captain ready-list tab (Active / Pending / History). */
  queue: z.enum(['active', 'pending', 'history']).default('active'),
});

export type ReadyOrderItem = z.infer<typeof readyOrderItemSchema>;
export type ReadyOrderQueue = ReadyOrderItem['queue'];

export const readyOrderListSchema = z.array(readyOrderItemSchema);
