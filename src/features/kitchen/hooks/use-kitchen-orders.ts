'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { KitchenOrderStatus } from '@/features/kitchen/types';
import { fetchKitchenOrders } from '@/features/kitchen/api/kitchen-orders';
import { useFloorBranchOutletId } from '@/features/floor-table-setup/hooks/use-floor-branch-outlet';

export const kitchenOrdersQueryKey = (outletId: string | null) =>
  ['kitchen', 'orders', outletId ?? 'none'] as const;

export function useKitchenOrdersQuery() {
  const outletId = useFloorBranchOutletId();

  return useQuery({
    queryKey: kitchenOrdersQueryKey(outletId),
    queryFn: async () => {
      const response = await fetchKitchenOrders(outletId);
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Unable to load kitchen orders.');
      }
      if (response.data.loadError && response.data.orders.length === 0) {
        throw new Error(response.data.loadError);
      }
      return response.data;
    },
    refetchInterval: 30_000,
  });
}

export function useKitchenOrderStatusMutation(outletId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { orderId: string; status: KitchenOrderStatus | 'served' }) => {
      const params = new URLSearchParams();
      if (outletId?.trim()) params.set('outlet', outletId.trim());
      const suffix = params.size > 0 ? `?${params.toString()}` : '';
      const response = await fetch(
        `/api/kitchen/orders/${encodeURIComponent(input.orderId)}/status${suffix}`,
        {
          method: 'PATCH',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: input.status }),
        },
      );
      const json = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !json.success) {
        throw new Error(json.message ?? 'Unable to update order status.');
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: kitchenOrdersQueryKey(outletId) });
    },
  });
}
