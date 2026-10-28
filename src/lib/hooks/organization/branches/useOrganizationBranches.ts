'use client';

import { useMemo } from 'react';

import { enrichBranchesWithCompanyNames } from '@/lib/helpers/organizationBranches';
import {
  loadCompanyById,
  loadOrganizationCompanies,
  shouldLoadOrganizationCompanyList,
} from '@/lib/helpers/organizationCompanies';
import type { CompanyListItem } from '@/lib/schemas/organization/companies/companyListSchema';
import { useQuery } from '@/lib/hooks/api/useQuery';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';
import {
  parsePagedBranchList,
  type BranchListItem,
  type BranchListParams,
  type PagedBranchListData,
} from '@/lib/schemas/organization/branches/branchListSchema';
import { api } from '@/services/api/browserClient';
import ApiUrlsV1 from '@/services/api/ApiUrlsV1';
import type { QueryParams } from '@/services/api/types';
import type { JsonValue } from '@/types/json';
import { useSidebarStore } from '@/stores/sidebarStore';

export type UseOrganizationBranchesOptions = Readonly<{
  organizationId?: number;
  companyId?: number;
  scope?: 'organization' | 'company';
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  page?: number;
  pageSize?: number;
  initialBranches?: BranchListItem[];
}>;

function branchListQueryParams(params: BranchListParams): QueryParams {
  return {
    page: params.page ?? 1,
    page_size: params.page_size ?? 10,
    ...(params.company_id != null ? { company_id: params.company_id } : {}),
    ...(params.organization_id != null ? { organization_id: params.organization_id } : {}),
    ...(params.search?.trim() ? { search: params.search.trim() } : {}),
    ...(params.status ? { status: params.status } : {}),
  };
}

function emptyPagedList(pageSize: number): PagedBranchListData {
  return { items: [], total: 0, page: 1, page_size: pageSize };
}

/**
 * All Branches list.
 * GET /v1/branches?company_id&organization_id&search&status&page&page_size
 */
export function useOrganizationBranches({
  organizationId,
  companyId,
  scope = 'organization',
  search = '',
  status = 'all',
  page = 1,
  pageSize = 10,
  initialBranches,
}: UseOrganizationBranchesOptions) {
  const role = useSidebarStore((state) => state.role || state.user?.role || '');
  const authScope = useSidebarStore((state) => state.account?.scope ?? '');
  const debouncedSearch = useDebouncedValue(search, 1500);

  const scopedCompanyId = scope === 'company' ? companyId : undefined;
  const scopedOrganizationId =
    scopedCompanyId == null && organizationId != null ? organizationId : undefined;

  const listParams = useMemo<BranchListParams>(
    () => ({
      page,
      page_size: pageSize,
      ...(scopedCompanyId != null ? { company_id: scopedCompanyId } : {}),
      ...(scopedOrganizationId != null ? { organization_id: scopedOrganizationId } : {}),
      ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
      ...(status !== 'all' ? { status } : {}),
    }),
    [debouncedSearch, page, pageSize, scopedCompanyId, scopedOrganizationId, status],
  );

  const catalogParams = useMemo<BranchListParams>(
    () => ({
      page: 1,
      page_size: 100,
      ...(scopedCompanyId != null ? { company_id: scopedCompanyId } : {}),
      ...(scopedOrganizationId != null ? { organization_id: scopedOrganizationId } : {}),
    }),
    [scopedCompanyId, scopedOrganizationId],
  );

  const enabled =
    Boolean(role?.trim()) && (scopedCompanyId != null || scopedOrganizationId != null);

  const companyListContext = useMemo(
    () => ({
      role,
      authScope,
      companyId: scopedCompanyId,
      scope,
    }),
    [authScope, role, scope, scopedCompanyId],
  );

  const canLoadCompanyDirectory = shouldLoadOrganizationCompanyList(companyListContext);

  const companiesQuery = useQuery({
    queryKey: [
      'organization',
      'companies',
      'directory',
      scopedOrganizationId,
      scopedCompanyId,
      scope,
      role,
    ],
    queryFn: async ({ signal }) => {
      const get = (path: string, params?: QueryParams) => api.get<JsonValue>(path, params, signal);

      if (scopedOrganizationId != null && canLoadCompanyDirectory) {
        return loadOrganizationCompanies(scopedOrganizationId, get, companyListContext);
      }

      if (scopedCompanyId != null) {
        const company = await loadCompanyById(scopedCompanyId, get);
        return company ? [company] : [];
      }

      return [] as CompanyListItem[];
    },
    enabled:
      enabled && (canLoadCompanyDirectory ? scopedOrganizationId != null : scopedCompanyId != null),
    staleTime: 60_000,
  });

  const companies = companiesQuery.data ?? [];

  const listQuery = useQuery({
    queryKey: ['organization', 'branches', 'list', listParams, scope, role],
    queryFn: async ({ signal }) => {
      const payload = await api.get(
        ApiUrlsV1.restaurant.branches,
        branchListQueryParams(listParams),
        signal,
      );
      return parsePagedBranchList(payload, scopedCompanyId);
    },
    initialData:
      initialBranches && page === 1 && !debouncedSearch.trim() && status === 'all'
        ? {
            items: initialBranches,
            total: initialBranches.length,
            page: 1,
            page_size: pageSize,
          }
        : undefined,
    enabled,
    placeholderData: (previous) => previous,
    staleTime: 30_000,
  });

  const catalogQuery = useQuery({
    queryKey: ['organization', 'branches', 'catalog', catalogParams, scope, role],
    queryFn: async ({ signal }) => {
      const payload = await api.get(
        ApiUrlsV1.restaurant.branches,
        branchListQueryParams(catalogParams),
        signal,
      );
      return parsePagedBranchList(payload, scopedCompanyId);
    },
    enabled,
    staleTime: 30_000,
  });

  const items = useMemo(
    () => enrichBranchesWithCompanyNames(listQuery.data?.items ?? [], companies),
    [companies, listQuery.data?.items],
  );
  const total = listQuery.data?.total ?? 0;
  const catalogItems = useMemo(
    () => enrichBranchesWithCompanyNames(catalogQuery.data?.items ?? [], companies),
    [catalogQuery.data?.items, companies],
  );
  const catalogTotal = catalogQuery.data?.total ?? catalogItems.length;
  const activeCount = catalogItems.filter((branch) => branch.status === 'active').length;
  const counts = {
    all: catalogTotal,
    active: activeCount,
    inactive: Math.max(0, catalogTotal - activeCount),
  };

  return {
    ...listQuery,
    data: listQuery.data ?? emptyPagedList(pageSize),
    items,
    total,
    counts,
    refetch: async () => {
      await Promise.all([listQuery.refetch(), catalogQuery.refetch(), companiesQuery.refetch()]);
    },
  };
}
