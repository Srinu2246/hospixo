'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchDineInMenu } from '@/features/pos/api/dine-in-menu';
import { useFloorBranchOutletId } from '@/features/floor-table-setup/hooks/use-floor-branch-outlet';

export const dineInMenuQueryKey = (outletId: string | null) =>
  ['pos', 'dine-in', 'menu', outletId ?? 'none'] as const;

export function useDineInMenu() {
  const outletId = useFloorBranchOutletId();

  return useQuery({
    queryKey: dineInMenuQueryKey(outletId),
    queryFn: async () => {
      const response = await fetchDineInMenu(outletId);
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Unable to load menu.');
      }
      if (response.data.loadError && response.data.items.length === 0) {
        throw new Error(response.data.loadError);
      }
      return response.data;
    },
  });
}
