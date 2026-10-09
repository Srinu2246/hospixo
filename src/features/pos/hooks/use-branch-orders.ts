'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchOnlineOrders,
  fetchOpenOrders,
  fetchReadyOrders,
  patchBranchOrder,
  type PatchBranchOrderBody,
} from '@/features/pos/api/branch-orders';
import { kitchenOrdersQueryKey } from '@/features/kitchen/hooks/use-kitchen-orders';
import { useFloorBranchOutletId } from '@/features/floor-table-setup/hooks/use-floor-branch-outlet';

export const posOrdersScopeKey = (outletId: string | null) =>
  ['pos', 'orders', outletId ?? 'none'] as const;

export const onlineOrdersQueryKey = (outletId: string | null) =>
  [...posOrdersScopeKey(outletId), 'online'] as const;

export const readyOrdersQueryKey = (outletId: string | null) =>
  [...posOrdersScopeKey(outletId), 'ready'] as const;

export const openOrdersQueryKey = (outletId: string | null) =>
  [...posOrdersScopeKey(outletId), 'open'] as const;

function parseOrdersResponse<T extends { orders: unknown[]; loadError: string | null }>(
  response: { success: boolean; data?: T; message?: string },
  fallback: string,
): T {
  if (!response.success || !response.data) {
    throw new Error(response.message ?? fallback);
  }
  if (response.data.loadError && response.data.orders.length === 0) {
    throw new Error(response.data.loadError);
  }
  return response.data;
}

export function useOnlineOrdersQuery() {
  const outletId = useFloorBranchOutletId();

  return useQuery({
    queryKey: onlineOrdersQueryKey(outletId),
    queryFn: async () => {
      const response = await fetchOnlineOrders(outletId);
      return parseOrdersResponse(response, 'Unable to load online orders.');
    },
    refetchInterval: 30_000,
  });
}

export function useReadyOrdersQuery() {
  const outletId = useFloorBranchOutletId();

  return useQuery({
    queryKey: readyOrdersQueryKey(outletId),
    queryFn: async () => {
      const response = await fetchReadyOrders(outletId);
      return parseOrdersResponse(response, 'Unable to load ready orders.');
    },
    refetchInterval: 30_000,
  });
}

export function useOpenOrdersQuery() {
  const outletId = useFloorBranchOutletId();

  return useQuery({
    queryKey: openOrdersQueryKey(outletId),
    queryFn: async () => {
      const response = await fetchOpenOrders(outletId);
      return parseOrdersResponse(response, 'Unable to load orders.');
    },
    refetchInterval: 30_000,
  });
}

export function usePatchBranchOrderMutation() {
  const outletId = useFloorBranchOutletId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { orderId: string; body: PatchBranchOrderBody }) => {
      const result = await patchBranchOrder(input.orderId, input.body, outletId);
      if (!result.success) {
        throw new Error(result.message ?? 'Unable to update order.');
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: posOrdersScopeKey(outletId) });
      void queryClient.invalidateQueries({ queryKey: kitchenOrdersQueryKey(outletId) });
    },
  });
}
