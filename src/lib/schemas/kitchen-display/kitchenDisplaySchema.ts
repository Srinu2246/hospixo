import { z } from 'zod';

export const kitchenDishItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number().int().min(1),
  category: z.enum(['Starters', 'Mains', 'Drinks', 'Desserts']),
  icon: z.string().optional(),
  notes: z.string().optional(),
});

export const kitchenOrderItemSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  tableNumber: z.string().optional(),
  isTakeaway: z.boolean().optional(),
  priority: z.enum(['HIGH', 'NORMAL']),
  status: z.enum(['new', 'preparing', 'ready', 'served']),
  items: z.array(kitchenDishItemSchema),
  station: z.string(),
  timeLabel: z.string(),
  elapsedSeconds: z.number().nonnegative(),
  createdAt: z.string(),
});

export const kitchenDisplayListSchema = z.array(kitchenOrderItemSchema);

export const kitchenDisplayStatsSchema = z.object({
  totalOrders: z.number().int().nonnegative(),
  pendingCount: z.number().int().nonnegative(),
  preparingCount: z.number().int().nonnegative(),
  readyCount: z.number().int().nonnegative(),
  avgPrepTime: z.string(),
});

export type KitchenDishItemSchema = z.infer<typeof kitchenDishItemSchema>;
export type KitchenOrderItemSchema = z.infer<typeof kitchenOrderItemSchema>;
export type KitchenDisplayStatsSchema = z.infer<typeof kitchenDisplayStatsSchema>;
