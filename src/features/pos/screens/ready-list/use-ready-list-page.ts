'use client';

import { useMemo, useState } from 'react';

import {
  readyListTabs,
  type ReadyListTab,
  type ReadyOrder,
} from '@/features/pos/config/ready-list';
import {
  usePatchBranchOrderMutation,
  useReadyOrdersQuery,
} from '@/features/pos/hooks/use-branch-orders';

const emptyOrders: ReadyOrder[] = [];

export function useReadyListPage() {
  const [activeTab, setActiveTab] = useState<ReadyListTab>('active');
  const [query, setQuery] = useState('');
  const { data, isPending, isError, error } = useReadyOrdersQuery();
  const patchOrder = usePatchBranchOrderMutation();

  const orders = data?.orders ?? emptyOrders;

  const tabs = useMemo(() => {
    const activeCount = orders.filter((order) => order.tab === 'active').length;
    const pendingCount = orders.filter((order) => order.tab === 'pending').length;
    return readyListTabs.map((tab) => {
      if (tab.id === 'active') return { ...tab, count: activeCount };
      if (tab.id === 'pending') return { ...tab, count: pendingCount };
      return tab;
    });
  }, [orders]);

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
    if (patchOrder.isPending) return;
    patchOrder.mutate({
      orderId,
      body: { kitchen_status: 'served' },
    });
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
    tabs,
    isLoading: isPending,
    isError,
    loadError: error instanceof Error ? error.message : (data?.loadError ?? null),
    isMutating: patchOrder.isPending,
    mutationError: patchOrder.error instanceof Error ? patchOrder.error.message : null,
    mutationSucceeded: patchOrder.isSuccess,
  };
}

export type ReadyListPageViewModel = ReturnType<typeof useReadyListPage>;
