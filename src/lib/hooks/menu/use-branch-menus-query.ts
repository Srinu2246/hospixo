'use client';

import { useQuery } from '@tanstack/react-query';

import { parseBranchMenuAssignmentList } from '@/lib/schemas/menu/branchMenuAssignmentSchema';
import { api } from '@/services/api/browserClient';
import { restaurantBranchMenusPath } from '@/services/api/ApiUrlsV1';

export const branchMenusQueryKey = (branchId: string | number) =>
  ['menu', 'branch-menus', String(branchId)] as const;

async function fetchBranchMenus(branchId: string | number) {
  const payload = await api.get<unknown>(restaurantBranchMenusPath(branchId));
  return parseBranchMenuAssignmentList(payload);
}

export function useBranchMenusQuery(branchId: string | number | null | undefined, enabled = true) {
  return useQuery({
    queryKey: branchMenusQueryKey(branchId ?? 'unknown'),
    queryFn: () => {
      if (branchId == null) throw new Error('Branch id is required');
      return fetchBranchMenus(branchId);
    },
    enabled: enabled && branchId != null,
  });
}
