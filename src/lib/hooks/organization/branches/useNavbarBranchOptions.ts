'use client';

import { useMemo } from 'react';

import type { DropdownOption } from '@/components/shared/form-fields/Dropdown';
import { loadBranchDirectory } from '@/lib/helpers/organizationBranches';
import { useQuery } from '@/lib/hooks/api/useQuery';
import { api } from '@/services/api/browserClient';
import { useSidebarStore } from '@/stores/sidebarStore';

export type UseNavbarBranchOptionsConfig = Readonly<{
  /** When false, skips companies/branches directory API calls. */
  enabled?: boolean;
}>;

/**
 * Branch/outlet options for the top navbar (mobile/tablet selector).
 * Loads from the same directory API as organization branch screens — no mock list.
 */
export function useNavbarBranchOptions(config?: UseNavbarBranchOptionsConfig) {
  const context = useSidebarStore((state) => state.context);
  const role = useSidebarStore((state) => state.role || state.user?.role || '');
  const authScope = useSidebarStore((state) => state.account?.scope ?? '');

  const scope: 'organization' | 'company' | 'branch' =
    context.branchId != null ? 'branch' : context.companyId != null ? 'company' : 'organization';

  const query = useQuery({
    queryKey: [
      'navbar',
      'branches',
      context.organizationId ?? 'session',
      context.companyId ?? 'all',
      scope,
      role,
    ],
    queryFn: ({ signal }) =>
      loadBranchDirectory(
        context.organizationId,
        context.companyId,
        (path, params) => api.get<unknown>(path, params, signal),
        { role, authScope, scope },
      ),
    enabled: (config?.enabled ?? true) && Boolean(role?.trim()),
    staleTime: 60_000,
  });

  const options: DropdownOption<string>[] = useMemo(() => {
    const fromApi = (query.data ?? []).map((branch) => ({
      id: String(branch.id),
      label: branch.name,
    }));

    if (context.branchId == null) {
      return fromApi;
    }

    const idStr = String(context.branchId);
    if (fromApi.some((option) => option.id === idStr)) {
      return fromApi;
    }

    return [
      {
        id: idStr,
        label: context.branchName?.trim() || `Branch ${context.branchId}`,
      },
      ...fromApi,
    ];
  }, [query.data, context.branchId, context.branchName]);

  return {
    options,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
