'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  parseBranchOrder,
  type CreateBranchOrderBody,
} from '@/lib/schemas/pos/point-of-sale/tables/createBranchOrderSchema';
import { api } from '@/services/api/browserClient';
import { branchOrdersPath } from '@/services/api/ApiUrlsV1';

export type CreateBranchOrderVariables = {
  branchId: number;
  body: CreateBranchOrderBody;
};

/**
 * Create a dine-in order for a table.
 * POST /v1/branches/{branch_id}/orders
 */
export function useCreateBranchOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ branchId, body }: CreateBranchOrderVariables) => {
      const payload = await api.post(branchOrdersPath(branchId), body);
      return parseBranchOrder(payload);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['pos', 'point-of-sale', 'tables', 'availability', variables.branchId],
      });
    },
  });
}
