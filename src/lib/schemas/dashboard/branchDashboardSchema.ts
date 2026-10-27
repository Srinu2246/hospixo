import { z } from 'zod';

const amountSchema = z
  .union([z.string(), z.number()])
  .nullable()
  .transform((value) => (value == null ? '0.00' : String(value)));
const percentSchema = z
  .number()
  .nullable()
  .transform((value) => value ?? 0);

export const branchDashboardDataSchema = z.object({
  branch_id: z.number(),
  date_range: z.object({
    start_date: z.string(),
    end_date: z.string(),
  }),
  summary: z.object({
    total_sales: amountSchema,
    total_sales_change_percent: percentSchema,
    net_sales: amountSchema,
    net_sales_change_percent: percentSchema,
    online_sales: amountSchema,
    offline_sales: amountSchema,
    offline_sales_change_percent: percentSchema,
  }),
  sales_statistics: z.object({
    total_orders: z.number(),
    total_sales: amountSchema,
    by_order_type: z.array(
      z.object({
        order_type: z.string(),
        sales: amountSchema,
        orders: z.number(),
      }),
    ),
  }),
  payment_breakdown: z.object({
    cash: amountSchema,
    card: amountSchema,
    upi: amountSchema,
    other: amountSchema,
    total: amountSchema,
  }),
  online_orders: amountSchema,
});

const branchDashboardResponseSchema = z.object({
  success: z.boolean(),
  data: branchDashboardDataSchema,
  message: z.string().optional(),
});

export type BranchDashboardData = z.infer<typeof branchDashboardDataSchema>;

export function parseBranchDashboardResponse(payload: unknown): BranchDashboardData {
  const parsed = branchDashboardResponseSchema.safeParse(payload);
  if (!parsed.success) throw new Error('Invalid branch dashboard response.');
  if (!parsed.data.success) {
    throw new Error(parsed.data.message || 'Unable to load branch dashboard.');
  }
  return parsed.data.data;
}
