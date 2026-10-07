import { z } from 'zod';

import type { DashboardOverview } from '@/features/dashboard/types';

export const companyDashboardQuerySchema = z.object({
  outlet: z.string().optional(),
  company_id: z.string().optional(),
  org_id: z.string().optional(),
  range: z.enum(['today', 'last-7-days', 'last-30-days', 'custom']).optional(),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export type CompanyDashboardQueryInput = z.infer<typeof companyDashboardQuerySchema>;

const COMPANY_DASHBOARD_QUERY_KEYS = [
  'outlet',
  'company_id',
  'org_id',
  'range',
  'from',
  'to',
] as const;

export function buildCompanyDashboardQueryString(
  searchParams: Record<string, string | string[] | undefined>,
): string {
  const params = new URLSearchParams();
  for (const key of COMPANY_DASHBOARD_QUERY_KEYS) {
    const value = searchParams[key];
    if (typeof value === 'string' && value.trim()) {
      params.set(key, value);
    }
  }
  return params.toString();
}

export function parseCompanyDashboardQuery(
  searchParams: Record<string, string | string[] | undefined>,
): CompanyDashboardQueryInput {
  const raw: Record<string, string | undefined> = {};
  for (const key of COMPANY_DASHBOARD_QUERY_KEYS) {
    const value = searchParams[key];
    raw[key] = typeof value === 'string' ? value : undefined;
  }

  const parsed = companyDashboardQuerySchema.safeParse(raw);
  return parsed.success ? parsed.data : {};
}

export const companyDashboardResponseSchema = z.object({
  success: z.boolean(),
  data: z.custom<DashboardOverview>().optional(),
  source: z.enum(['backend', 'fallback']).optional(),
  loadError: z.string().nullable().optional(),
  message: z.string().optional(),
});

export type CompanyDashboardResponse = z.infer<typeof companyDashboardResponseSchema>;

export async function fetchCompanyDashboard(
  queryString: string,
): Promise<CompanyDashboardResponse> {
  const suffix = queryString ? `?${queryString}` : '';
  const response = await fetch(`/api/dashboard/company${suffix}`, {
    credentials: 'same-origin',
  });
  const json: unknown = await response.json();
  const parsed = companyDashboardResponseSchema.safeParse(json);
  if (parsed.success) {
    return parsed.data;
  }
  return json as CompanyDashboardResponse;
}
