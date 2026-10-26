'use client';

import { useQuery } from '@tanstack/react-query';

import { useActiveBranchId } from '@/lib/hooks/menu/menus/menusHooks';
import { parseBranchOrderDetail } from '@/lib/schemas/pos/point-of-sale/all-orders/branchOrderDetailSchema';
import { api } from '@/services/api/browserClient';
import ApiUrlsV1 from '@/services/api/ApiUrlsV1';

export const branchOrderQueryKey = (
  branchId: number | undefined,
  orderId: string | number | null | undefined,
) => ['pos', 'point-of-sale', 'all-orders', 'detail', branchId, orderId] as const;

/**
 * Open POS order detail with line items.
 * GET /v1/branches/{branch_id}/orders/{order_id}
 */
export function useBranchOrder(orderId: string | number | null | undefined, branchId?: number) {
  const activeBranchId = useActiveBranchId(branchId);
  const hasOrderId =
    orderId != null && String(orderId).trim() !== '' && String(orderId) !== 'undefined';

  return useQuery({
    queryKey: branchOrderQueryKey(activeBranchId, orderId),
    enabled: typeof activeBranchId === 'number' && hasOrderId,
    staleTime: 15_000,
    queryFn: async ({ signal }) => {
      const payload = await api.get(
        ApiUrlsV1.pos.pointOfSale.allOrders.detail(activeBranchId, orderId as string | number),
        undefined,
        signal,
      );
      return parseBranchOrderDetail(payload);
    },
  });
}
