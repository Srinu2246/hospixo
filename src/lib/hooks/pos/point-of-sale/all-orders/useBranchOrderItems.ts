'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { syncAfterWrite } from '@/lib/hooks/api/queryCacheSync';
import { useActiveBranchId } from '@/lib/hooks/menu/menus/menusHooks';
import { branchOrderQueryKey } from '@/lib/hooks/pos/point-of-sale/all-orders/useBranchOrder';
import {
  parseAddBranchOrderItems,
  parseRemoveBranchOrderItem,
  parseSubmitBranchOrder,
  submitBranchOrderBodySchema,
  type AddBranchOrderItemsBody,
  type SubmitBranchOrderBody,
} from '@/lib/schemas/pos/point-of-sale/all-orders/branchOrderItemsSchema';
import { api } from '@/services/api/browserClient';
import ApiUrlsV1 from '@/services/api/ApiUrlsV1';

function requireOrderId(orderId: string | number | null | undefined): string | number {
  if (orderId == null || String(orderId).trim() === '' || String(orderId) === 'undefined') {
    throw new Error('Order id is required');
  }
  return orderId;
}

async function syncBranchOrderLists(
  queryClient: ReturnType<typeof useQueryClient>,
  router: ReturnType<typeof useRouter>,
  branchId: number | undefined,
  orderId: string | number,
) {
  await syncAfterWrite(queryClient, router, {
    queryKeys: [branchOrderQueryKey(branchId, orderId), ['pos', 'point-of-sale', 'all-orders']],
  });
}

/** POST /v1/branches/{branch_id}/orders/{order_id}/items — add draft lines (menu Add +). */
export function useAddBranchOrderItems(branchId?: number) {
  const activeBranchId = useActiveBranchId(branchId);
  const queryClient = useQueryClient();
  const router = useRouter();

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
      await syncBranchOrderLists(queryClient, router, activeBranchId, variables.orderId);
    },
  });
}

export type SubmitBranchOrderInput = {
  orderId: string | number;
  expectedVersion: number;
  /** Optional — same key + branch/order replays without double fire. */
  idempotencyKey?: string;
};

export type RemoveBranchOrderItemInput = {
  orderId: string | number;
  itemId: string | number;
  expectedVersion: number;
};

/** DELETE /v1/branches/{branch_id}/orders/{order_id}/items/{item_id} */
export function useRemoveBranchOrderItem(branchId?: number) {
  const activeBranchId = useActiveBranchId(branchId);
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (input: RemoveBranchOrderItemInput) => {
      const orderId = requireOrderId(input.orderId);
      const itemId = requireOrderId(input.itemId);
      const payload = await api.delete(
        ApiUrlsV1.pos.pointOfSale.allOrders.item(activeBranchId, orderId, itemId),
        { expected_version: input.expectedVersion },
        { silent: true },
      );
      return parseRemoveBranchOrderItem(payload);
    },
    onSuccess: async (_data, variables) => {
      await syncBranchOrderLists(queryClient, router, activeBranchId, variables.orderId);
    },
  });
}

/** POST /v1/branches/{branch_id}/orders/{order_id}/submit — fire draft lines to kitchen (Send to KOT). */
export function useSubmitBranchOrder(branchId?: number) {
  const activeBranchId = useActiveBranchId(branchId);
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (input: SubmitBranchOrderInput) => {
      const id = requireOrderId(input.orderId);
      const body: SubmitBranchOrderBody = submitBranchOrderBodySchema.parse({
        expected_version: input.expectedVersion,
      });

      const headers: Record<string, string> | undefined = input.idempotencyKey
        ? { 'Idempotency-Key': input.idempotencyKey }
        : undefined;

      const payload = await api.post(
        ApiUrlsV1.pos.pointOfSale.allOrders.submit(activeBranchId, id),
        body,
        { silent: true, headers },
      );
      return parseSubmitBranchOrder(payload);
    },
    onSuccess: async (_data, variables) => {
      await syncBranchOrderLists(queryClient, router, activeBranchId, variables.orderId);
    },
  });
}
