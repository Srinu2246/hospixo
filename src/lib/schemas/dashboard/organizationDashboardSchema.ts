import { z } from 'zod';

const amountSchema = z
  .union([z.string(), z.number()])
  .nullable()
  .transform((value) => (value == null ? '0.00' : String(value)));

const nullableAmountSchema = z
  .union([z.string(), z.number()])
  .nullable()
  .transform((value) => (value == null ? null : String(value)));

const nullablePercentSchema = z.number().nullable();

export const organizationDashboardCompanyItemSchema = z.object({
  company_id: z.number().int(),
  company_name: z.string(),
  status: z.string(),
  total_branches: z.number().int(),
  active_branches: z.number().int(),
  total_sales: amountSchema,
  net_sales: amountSchema,
  total_orders: z.number().int(),
  expenses: nullableAmountSchema,
  profit: nullableAmountSchema,
});

export const organizationDashboardTopBranchSchema = z.object({
  branch_id: z.number().int(),
  branch_name: z.string(),
  company_id: z.number().int(),
  company_name: z.string(),
  total_sales: amountSchema,
  total_orders: z.number().int(),
  status: z.string(),
});

export const organizationDashboardDataSchema = z.object({
  organization_id: z.number().int(),
  date_range: z.object({
    start_date: z.string(),
    end_date: z.string(),
  }),
  summary: z.object({
    total_sales: amountSchema,
    total_sales_change_percent: nullablePercentSchema,
    net_sales: amountSchema,
    net_sales_change_percent: nullablePercentSchema,
    total_companies: z.number().int(),
    active_companies: z.number().int(),
    total_branches: z.number().int(),
    active_branches: z.number().int(),
  }),
  company_performance: z.object({
    total: z.number().int(),
    page: z.number().int(),
    page_size: z.number().int(),
    items: z.array(organizationDashboardCompanyItemSchema),
  }),
  tax_summary: z.object({
    total_tax: amountSchema,
    cgst: amountSchema,
    sgst: amountSchema,
    igst: amountSchema,
    service_tax: nullableAmountSchema,
    vat: nullableAmountSchema,
  }),
  top_performing_branches: z.array(organizationDashboardTopBranchSchema),
  financial_breakdown: z.unknown().nullable().optional(),
  subscription_usage: z.unknown().nullable().optional(),
});

const organizationDashboardResponseSchema = z.object({
  success: z.boolean(),
  data: organizationDashboardDataSchema,
  message: z.string().optional(),
});

export type OrganizationDashboardData = z.infer<typeof organizationDashboardDataSchema>;
export type OrganizationDashboardCompanyItem = z.infer<
  typeof organizationDashboardCompanyItemSchema
>;
export type OrganizationDashboardTopBranch = z.infer<typeof organizationDashboardTopBranchSchema>;

export function parseOrganizationDashboardResponse(payload: unknown): OrganizationDashboardData {
  const parsed = organizationDashboardResponseSchema.safeParse(payload);
  if (!parsed.success) {
    const detail = parsed.error.issues.map((issue) => issue.path.join('.')).join(', ');
    throw new Error(
      detail
        ? `Invalid organization dashboard response (${detail}).`
        : 'Invalid organization dashboard response.',
    );
  }
  if (!parsed.data.success) {
    throw new Error(parsed.data.message || 'Unable to load organization dashboard.');
  }
  return parsed.data.data;
}
