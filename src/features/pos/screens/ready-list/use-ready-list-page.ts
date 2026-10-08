'use client';

import { useMemo, useState } from 'react';

import {
  readyListTabs,
  readyOrders as initialReadyOrders,
  type ReadyListTab,
} from '@/features/pos/config/ready-list';

export function useReadyListPage() {
  const [activeTab, setActiveTab] = useState<ReadyListTab>('active');
  const [query, setQuery] = useState('');
  const [orders, setOrders] = useState(initialReadyOrders);

  const visibleOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orders.filter((order) => {
      if (order.tab !== activeTab) return false;
      if (!normalizedQuery) return true;

      return [order.table, order.token, order.itemSummary].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      );
    });
  }, [activeTab, orders, query]);

  function handleServe(orderId: string) {
    setOrders((current) => current.filter((order) => order.id !== orderId));
  }

  const activeCount = orders.filter((order) => order.tab === 'active').length;

  return {
    activeTab,
    setActiveTab,
    query,
    setQuery,
    visibleOrders,
    handleServe,
    activeCount,
    tabs: readyListTabs,
  };
}

export type ReadyListPageViewModel = ReturnType<typeof useReadyListPage>;
