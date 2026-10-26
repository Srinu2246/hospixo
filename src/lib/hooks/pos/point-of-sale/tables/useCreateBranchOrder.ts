'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useActiveBranchId } from '@/lib/hooks/menu/menus/menusHooks';
import {
  parseBranchOrder,
  type CreateBranchOrderBody,
} from '@/lib/schemas/pos/point-of-sale/tables/createBranchOrderSchema';
import { api } from '@/services/api/browserClient';
import ApiUrlsV1 from '@/services/api/ApiUrlsV1';

/**
 * Open a dine-in order for a table.
 * POST /v1/branches/{branch_id}/orders
 */
export function useCreateBranchOrder(branchId?: number) {
  const activeBranchId = useActiveBranchId(branchId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateBranchOrderBody) => {
      const payload = await api.post(
        ApiUrlsV1.pos.pointOfSale.allOrders.create(activeBranchId),
        body,
        { silent: true },
      );
      return parseBranchOrder(payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['pos', 'point-of-sale', 'tables', 'availability'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['pos', 'point-of-sale', 'all-orders'],
        }),
      ]);
    },
  });
}
