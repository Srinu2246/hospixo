'use client';

import { useQuery } from '@tanstack/react-query';

import { parseTableList } from '@/lib/schemas/floor-and-table-setup/floors';
import {
  mergeSectionTablesWithOpenOrders,
  parseOpenOrders,
} from '@/lib/schemas/pos/point-of-sale/tables/openOrdersSchema';
import { api } from '@/services/api/browserClient';
import { branchOrdersPath, restaurantSectionTablesPath } from '@/services/api/ApiUrlsV1';

const floorTablesKey = (
  branchId: number | undefined,
  floorId: number | undefined,
  sectionId: number | undefined,
) => ['pos', 'point-of-sale', 'tables', 'open-orders', branchId, floorId, sectionId] as const;

/**
 * Floor-plan cards for POS Tables / Dine In.
 * Tables: GET .../sections/{section_id}/tables
 * Live status: GET /v1/branches/{branch_id}/orders?status=open&order_type=dine_in
 */
export function usePosFloorTables(
  branchId: number | undefined,
  floorId: number | undefined,
  sectionId: number | undefined,
) {
  return useQuery({
    queryKey: floorTablesKey(branchId, floorId, sectionId),
    enabled:
      typeof branchId === 'number' && typeof floorId === 'number' && typeof sectionId === 'number',
    staleTime: 15_000,
    queryFn: async ({ signal }) => {
      const resolvedBranchId = branchId as number;
      const resolvedFloorId = floorId as number;
      const resolvedSectionId = sectionId as number;

      const [tablesPayload, ordersPayload] = await Promise.all([
        api.get(
          restaurantSectionTablesPath(resolvedBranchId, resolvedFloorId, resolvedSectionId),
          { page: 1, page_size: 50, status: 'active' },
          signal,
        ),
        api.get(
          branchOrdersPath(resolvedBranchId),
          {
            status: 'open',
            order_type: 'dine_in',
            floor_id: resolvedFloorId,
            section_id: resolvedSectionId,
            page: 1,
            page_size: 50,
          },
          signal,
        ),
      ]);

      return mergeSectionTablesWithOpenOrders(
        parseTableList(tablesPayload),
        parseOpenOrders(ordersPayload),
        resolvedFloorId,
        resolvedSectionId,
      );
    },
  });
}
