'use client';

import { useQuery } from '@tanstack/react-query';

import { loadOrganizationBranches } from '@/lib/helpers/organizationBranches';
import { loadOrganizationCompanies } from '@/lib/helpers/organizationCompanies';
import type { BranchListItem } from '@/lib/schemas/organization/branches/branchListSchema';
import type { CompanyListItem } from '@/lib/schemas/organization/companies/companyListSchema';
import { api } from '@/services/api/browserClient';

export type DashboardDirectory = {
  companies: CompanyListItem[];
  branches: BranchListItem[];
};

export function useDashboardDirectory(organizationId?: number, companyId?: number) {
  return useQuery({
    queryKey: ['dashboard', 'directory', organizationId ?? 'session', companyId ?? 'all'],
    queryFn: async ({ signal }) => {
      const get = (
        path: string,
        params?: Record<string, string | number | boolean | null | undefined>,
      ) => api.get<unknown>(path, params, signal);
      const companies = await loadOrganizationCompanies(organizationId, get);
      const branches = await loadOrganizationBranches(organizationId, companies, get, companyId);
      return { companies, branches } satisfies DashboardDirectory;
    },
    enabled: true,
    staleTime: 30_000,
  });
}
