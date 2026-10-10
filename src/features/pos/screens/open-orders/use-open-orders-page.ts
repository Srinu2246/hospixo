'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { OpenOrder, OpenOrderType } from '@/features/pos/config/open-orders';
import { buildOpenOrdersSummary, OPEN_ORDERS_PAGE_SIZE } from '@/features/pos/config/open-orders';
import { resolveTableIdFromReference } from '@/features/pos/lib/order/reference';
import { usePosFlowPaths } from '@/features/pos/hooks/use-pos-flow-paths';
import { useOpenOrdersQuery } from '@/features/pos/hooks/use-branch-orders';
import { usePosOrder } from '@/context/pos-order';
import { usePosOrdersStore } from '@/context/pos-orders-store';

const emptyOpenOrders: OpenOrder[] = [];

export function useOpenOrdersPage() {
  const router = useRouter();
  const flowPaths = usePosFlowPaths();
  const { setSelectedTable, setOrderLines } = usePosOrder();
  const { setEditingOrderId } = usePosOrdersStore();
  const [activeType, setActiveTypeState] = useState<OpenOrderType>('all');
  const [searchQuery, setSearchQueryState] = useState('');
  const [page, setPage] = useState(1);
  const { data, isPending, isError, error } = useOpenOrdersQuery();

  const openOrders = data?.orders ?? emptyOpenOrders;

  function setActiveType(type: OpenOrderType) {
    setActiveTypeState(type);
    setPage(1);
  }

  function setSearchQuery(query: string) {
    setSearchQueryState(query);
    setPage(1);
  }

  const filteredOrders = useMemo(() => {
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

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / OPEN_ORDERS_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const visibleOrders = useMemo((): OpenOrder[] => {
    const start = (safePage - 1) * OPEN_ORDERS_PAGE_SIZE;
    return filteredOrders.slice(start, start + OPEN_ORDERS_PAGE_SIZE);
  }, [filteredOrders, safePage]);

  const footerSummary = useMemo(() => buildOpenOrdersSummary(filteredOrders), [filteredOrders]);

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
    filteredCount: filteredOrders.length,
    footerSummary,
    page: safePage,
    totalPages,
    setPage,
    handleAddItems,
    handleSettleBill,
    isLoading: isPending,
    isError,
    loadError: error instanceof Error ? error.message : (data?.loadError ?? null),
  };
}

export type OpenOrdersPageViewModel = ReturnType<typeof useOpenOrdersPage>;
