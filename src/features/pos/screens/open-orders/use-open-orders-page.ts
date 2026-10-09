'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { OpenOrderType } from '@/features/pos/config/open-orders';
import { resolveTableIdFromReference } from '@/features/pos/lib/order/reference';
import { usePosFlowPaths } from '@/features/pos/hooks/use-pos-flow-paths';
import { useOpenOrdersQuery } from '@/features/pos/hooks/use-branch-orders';
import { usePosOrder } from '@/context/pos-order';
import { usePosOrdersStore } from '@/context/pos-orders-store';

export function useOpenOrdersPage() {
  const router = useRouter();
  const flowPaths = usePosFlowPaths();
  const { setSelectedTable, setOrderLines } = usePosOrder();
  const { setEditingOrderId } = usePosOrdersStore();
  const [activeType, setActiveType] = useState<OpenOrderType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isPending, isError, error } = useOpenOrdersQuery();

  const openOrders = data?.orders ?? [];

  const visibleOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return openOrders.filter((order) => {
      if (activeType !== 'all' && order.type !== activeType) return false;
      if (!query) return true;

      return (
        order.orderNumber.toLowerCase().includes(query) ||
        order.reference.toLowerCase().includes(query) ||
        order.type.toLowerCase().includes(query)
      );
    });
  }, [activeType, searchQuery, openOrders]);

  function handleAddItems(orderId: string) {
    const order = openOrders.find((entry) => entry.id === orderId);
    if (!order) return;

    const tableId = order.tableId ?? resolveTableIdFromReference(order.reference) ?? null;
    if (tableId) setSelectedTable(tableId, order.reference);

    setOrderLines(order.lines ?? []);
    setEditingOrderId(orderId);
    router.push(flowPaths.dineIn);
  }

  function handleSettleBill(orderId: string) {
    router.push(flowPaths.orderDetails(orderId));
  }

  return {
    activeType,
    setActiveType,
    searchQuery,
    setSearchQuery,
    visibleOrders,
    handleAddItems,
    handleSettleBill,
    isLoading: isPending,
    isError,
    loadError: error instanceof Error ? error.message : (data?.loadError ?? null),
  };
}

export type OpenOrdersPageViewModel = ReturnType<typeof useOpenOrdersPage>;
