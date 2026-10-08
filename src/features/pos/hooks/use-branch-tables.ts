'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchBranchTablesOverview } from '@/features/pos/api/branch-tables';

export const branchTablesQueryKey = (floorId?: number | null) =>
  ['pos', 'branch-tables', floorId ?? 'all'] as const;

export function useBranchTablesOverview(floorId?: number | null, enabled = true) {
  return useQuery({
    queryKey: branchTablesQueryKey(floorId),
    queryFn: () => fetchBranchTablesOverview(floorId),
    enabled,
  });
}
