'use client';

import { useQuery } from '@tanstack/react-query';

import { loadBranchDirectory } from '@/lib/helpers/organizationBranches';
import type { BranchListItem } from '@/lib/schemas/organization/branches/branchListSchema';
import { api } from '@/services/api/browserClient';

/**
 * Branches for the All Branches screen.
 * With `companyId` the list is that company's outlets; without it every company in the organisation.
 */
export function useOrganizationBranches(
  organizationId?: number,
  companyId?: number,
  initialBranches?: BranchListItem[],
) {
  return useQuery({
    queryKey: ['organization', 'branches', organizationId ?? 'session', companyId ?? 'all'],
    queryFn: ({ signal }) =>
      loadBranchDirectory(organizationId, companyId, (path, params) =>
        api.get<unknown>(path, params, signal),
      ),
    initialData: initialBranches,
    staleTime: 30_000,
  });
}
