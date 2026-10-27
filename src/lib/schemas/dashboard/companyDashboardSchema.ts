import { z } from 'zod';

/** Monetary fields that are always present (zero when no activity). */
const amountSchema = z
  .union([z.string(), z.number()])
  .nullable()
  .transform((value) => (value == null ? '0.00' : String(value)));

/** Optional monetary fields (`null` when not applicable). */
const nullableAmountSchema = z
  .union([z.string(), z.number()])
  .nullable()
  .transform((value) => (value == null ? null : String(value)));

/** Period-over-period change; `null` when there is no prior period to compare. */
const nullablePercentSchema = z.number().nullable();

export const companyDashboardBranchPerformanceItemSchema = z.object({
  branch_id: z.number().int(),
  branch_name: z.string(),
  status: z.string(),
  total_sales: amountSchema,
  net_sales: amountSchema,
  offline_sales: amountSchema,
  total_orders: z.number().int(),
  total_sales_change_percent: nullablePercentSchema,
  offline_sales_change_percent: nullablePercentSchema,
});

export const companyDashboardDataSchema = z.object({
  company_id: z.number().int(),
  date_range: z.object({
    start_date: z.string(),
    end_date: z.string(),
  }),
  summary: z.object({
    total_sales: amountSchema,
    total_sales_change_percent: nullablePercentSchema,
    net_sales: amountSchema,
    net_sales_change_percent: nullablePercentSchema,
    online_sales: nullableAmountSchema,
    offline_sales: amountSchema,
    offline_sales_change_percent: nullablePercentSchema,
    total_branches: z.number().int(),
    active_branches: z.number().int(),
  }),
  sales_statistics: z.object({
    total_orders: z.number().int(),
    total_sales: amountSchema,
    by_order_type: z.array(
      z.object({
        order_type: z.string(),
        sales: amountSchema,
        orders: z.number().int(),
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
  branch_performance: z.object({
    total: z.number().int(),
    page: z.number().int(),
    page_size: z.number().int(),
    items: z.array(companyDashboardBranchPerformanceItemSchema),
  }),
  tax_summary: z.object({
    total_tax: amountSchema,
    cgst: amountSchema,
    sgst: amountSchema,
    service_tax: nullableAmountSchema,
    vat: nullableAmountSchema,
    igst: amountSchema,
  }),
  customer_insights: z.object({
    average_order_value: nullableAmountSchema,
    retention_rate: nullablePercentSchema.optional(),
    footfall_heatmap: z.unknown().nullable().optional(),
  }),
});

const companyDashboardResponseSchema = z.object({
  success: z.boolean(),
  data: companyDashboardDataSchema,
  message: z.string().optional(),
});

export type CompanyDashboardData = z.infer<typeof companyDashboardDataSchema>;
export type CompanyDashboardBranchPerformanceItem = z.infer<
  typeof companyDashboardBranchPerformanceItemSchema
>;

export function parseCompanyDashboardResponse(payload: unknown): CompanyDashboardData {
  const parsed = companyDashboardResponseSchema.safeParse(payload);
  if (!parsed.success) {
    const detail = parsed.error.issues.map((issue) => issue.path.join('.')).join(', ');
    throw new Error(
      detail
        ? `Invalid company dashboard response (${detail}).`
        : 'Invalid company dashboard response.',
    );
  }
  if (!parsed.data.success) {
    throw new Error(parsed.data.message || 'Unable to load company dashboard.');
  }
  return parsed.data.data;
}
