'use client';

import { useCallback, useMemo } from 'react';

import { useQuery } from '@/lib/hooks/api/useQuery';
import { useActiveBranchId } from '@/lib/hooks/menu/menus/menusHooks';
import { useBranchOrderEventsStream } from '@/lib/hooks/pos/point-of-sale/order-events/useBranchOrderEventsStream';
import { parsePosOrderList } from '@/lib/schemas/pos/point-of-sale/all-orders/posOrdersSchema';
import {
  branchOrderListItemToReadyOrder,
  branchOrdersQueryForReadyQueue,
} from '@/lib/schemas/pos/point-of-sale/ready-list/branchReadyListOrders';
import type {
  ReadyOrderItem,
  ReadyOrderQueue,
} from '@/lib/schemas/pos/point-of-sale/ready-list/readyListSchema';
import { api } from '@/services/api/browserClient';
import { branchOrdersPath } from '@/services/api/ApiUrlsV1';

export const captainReadyListQueryKey = (branchId: number, queue: ReadyOrderQueue) =>
  ['pos', 'point-of-sale', 'ready-list', branchId, queue] as const;

type ReadyListFetchResult = {
  orders: ReadyOrderItem[];
  total: number;
};

async function fetchBranchOrdersForQueue(
  branchId: number,
  queue: ReadyOrderQueue,
  signal?: AbortSignal,
): Promise<ReadyListFetchResult> {
  const query = branchOrdersQueryForReadyQueue(queue);
  const payload = await api.get(branchOrdersPath(branchId), query, signal);
  const data = parsePosOrderList(payload);
  return {
    orders: data.items.map((item) => branchOrderListItemToReadyOrder(item, queue)),
    total: data.total,
  };
}

/**
 * Captain ready list — one GET /v1/branches/{branch_id}/orders per route tab.
 * Ready → `kitchen_badge=ready`; Preparing → `kitchen_badge=preparing`;
 * Served → `kitchen_badge=all` + `status=completed`.
 */
export function useCaptainReadyList(activeTab: ReadyOrderQueue = 'active', branchId?: number) {
  const activeBranchId = useActiveBranchId(branchId);
  const enabled = typeof activeBranchId === 'number';
  const branchKey = activeBranchId ?? 0;

  const listQuery = useQuery({
    queryKey: captainReadyListQueryKey(branchKey, activeTab),
    enabled,
    staleTime: 10_000,
    queryFn: ({ signal }) => fetchBranchOrdersForQueue(activeBranchId!, activeTab, signal),
  });

  const refetch = useCallback(async () => {
    await listQuery.refetch();
  }, [listQuery]);

  useBranchOrderEventsStream({
    branchId: activeBranchId,
    onKitchenEventBatch: () => {
      void refetch();
    },
    onReadyListEvent: () => {
      void refetch();
    },
  });

  const orders = useMemo(() => listQuery.data?.orders ?? [], [listQuery.data?.orders]);
  const queueTotal = listQuery.data?.total ?? orders.length;

  return {
    branchId: activeBranchId,
    orders,
    queueTotal,
    activeTab,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    error: listQuery.error,
    refetch,
  };
}
