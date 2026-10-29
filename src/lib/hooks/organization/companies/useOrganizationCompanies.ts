'use client';

import { useQuery } from '@/lib/hooks/api/useQuery';

import {
  loadOrganizationCompanies,
  mergeCompaniesWithBranchCounts,
  shouldLoadOrganizationCompanyList,
} from '@/lib/helpers/organizationCompanies';
import { loadOrganizationBranches } from '@/lib/helpers/organizationBranches';
import type { CompanyListItem } from '@/lib/schemas/organization/companies/companyListSchema';
import type { BranchListItem } from '@/lib/schemas/organization/branches/branchListSchema';
import { api } from '@/services/api/browserClient';
import type { QueryParams } from '@/services/api/types';
import type { JsonValue } from '@/types/json';
import { useSidebarStore } from '@/stores/sidebarStore';

export function useOrganizationCompanies(
  organizationId?: number,
  initialCompanies?: CompanyListItem[],
) {
  const role = useSidebarStore((state) => state.role || state.user?.role || '');
  const authScope = useSidebarStore((state) => state.account?.scope ?? '');
  const orgId = useSidebarStore(
    (state) => organizationId ?? state.account?.org_id ?? state.context.organizationId,
  );
  const canFetch = shouldLoadOrganizationCompanyList({
    role,
    authScope,
    scope: 'organization',
  });

  return useQuery({
    queryKey: ['organization', 'companies', orgId ?? 'session', role, authScope],
    queryFn: async () => {
      const getJson = (path: string, params?: QueryParams) => api.get<JsonValue>(path, params);
      const companies = await loadOrganizationCompanies(orgId, getJson, {
        role,
        authScope,
        scope: 'organization',
      });

      if (companies.length === 0) {
        return [];
      }

      let branches: BranchListItem[] = [];
      let branchesLoaded = false;
      try {
        branches = await loadOrganizationBranches(orgId, companies, getJson);
        branchesLoaded = true;
      } catch {
        branchesLoaded = false;
      }

      if (!branchesLoaded) {
        return companies;
      }

      return mergeCompaniesWithBranchCounts(companies, branches);
    },
    initialData: initialCompanies,
    enabled: canFetch && orgId != null,
    staleTime: 30_000,
    refetchOnMount: initialCompanies ? false : undefined,
  });
}
