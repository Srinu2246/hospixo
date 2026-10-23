import { z } from 'zod';

export const posMetricCardSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  value: z.union([z.number(), z.string()]),
  trend: z.string().min(1),
  trendDirection: z.enum(['up', 'down']),
  comparisonText: z.string().min(1),
  iconType: z.enum(['orders', 'pending', 'ready', 'bills']),
});

export type PosMetricCardData = z.infer<typeof posMetricCardSchema>;

export const posLiveOrderSchema = z.object({
  id: z.string().min(1),
  orderNumber: z.string().min(1),
  table: z.string().min(1),
  customerName: z.string().min(1),
  status: z.enum(['preparing', 'ready', 'billing']),
  time: z.string().min(1),
  action: z.enum(['View', 'Pay', 'Edit']),
});

export type PosLiveOrder = z.infer<typeof posLiveOrderSchema>;

export const dashboardTableStatusSchema = z.enum(['vacant', 'occupied', 'reserved', 'cleaning']);
export type TableStatus = z.infer<typeof dashboardTableStatusSchema>;

export const posFloorTableSchema = z.object({
  id: z.string().min(1),
  tableNumber: z.string().min(1),
  status: dashboardTableStatusSchema,
  statusLabel: z.string().min(1),
});

export type PosFloorTable = z.infer<typeof posFloorTableSchema>;

export const posOnlinePlatformSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  orders: z.number().int().nonnegative(),
  iconKey: z.enum(['zomato', 'swiggy', 'growthfalcons']),
});

export const posOnlineSummarySchema = z.object({
  totalSales: z.string().min(1),
  totalOrders: z.number().int().nonnegative(),
  period: z.string().min(1),
  platforms: z.array(posOnlinePlatformSchema),
});

export type PosOnlineSummary = z.infer<typeof posOnlineSummarySchema>;

export const posReadyOrderSchema = z.object({
  id: z.string().min(1),
  orderNumber: z.string().min(1),
  destination: z.string().min(1),
  status: z.enum(['readyToServe', 'waitingPickup', 'waitingDriver']),
  statusLabel: z.string().min(1),
});

export type PosReadyOrder = z.infer<typeof posReadyOrderSchema>;

export const posRecentTransactionSchema = z.object({
  id: z.string().min(1),
  txNumber: z.string().min(1),
  amount: z.string().min(1),
  method: z.enum(['upi', 'cash', 'card']),
  statusLabel: z.string().min(1),
});

export type PosRecentTransaction = z.infer<typeof posRecentTransactionSchema>;

export const posSystemNotificationSchema = z.object({
  id: z.string().min(1),
  message: z.string().min(1),
  status: z.string().min(1),
  severity: z.enum(['critical', 'completed', 'pending', 'offline']),
});

export type PosSystemNotification = z.infer<typeof posSystemNotificationSchema>;

export const posShiftInfoSchema = z.object({
  started: z.string().min(1),
  ordersHandled: z.number().int().nonnegative(),
  status: z.string().min(1),
  statusColor: z.enum(['success', 'warning', 'error']),
});

export type PosShiftInfo = z.infer<typeof posShiftInfoSchema>;
