'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useActiveBranchId } from '@/lib/hooks/menu/menus/menusHooks';
import { branchOrderQueryKey } from '@/lib/hooks/pos/point-of-sale/all-orders/useBranchOrder';
import {
  parseAddBranchOrderItems,
  parseSubmitBranchOrder,
  type AddBranchOrderItemsBody,
} from '@/lib/schemas/pos/point-of-sale/all-orders/branchOrderItemsSchema';
import { api } from '@/services/api/browserClient';
import ApiUrlsV1 from '@/services/api/ApiUrlsV1';

function requireOrderId(orderId: string | number | null | undefined): string | number {
  if (orderId == null || String(orderId).trim() === '' || String(orderId) === 'undefined') {
    throw new Error('Order id is required');
  }
  return orderId;
}

/**
 * POST /v1/branches/{branch_id}/orders/{order_id}/items
 * Then callers should POST submit for KOT.
 */
export function useAddBranchOrderItems(branchId?: number) {
  const activeBranchId = useActiveBranchId(branchId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { orderId: string | number; body: AddBranchOrderItemsBody }) => {
      const orderId = requireOrderId(input.orderId);
      const payload = await api.post(
        ApiUrlsV1.pos.pointOfSale.allOrders.items(activeBranchId, orderId),
        input.body,
        { silent: true },
      );
      return parseAddBranchOrderItems(payload);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: branchOrderQueryKey(activeBranchId, variables.orderId),
      });
    },
  });
}

/** POST /v1/branches/{branch_id}/orders/{order_id}/submit — send order to KOT. */
export function useSubmitBranchOrder(branchId?: number) {
  const activeBranchId = useActiveBranchId(branchId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string | number) => {
      const id = requireOrderId(orderId);
      const payload = await api.post(
        ApiUrlsV1.pos.pointOfSale.allOrders.submit(activeBranchId, id),
        {},
        { silent: true },
      );
      return parseSubmitBranchOrder(payload);
    },
    onSuccess: async (_data, orderId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: branchOrderQueryKey(activeBranchId, orderId),
        }),
        queryClient.invalidateQueries({
          queryKey: ['pos', 'point-of-sale', 'all-orders'],
        }),
      ]);
    },
  });
}
