import { z } from 'zod';

/** Dashboard KPI metric card. */
export const shiftMetricItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  value: z.string().min(1),
  hasLiveIndicator: z.boolean().optional(),
});

export type ShiftMetricItem = z.infer<typeof shiftMetricItemSchema>;

/** Active-shift banner view model (display strings). */
export const activeShiftDetailsSchema = z.object({
  shiftNumber: z.string().min(1),
  openedBy: z.string().min(1),
  startTime: z.string().min(1),
  openingBalance: z.string().min(1),
});

export type ActiveShiftDetails = z.infer<typeof activeShiftDetailsSchema>;

export const cashTransactionItemSchema = z.object({
  id: z.string().min(1),
  time: z.string().min(1),
  type: z.string().min(1),
  description: z.string().min(1),
  amount: z.string().min(1),
  balance: z.string().min(1),
  isPositive: z.boolean(),
});

export type CashTransactionItem = z.infer<typeof cashTransactionItemSchema>;

export const paymentBreakdownItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  count: z.number().int().nonnegative(),
  amount: z.string().min(1),
});

export const closeShiftReconciliationSchema = z.object({
  openingBalance: z.string().min(1),
  totalCashIn: z.string().min(1),
  totalCashOut: z.string().min(1),
  expectedInDrawer: z.string().min(1),
  actualCashCount: z.string().min(1),
  difference: z.string().min(1),
});

export const closeShiftDetailsSchema = z.object({
  shiftId: z.string().min(1),
  openedBy: z.string().min(1),
  startTime: z.string().min(1),
  duration: z.string().min(1),
  totalSales: z.string().min(1),
  transactions: z.number().int().nonnegative(),
  sodexoAmount: z.string().min(1),
  sodexoTransactions: z.number().int().nonnegative(),
  paymentBreakdown: z.array(paymentBreakdownItemSchema),
  reconciliation: closeShiftReconciliationSchema,
});

export type CloseShiftDetails = z.infer<typeof closeShiftDetailsSchema>;

export const closeShiftSuccessDetailsSchema = z.object({
  shiftNumber: z.string().min(1),
  closedAt: z.string().min(1),
  openedBy: z.string().min(1),
  timeRange: z.string().min(1),
  duration: z.string().min(1),
  totalSales: z.string().min(1),
  transactions: z.number().int().nonnegative(),
  cashDifference: z.string().min(1),
  managerEmail: z.string().min(1),
});

export type CloseShiftSuccessDetails = z.infer<typeof closeShiftSuccessDetailsSchema>;

export const newShiftDefaultsSchema = z.object({
  defaultOpeningBalance: z.string().min(1),
});

export type NewShiftDefaults = z.infer<typeof newShiftDefaultsSchema>;
