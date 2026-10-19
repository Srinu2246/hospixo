'use client';

import { useQuery } from '@/lib/hooks/api/useQuery';

import {
  loadOrganizationCompanies,
  shouldLoadOrganizationCompanyList,
} from '@/lib/helpers/organizationCompanies';
import { loadOrganizationBranches } from '@/lib/helpers/organizationBranches';
import type { BranchListItem } from '@/lib/schemas/organization/branches/branchListSchema';
import type { CompanyListItem } from '@/lib/schemas/organization/companies/companyListSchema';
import { api } from '@/services/api/browserClient';
import { useSidebarStore } from '@/stores/sidebarStore';

import type { DashboardLevel } from '@/features/dashboard/types/dashboard.types';

export type DashboardDirectory = {
  companies: CompanyListItem[];
  branches: BranchListItem[];
};

export function useDashboardDirectory(
  organizationId: number | undefined,
  options: {
    companyId?: number;
    dashboardLevel: DashboardLevel;
  },
) {
  const { companyId, dashboardLevel } = options;
  const role = useSidebarStore((state) => state.role || state.user?.role || '');
  const authScope = useSidebarStore((state) => state.account?.scope ?? '');

  const fetchCompanies = shouldLoadOrganizationCompanyList({
    role,
    authScope,
    companyId,
    scope: dashboardLevel,
  });
  const fetchBranches = dashboardLevel !== 'organization';

  const companiesQuery = useQuery({
    queryKey: ['organization', 'companies', organizationId ?? 'session', role, authScope],
    queryFn: () =>
      loadOrganizationCompanies(organizationId, (path, params) => api.get<unknown>(path, params), {
        role,
        authScope,
        scope: dashboardLevel,
      }),
    enabled: fetchCompanies && organizationId != null,
    staleTime: 30_000,
    refetchOnMount: false,
  });

  const branchesQuery = useQuery({
    queryKey: ['dashboard', 'branches', organizationId ?? 'session', companyId ?? 'all', role],
    queryFn: () =>
      loadOrganizationBranches(
        organizationId,
        companiesQuery.data ?? [],
        (path, params) => api.get<unknown>(path, params),
        companyId,
      ),
    enabled: fetchBranches && organizationId != null && companyId != null,
    staleTime: 30_000,
    refetchOnMount: false,
  });

  const isLoading =
    (fetchCompanies && companiesQuery.isLoading) || (fetchBranches && branchesQuery.isLoading);

  return {
    data: {
      companies: companiesQuery.data ?? [],
      branches: branchesQuery.data ?? [],
    } satisfies DashboardDirectory,
    isLoading,
    isPending: isLoading,
    isError: companiesQuery.isError || branchesQuery.isError,
    error: companiesQuery.error ?? branchesQuery.error,
    isFetching: companiesQuery.isFetching || branchesQuery.isFetching,
  };
}
