import { createClientResourceCache } from '@/lib/client-resource-cache';
import type { DashboardOverview } from '@/features/dashboard/types';
import type { BranchDashboardOverview } from '@/features/dashboard/types/branch-dashboard';
import type { OrganisationDashboardOverview } from '@/features/dashboard/types/organisation-dashboard';

type CompanyDashboardApiResponse = Readonly<{
  success: boolean;
  data: DashboardOverview;
  source?: 'backend' | 'fallback';
  loadError?: string | null;
  message?: string;
}>;

type OrganisationDashboardApiResponse = Readonly<{
  success: boolean;
  data: OrganisationDashboardOverview;
  source?: 'backend' | 'fallback';
  loadError?: string | null;
  message?: string;
}>;

type BranchDashboardApiResponse = Readonly<{
  success: boolean;
  data: BranchDashboardOverview;
  source?: 'backend' | 'fallback';
  loadError?: string | null;
  message?: string;
}>;

const companyDashboardCache = createClientResourceCache<CompanyDashboardApiResponse, [string]>(
  (queryKey) => `/api/dashboard/overview?${queryKey}`,
  (queryKey) => queryKey,
);

const organisationDashboardCache = createClientResourceCache<
  OrganisationDashboardApiResponse,
  [string]
>(
  (queryKey) =>
    queryKey ? `/api/dashboard/organisation?${queryKey}` : '/api/dashboard/organisation',
  (queryKey) => queryKey || '_default',
);

const branchDashboardCache = createClientResourceCache<BranchDashboardApiResponse, [string]>(
  (queryKey) => (queryKey ? `/api/dashboard/branch?${queryKey}` : '/api/dashboard/branch'),
  (queryKey) => queryKey || '_default',
);

export function fetchCompanyDashboardJson(queryKey: string) {
  return companyDashboardCache.fetchResource(undefined, queryKey);
}

export function fetchOrganisationDashboardJson(queryKey: string) {
  return organisationDashboardCache.fetchResource(undefined, queryKey);
}

export function fetchBranchDashboardJson(queryKey: string) {
  return branchDashboardCache.fetchResource(undefined, queryKey);
}

export function buildCompanyDashboardQueryKey(outletId: string, companyId: string | null): string {
  const params = new URLSearchParams();
  params.set('outlet', outletId);
  if (companyId) params.set('company_id', companyId);
  return params.toString();
}

export function buildDashboardQueryKey(
  searchParams: Readonly<URLSearchParams> | null | undefined,
): string {
  if (!searchParams) return '';
  const params = new URLSearchParams();
  searchParams.forEach((value, key) => {
    params.set(key, value);
  });
  return params.toString();
}
