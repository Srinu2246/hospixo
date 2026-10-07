'use client';

import { useQuery } from '@tanstack/react-query';
import type { CompanyListItem } from '../types';

export const companiesQueryKeys = {
  all: ['companies'] as const,
  list: (orgId?: string) => [...companiesQueryKeys.all, 'list', orgId ?? 'all'] as const,
};

type ApiCompanyResponse = Readonly<{
  id: string | number;
  name?: string;
  business_name?: string;
  company_name?: string;
  code?: string | null;
  company_code?: string | null;
  business_type?: string | null;
  industry?: string | null;
  status?: string | null;
  branch_count?: number;
  branches_count?: number;
  user_count?: number;
  users_count?: number;
  created_at?: string | null;
}>;

async function fetchCompaniesList(orgId?: string): Promise<CompanyListItem[]> {
  const url = orgId ? `/api/companies?org_id=${encodeURIComponent(orgId)}` : '/api/companies';
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch companies');
  }
  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.message ?? 'Failed to fetch companies');
  }

  const rawItems: ApiCompanyResponse[] = json.data.items ?? [];
  return rawItems.map((item) => {
    const rawStatus = String(item.status ?? 'active')
      .toLowerCase()
      .trim();
    const status = rawStatus === 'inactive' || rawStatus === 'disabled' ? 'inactive' : 'active';

    return {
      id: item.id,
      name: item.name ?? item.business_name ?? item.company_name ?? 'Company',
      code: item.code ?? item.company_code ?? null,
      businessType: item.business_type ?? item.industry ?? 'Hospitality',
      status,
      branchCount: item.branch_count ?? item.branches_count ?? 0,
      userCount: item.user_count ?? item.users_count ?? 0,
      createdAt: item.created_at ?? null,
    };
  });
}

export function useCompaniesList(orgId?: string) {
  return useQuery({
    queryKey: companiesQueryKeys.list(orgId),
    queryFn: () => fetchCompaniesList(orgId),
    staleTime: 30_000,
  });
}
