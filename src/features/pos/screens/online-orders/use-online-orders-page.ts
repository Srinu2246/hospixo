'use client';

import { useMemo, useState } from 'react';

import type { OnlineOrder, OnlineOrderChannel } from '@/features/pos/config/online-orders';
import {
  useOnlineOrdersQuery,
  usePatchBranchOrderMutation,
} from '@/features/pos/hooks/use-branch-orders';

export interface OnlineOrdersPageViewModel {
  activeChannel: OnlineOrderChannel;
  setActiveChannel: (channel: OnlineOrderChannel) => void;
  orders: OnlineOrder[];
  visibleOrders: OnlineOrder[];
  handleAccept: (orderId: string) => void;
  handleReject: (orderId: string) => void;
  handleMarkReady: (orderId: string) => void;
  isLoading: boolean;
  isError: boolean;
  loadError: string | null;
  isMutating: boolean;
}

export function useOnlineOrdersPage(): OnlineOrdersPageViewModel {
  const [activeChannel, setActiveChannel] = useState<OnlineOrderChannel>('all');
  const { data, isPending, isError, error } = useOnlineOrdersQuery();
  const patchOrder = usePatchBranchOrderMutation();

  const orders = data?.orders ?? [];

  const visibleOrders = useMemo(() => {
    if (activeChannel === 'all') return orders;
    return orders.filter((order) => order.channel === activeChannel);
  }, [activeChannel, orders]);

  function handleAccept(orderId: string) {
    patchOrder.mutate({
      orderId,
      body: { status: 'accepted', kitchen_status: 'preparing' },
    });
  }

  function handleReject(orderId: string) {
    patchOrder.mutate({
      orderId,
      body: { status: 'cancelled' },
    });
  }

  function handleMarkReady(orderId: string) {
    patchOrder.mutate({
      orderId,
      body: { kitchen_status: 'ready' },
    });
  }

  return {
    activeChannel,
    setActiveChannel,
    orders,
    visibleOrders,
    handleAccept,
    handleReject,
    handleMarkReady,
    isLoading: isPending,
    isError,
    loadError: error instanceof Error ? error.message : (data?.loadError ?? null),
    isMutating: patchOrder.isPending,
  };
}
