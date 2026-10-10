'use client';

import { useMemo, useState } from 'react';

import type { OnlineOrder, OnlineOrderChannel } from '@/features/pos/config/online-orders';
import {
  useOnlineOrdersQuery,
  usePatchBranchOrderMutation,
} from '@/features/pos/hooks/use-branch-orders';

const emptyOrders: OnlineOrder[] = [];

export interface OnlineOrdersPageViewModel {
  activeChannel: OnlineOrderChannel;
  setActiveChannel: (channel: OnlineOrderChannel) => void;
  orders: OnlineOrder[];
  pendingCount: number;
  visibleOrders: OnlineOrder[];
  handleAccept: (orderId: string) => void;
  handleReject: (orderId: string) => void;
  handleMarkReady: (orderId: string) => void;
  isLoading: boolean;
  isError: boolean;
  loadError: string | null;
  isMutating: boolean;
  mutationError: string | null;
  mutationSucceeded: boolean;
  pendingAcceptOrder: OnlineOrder | null;
}

export function useOnlineOrdersPage(): OnlineOrdersPageViewModel {
  const [activeChannel, setActiveChannel] = useState<OnlineOrderChannel>('all');
  const { data, isPending, isError, error } = useOnlineOrdersQuery();
  const patchOrder = usePatchBranchOrderMutation();

  const orders = data?.orders ?? emptyOrders;

  const visibleOrders = useMemo(() => {
    if (activeChannel === 'all') return orders;
    return orders.filter((order) => order.channel === activeChannel);
  }, [activeChannel, orders]);

  const pendingAcceptOrder = useMemo(
    () => orders.find((order) => order.actionState === 'pendingAccept') ?? null,
    [orders],
  );

  function handleAccept(orderId: string) {
    if (patchOrder.isPending) return;
    patchOrder.mutate({
      orderId,
      body: { status: 'accepted', kitchen_status: 'preparing' },
    });
  }

  function handleReject(orderId: string) {
    if (patchOrder.isPending) return;
    patchOrder.mutate({
      orderId,
      body: { status: 'cancelled' },
    });
  }

  function handleMarkReady(orderId: string) {
    if (patchOrder.isPending) return;
    patchOrder.mutate({
      orderId,
      body: { kitchen_status: 'ready' },
    });
  }

  return {
    activeChannel,
    setActiveChannel,
    orders,
    pendingCount: orders.filter((order) => order.actionState === 'pendingAccept').length,
    visibleOrders,
    handleAccept,
    handleReject,
    handleMarkReady,
    isLoading: isPending,
    isError,
    loadError: error instanceof Error ? error.message : (data?.loadError ?? null),
    isMutating: patchOrder.isPending,
    mutationError: patchOrder.error instanceof Error ? patchOrder.error.message : null,
    mutationSucceeded: patchOrder.isSuccess,
    pendingAcceptOrder,
  };
}
