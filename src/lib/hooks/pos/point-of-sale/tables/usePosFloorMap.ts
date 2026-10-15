'use client';

import { useQuery } from '@tanstack/react-query';

import { parsePosFloorMap } from '@/lib/schemas/pos/point-of-sale/tables/floorMapSchema';
import { api } from '@/services/api/browserClient';
import { restaurantSectionFloorMapPath } from '@/services/api/ApiUrlsV1';

const floorMapKey = (
  branchId: number | undefined,
  floorId: number | undefined,
  sectionId: number | undefined,
) => ['pos', 'point-of-sale', 'tables', 'floor-map', branchId, floorId, sectionId] as const;

/**
 * Live floor plan tables for POS Tables / Dine In.
 * GET /v1/branches/{branch_id}/floors/{floor_id}/sections/{section_id}/floor-map
 */
export function usePosFloorMap(
  branchId: number | undefined,
  floorId: number | undefined,
  sectionId: number | undefined,
) {
  return useQuery({
    queryKey: floorMapKey(branchId, floorId, sectionId),
    enabled:
      typeof branchId === 'number' && typeof floorId === 'number' && typeof sectionId === 'number',
    staleTime: 15_000,
    queryFn: async ({ signal }) => {
      const payload = await api.get(
        restaurantSectionFloorMapPath(branchId as number, floorId as number, sectionId as number),
        undefined,
        signal,
      );
      return parsePosFloorMap(payload);
    },
  });
}
