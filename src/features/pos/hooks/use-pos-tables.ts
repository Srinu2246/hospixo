'use client';

import { useQuery } from '@tanstack/react-query';

import { posFloors, posTables } from '@/features/pos/config/tables';
import { fetchPosTables } from '@/features/pos/api/pos-tables';
import { useFloorBranchOutletId } from '@/features/floor-table-setup/hooks/use-floor-branch-outlet';

export const posTablesQueryKey = (outletId: string | null) =>
  ['pos', 'tables', outletId ?? 'none'] as const;

export function usePosTables() {
  const outletId = useFloorBranchOutletId();

  return useQuery({
    queryKey: posTablesQueryKey(outletId),
    queryFn: async () => {
      const response = await fetchPosTables(outletId);
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Unable to load tables.');
      }
      return response.data;
    },
    placeholderData: {
      floors: [...posFloors],
      tables: [...posTables],
      branchId: null,
      source: 'fallback' as const,
      loadError: null,
    },
  });
}
