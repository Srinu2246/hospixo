'use client';

import { useMemo, useState } from 'react';

import type { OnlineOrder, OnlineOrderChannel } from '@/features/pos/config/online-orders';
import { onlineOrders } from '@/features/pos/config/online-orders';

export interface OnlineOrdersPageViewModel {
  activeChannel: OnlineOrderChannel;
  setActiveChannel: (channel: OnlineOrderChannel) => void;
  orders: OnlineOrder[];
  visibleOrders: OnlineOrder[];
  handleAccept: (orderId: string) => void;
  handleReject: (orderId: string) => void;
  handleMarkReady: (orderId: string) => void;
}

export function useOnlineOrdersPage(): OnlineOrdersPageViewModel {
  const [activeChannel, setActiveChannel] = useState<OnlineOrderChannel>('all');
  const [orders, setOrders] = useState<OnlineOrder[]>(onlineOrders);

  const visibleOrders = useMemo(() => {
    if (activeChannel === 'all') return orders;
    return orders.filter((order) => order.channel === activeChannel);
  }, [activeChannel, orders]);

  function handleAccept(orderId: string) {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, priority: 'normal', actionState: 'readyForPickup' }
          : order,
      ),
    );
  }

  function handleReject(orderId: string) {
    setOrders((prev) => prev.filter((order) => order.id !== orderId));
  }

  function handleMarkReady(orderId: string) {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, priority: 'ready', actionState: 'readyForPickupDone' }
          : order,
      ),
    );
  }

  return {
    activeChannel,
    setActiveChannel,
    orders,
    visibleOrders,
    handleAccept,
    handleReject,
    handleMarkReady,
  };
}
