'use client';

import { useQuery } from '@tanstack/react-query';

import { loadBranchDirectory } from '@/lib/helpers/organizationBranches';
import type { BranchListItem } from '@/lib/schemas/organization/branches/branchListSchema';
import { api } from '@/services/api/browserClient';
import { useSidebarStore } from '@/stores/sidebarStore';

/**
 * Branches for the All Branches screen.
 * With `companyId` the list is that company's outlets; without it every company in the organisation.
 */
export function useOrganizationBranches(
  organizationId?: number,
  companyId?: number,
  initialBranches?: BranchListItem[],
  scope: 'organization' | 'company' = 'organization',
) {
  const role = useSidebarStore((state) => state.role || state.user?.role || '');
  const authScope = useSidebarStore((state) => state.account?.scope ?? '');

  return useQuery({
    queryKey: [
      'organization',
      'branches',
      organizationId ?? 'session',
      companyId ?? 'all',
      scope,
      role,
    ],
    queryFn: ({ signal }) =>
      loadBranchDirectory(
        organizationId,
        companyId,
        (path, params) => api.get<unknown>(path, params, signal),
        { role, authScope, scope },
      ),
    initialData: initialBranches,
    enabled: Boolean(role?.trim()),
    staleTime: 30_000,
  });
}
