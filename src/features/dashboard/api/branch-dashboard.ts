import { z } from 'zod';

import type { BranchDashboardOverview } from '@/features/dashboard/types/branch-dashboard';

export const branchDashboardQuerySchema = z.object({
  outlet: z.string().optional(),
  branch_id: z.string().optional(),
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

export type BranchDashboardQueryInput = z.infer<typeof branchDashboardQuerySchema>;

const BRANCH_DASHBOARD_QUERY_KEYS = [
  'outlet',
  'branch_id',
  'company_id',
  'org_id',
  'range',
  'from',
  'to',
] as const;

export function buildBranchDashboardQueryString(
  searchParams: Record<string, string | string[] | undefined>,
): string {
  const params = new URLSearchParams();
  for (const key of BRANCH_DASHBOARD_QUERY_KEYS) {
    const value = searchParams[key];
    if (typeof value === 'string' && value.trim()) {
      params.set(key, value);
    }
  }
  return params.toString();
}

export function parseBranchDashboardQuery(
  searchParams: Record<string, string | string[] | undefined>,
): BranchDashboardQueryInput {
  const raw: Record<string, string | undefined> = {};
  for (const key of BRANCH_DASHBOARD_QUERY_KEYS) {
    const value = searchParams[key];
    raw[key] = typeof value === 'string' ? value : undefined;
  }

  const parsed = branchDashboardQuerySchema.safeParse(raw);
  return parsed.success ? parsed.data : {};
}

export const branchDashboardResponseSchema = z.object({
  success: z.boolean(),
  data: z.custom<BranchDashboardOverview>().optional(),
  source: z.enum(['backend', 'fallback']).optional(),
  loadError: z.string().nullable().optional(),
  message: z.string().optional(),
});

export type BranchDashboardResponse = z.infer<typeof branchDashboardResponseSchema>;

export async function fetchBranchDashboard(queryString: string): Promise<BranchDashboardResponse> {
  const suffix = queryString ? `?${queryString}` : '';
  const response = await fetch(`/api/dashboard/branch${suffix}`, {
    credentials: 'same-origin',
  });
  const json: unknown = await response.json();
  const parsed = branchDashboardResponseSchema.safeParse(json);
  if (parsed.success) {
    return parsed.data;
  }
  return json as BranchDashboardResponse;
}
