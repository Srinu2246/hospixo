'use client';

import { useQuery } from '@/lib/hooks/api/useQuery';

import {
  parsePosFloorLayout,
  type PosFloorLayoutItem,
} from '@/lib/schemas/pos/point-of-sale/tables/floorLayoutSchema';
import { api } from '@/services/api/browserClient';
import { restaurantFloorsPath } from '@/services/api/ApiUrlsV1';

const floorLayoutKey = (branchId: number | undefined) =>
  ['pos', 'point-of-sale', 'tables', 'floors', branchId] as const;

/**
 * Active floors and nested sections for the POS table floor-plan filters.
 * GET /v1/branches/{branch_id}/floors?status=active
 */
export function usePosFloorLayout(
  branchId: number | undefined,
  initialData?: PosFloorLayoutItem[],
) {
  return useQuery({
    queryKey: floorLayoutKey(branchId),
    enabled: typeof branchId === 'number',
    initialData,
    staleTime: 30_000,
    queryFn: async ({ signal }) => {
      const payload = await api.get(
        restaurantFloorsPath(branchId as number),
        { status: 'active' },
        signal,
      );
      return parsePosFloorLayout(payload);
    },
  });
}
