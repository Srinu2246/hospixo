'use client';

import { useQuery } from '@/lib/hooks/api/useQuery';

import {
  mapTableAvailabilityToPosTables,
  parseTableAvailability,
} from '@/lib/schemas/pos/point-of-sale/tables/tableAvailabilitySchema';
import { api } from '@/services/api/browserClient';
import { branchTablesAvailabilityPath } from '@/services/api/ApiUrlsV1';

export const floorTablesQueryKey = (
  branchId: number | undefined,
  floorId: number | undefined,
  sectionId: number | undefined,
) => ['pos', 'point-of-sale', 'tables', 'availability', branchId, floorId, sectionId] as const;

/**
 * Floor-plan cards for POS Tables / Dine In.
 * GET /v1/branches/{branch_id}/tables/availability?floor_id&section_id&page&page_size
 */
export function usePosFloorTables(
  branchId: number | undefined,
  floorId: number | undefined,
  sectionId: number | undefined,
) {
  return useQuery({
    queryKey: floorTablesQueryKey(branchId, floorId, sectionId),
    enabled:
      typeof branchId === 'number' && typeof floorId === 'number' && typeof sectionId === 'number',
    staleTime: 15_000,
    queryFn: async ({ signal }) => {
      const resolvedBranchId = branchId as number;
      const resolvedFloorId = floorId as number;
      const resolvedSectionId = sectionId as number;

      const payload = await api.get(
        branchTablesAvailabilityPath(resolvedBranchId),
        {
          branch_id: resolvedBranchId,
          floor_id: resolvedFloorId,
          section_id: resolvedSectionId,
          page: 1,
          page_size: 50,
        },
        signal,
      );

      return mapTableAvailabilityToPosTables(parseTableAvailability(payload));
    },
  });
}
