'use client';

import { useMemo } from 'react';
import { useQuery } from '@/lib/hooks/api/useQuery';

import {
  calculateCompanyUserCounts,
  enrichCompaniesWithUserCounts,
  fetchOrganizationUsers,
  loadOrganizationCompanies,
  mergeCompaniesWithBranchCounts,
  shouldLoadOrganizationCompanyList,
} from '@/lib/helpers/organizationCompanies';
import { loadOrganizationBranches } from '@/lib/helpers/organizationBranches';
import {
  parseBranchList,
  type BranchListItem,
} from '@/lib/schemas/organization/branches/branchListSchema';
import type { CompanyListItem } from '@/lib/schemas/organization/companies/companyListSchema';
import { api } from '@/services/api/browserClient';
import ApiUrlsV1 from '@/services/api/ApiUrlsV1';
import type { QueryParams } from '@/services/api/types';
import type { JsonValue } from '@/types/json';
import { useSidebarStore } from '@/stores/sidebarStore';

export type UseOrganizationCompaniesOptions = Readonly<{
  enabled?: boolean;
}>;

export function useOrganizationCompanies(
  organizationId?: number,
  initialCompanies?: CompanyListItem[],
  options?: UseOrganizationCompaniesOptions,
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

  const companiesQuery = useQuery({
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
    enabled: (options?.enabled ?? true) && canFetch && orgId != null,
    staleTime: 30_000,
  });

  const usersQuery = useQuery({
    queryKey: ['organization', 'users', 'company-counts', orgId ?? 'session', role, authScope],
    queryFn: async ({ signal }) => {
      const get = (path: string, params?: QueryParams) => api.get<JsonValue>(path, params, signal);
      return fetchOrganizationUsers(get, { organization_id: orgId });
    },
    enabled: canFetch && orgId != null,
    staleTime: 60_000,
  });

  const branchesQuery = useQuery({
    queryKey: ['organization', 'branches', 'for-companies', orgId ?? 'session', role, authScope],
    queryFn: async ({ signal }) => {
      const payload = await api.get<JsonValue>(
        ApiUrlsV1.restaurant.branches,
        { organization_id: orgId, page: 1, page_size: 100 },
        signal,
      );
      return parseBranchList(payload);
    },
    enabled: canFetch && orgId != null,
    staleTime: 60_000,
  });

  const rawCompanies = useMemo(() => companiesQuery.data ?? [], [companiesQuery.data]);
  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);
  const branches = useMemo(() => branchesQuery.data ?? [], [branchesQuery.data]);

  const data = useMemo(() => {
    if (!rawCompanies.length) return rawCompanies;
    if (!users.length) return rawCompanies;

    const counts = calculateCompanyUserCounts(users, rawCompanies, branches);
    return enrichCompaniesWithUserCounts(rawCompanies, counts);
  }, [branches, rawCompanies, users]);

  return {
    ...companiesQuery,
    data,
    refetch: async () => {
      await Promise.all([companiesQuery.refetch(), usersQuery.refetch(), branchesQuery.refetch()]);
    },
  };
}
