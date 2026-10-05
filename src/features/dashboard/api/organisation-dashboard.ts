import { z } from 'zod';

import type { OrganisationDashboardOverview } from '@/features/dashboard/types/organisation-dashboard';

/** Query string / searchParams for organisation dashboard (BFF + client). */
export const organisationDashboardQuerySchema = z.object({
  metric: z.enum(['total-sales', 'revenue', 'orders', 'profit']).optional(),
  view: z.enum(['chart', 'list']).optional(),
  range: z.enum(['today', 'last-7-days', 'last-30-days', 'custom']).optional(),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
});

export type OrganisationDashboardQueryInput = z.infer<typeof organisationDashboardQuerySchema>;

const ORGANISATION_DASHBOARD_QUERY_KEYS = [
  'metric',
  'view',
  'range',
  'from',
  'to',
  'page',
  'pageSize',
  'company_id',
  'org_id',
  'organization_id',
] as const;

/** Stable query string for SSR + client React Query (same keys as the BFF GET handler). */
export function buildOrganisationDashboardQueryString(
  searchParams: Record<string, string | string[] | undefined>,
): string {
  const params = new URLSearchParams();
  for (const key of ORGANISATION_DASHBOARD_QUERY_KEYS) {
    const value = searchParams[key];
    if (typeof value === 'string' && value.trim()) {
      params.set(key, value);
    }
  }
  return params.toString();
}

export function parseOrganisationDashboardQuery(
  searchParams: Record<string, string | string[] | undefined>,
): OrganisationDashboardQueryInput {
  const raw: Record<string, string | undefined> = {};
  for (const key of ['metric', 'view', 'range', 'from', 'to', 'page', 'pageSize'] as const) {
    const value = searchParams[key];
    raw[key] = typeof value === 'string' ? value : undefined;
  }

  const parsed = organisationDashboardQuerySchema.safeParse(raw);
  return parsed.success ? parsed.data : {};
}

export const organisationDashboardResponseSchema = z.object({
  success: z.boolean(),
  data: z.custom<OrganisationDashboardOverview>().optional(),
  source: z.enum(['backend', 'fallback']).optional(),
  loadError: z.string().nullable().optional(),
  message: z.string().optional(),
});

export type OrganisationDashboardResponse = z.infer<typeof organisationDashboardResponseSchema>;

export async function fetchOrganisationDashboard(
  queryString: string,
): Promise<OrganisationDashboardResponse> {
  const suffix = queryString ? `?${queryString}` : '';
  const response = await fetch(`/api/dashboard/organisation${suffix}`, {
    credentials: 'same-origin',
  });
  const json: unknown = await response.json();
  const parsed = organisationDashboardResponseSchema.safeParse(json);
  if (parsed.success) {
    return parsed.data;
  }
  return json as OrganisationDashboardResponse;
}
