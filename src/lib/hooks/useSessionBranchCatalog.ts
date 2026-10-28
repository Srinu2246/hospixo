'use client';

import { useMemo } from 'react';

import { isFallbackEntityName } from '@/lib/helpers/employees/userRolesHelpers';
import { useQuery } from '@/lib/hooks/api/useQuery';
import {
  parseBranchList,
  type BranchListItem,
} from '@/lib/schemas/organization/branches/branchListSchema';
import ApiUrlsV1 from '@/services/api/ApiUrlsV1';
import { api } from '@/services/api/browserClient';
import { useSidebarStore } from '@/stores/sidebarStore';

export type UseSessionBranchCatalogOptions = Readonly<{
  enabled?: boolean;
}>;

/** GET /v1/branches?company_id=… — branch names for the logged-in company (no useEffect). */
export function useSessionBranchCatalog(options?: UseSessionBranchCatalogOptions) {
  const companyId = useSidebarStore(
    (state) => state.context.companyId ?? state.account?.company_id ?? undefined,
  );
  const branchId = useSidebarStore(
    (state) => state.context.branchId ?? state.account?.branch_id ?? undefined,
  );
  const role = useSidebarStore((state) => state.role || state.user?.role || '');

  const enabled = (options?.enabled ?? true) && Boolean(role?.trim()) && companyId != null;

  const query = useQuery({
    queryKey: ['session', 'branches', 'catalog', companyId ?? 'none'],
    enabled,
    queryFn: async ({ signal }) => {
      const payload = await api.get(
        ApiUrlsV1.restaurant.branches,
        { company_id: companyId, page: 1, page_size: 100 },
        signal,
      );
      return parseBranchList(payload, companyId);
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  const resolveBranchName = useMemo(() => {
    return (id?: number | string | null): string | undefined => {
      if (id == null) return undefined;
      const match = query.data?.find((branch) => String(branch.id) === String(id));
      const name = match?.name?.trim();
      return name && !isFallbackEntityName(name) ? name : undefined;
    };
  }, [query.data]);

  const activeBranchName = useMemo(
    () => resolveBranchName(branchId),
    [resolveBranchName, branchId],
  );

  return {
    branches: query.data ?? ([] as BranchListItem[]),
    activeBranchName,
    resolveBranchName,
    isLoading: enabled && query.isFetching && !query.data,
  };
}
