'use client';

import { useQuery } from '@tanstack/react-query';
import type { BranchListItem } from '../types';

export const branchesQueryKeys = {
  all: ['branches'] as const,
  list: (companyId?: string, scope?: string) =>
    [...branchesQueryKeys.all, 'list', scope ?? 'all', companyId ?? 'all'] as const,
};

type ApiBranchResponse = Readonly<{
  id: string | number;
  branch_id?: string | number;
  name?: string;
  branch_name?: string;
  code?: string | null;
  branch_code?: string | null;
  company_id?: string | number;
  companyId?: string | number;
  company_name?: string | null;
  companyName?: string | null;
  city?: string | null;
  location?: string | null;
  status?: string | null;
  is_default?: boolean;
}>;

async function fetchBranchesList(
  companyId?: string,
  scope?: 'organisation' | 'company',
): Promise<BranchListItem[]> {
  const params = new URLSearchParams();
  if (companyId) params.set('company_id', companyId);
  if (scope) params.set('scope', scope);
  const query = params.toString();
  const url = query ? `/api/branches?${query}` : '/api/branches';
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch branches');
  }
  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.message ?? 'Failed to fetch branches');
  }

  const rawItems: ApiBranchResponse[] = json.data.items ?? [];
  return rawItems.map((item) => {
    const rawStatus = String(item.status ?? 'active')
      .toLowerCase()
      .trim();
    const status =
      rawStatus === 'inactive' || rawStatus === 'disabled' || rawStatus === 'closed'
        ? 'inactive'
        : 'active';

    return {
      id: item.id ?? item.branch_id ?? '',
      companyId: item.company_id ?? item.companyId ?? '',
      companyName: item.company_name ?? item.companyName ?? null,
      name: item.name ?? item.branch_name ?? 'Branch',
      code: item.code ?? item.branch_code ?? null,
      city: item.city ?? item.location ?? null,
      status,
      isDefault: Boolean(item.is_default),
    };
  });
}

export function useBranchesList(companyId?: string, scope?: 'organisation' | 'company') {
  return useQuery({
    queryKey: branchesQueryKeys.list(companyId, scope),
    queryFn: () => fetchBranchesList(companyId, scope),
    staleTime: 30_000,
  });
}
