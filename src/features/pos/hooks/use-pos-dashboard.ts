'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';

import type { PosDashboardData } from '@/features/pos/lib/build-pos-dashboard';
import { buildPosDashboard } from '@/features/pos/lib/build-pos-dashboard';
import type { LiveOrderAction } from '@/features/pos/config/dashboard';
import {
  useOnlineOrdersQuery,
  useOpenOrdersQuery,
  useReadyOrdersQuery,
} from '@/features/pos/hooks/use-branch-orders';
import { usePosCashShift } from '@/features/pos/hooks/use-cash-shift';
import { usePosFlowPaths } from '@/features/pos/hooks/use-pos-flow-paths';
import { usePosTables } from '@/features/pos/hooks/use-pos-tables';
import { resolveTableIdFromReference } from '@/features/pos/lib/order/reference';
import { usePosOrder } from '@/context/pos-order';
import { usePosOrdersStore } from '@/context/pos-orders-store';

import type { OnlineOrder } from '@/features/pos/config/online-orders';
import type { OpenOrder } from '@/features/pos/config/open-orders';
import type { ReadyOrder } from '@/features/pos/config/ready-list';
import type { PosTable } from '@/features/pos/config/tables';
import type { CashTransaction } from '@/features/pos/types/cash-shift';

const emptyOpenOrders: OpenOrder[] = [];
const emptyReadyOrders: ReadyOrder[] = [];
const emptyOnlineOrders: OnlineOrder[] = [];
const emptyPosTables: PosTable[] = [];
const emptyTransactions: CashTransaction[] = [];

function firstLoadError(errors: (string | null | undefined)[]): string | null {
  for (const message of errors) {
    if (message?.trim()) return message.trim();
  }
  return null;
}

export function usePosDashboard() {
  const router = useRouter();
  const flowPaths = usePosFlowPaths();
  const { setSelectedTable, setOrderLines } = usePosOrder();
  const { setEditingOrderId } = usePosOrdersStore();

  const openQuery = useOpenOrdersQuery();
  const readyQuery = useReadyOrdersQuery();
  const onlineQuery = useOnlineOrdersQuery();
  const tablesQuery = usePosTables();
  const shiftQuery = usePosCashShift();

  const data: PosDashboardData = useMemo(
    () =>
      buildPosDashboard({
        openOrders: openQuery.data?.orders ?? emptyOpenOrders,
        readyOrders: readyQuery.data?.orders ?? emptyReadyOrders,
        onlineOrders: onlineQuery.data?.orders ?? emptyOnlineOrders,
        posTables: tablesQuery.data?.tables ?? emptyPosTables,
        cashTransactions: shiftQuery.data?.transactions ?? emptyTransactions,
        activeShift: shiftQuery.data?.activeShift ?? null,
        shiftMetrics: shiftQuery.data?.metrics ?? null,
      }),
    [
      openQuery.data?.orders,
      readyQuery.data?.orders,
      onlineQuery.data?.orders,
      tablesQuery.data?.tables,
      shiftQuery.data?.transactions,
      shiftQuery.data?.activeShift,
      shiftQuery.data?.metrics,
    ],
  );

  const isLoading =
    openQuery.isPending ||
    readyQuery.isPending ||
    onlineQuery.isPending ||
    tablesQuery.isPending ||
    shiftQuery.isPending;

  const isError =
    openQuery.isError || readyQuery.isError || onlineQuery.isError || tablesQuery.isError;

  const loadError = firstLoadError([
    openQuery.error instanceof Error ? openQuery.error.message : null,
    readyQuery.error instanceof Error ? readyQuery.error.message : null,
    onlineQuery.error instanceof Error ? onlineQuery.error.message : null,
    tablesQuery.error instanceof Error ? tablesQuery.error.message : null,
    openQuery.data?.loadError,
    readyQuery.data?.loadError,
    onlineQuery.data?.loadError,
    tablesQuery.data?.loadError,
  ]);

  function handleLiveOrderAction(orderId: string, action: LiveOrderAction) {
    const order = openQuery.data?.orders.find((entry) => entry.id === orderId);
    if (!order) {
      router.push(flowPaths.openOrders);
      return;
    }

    if (action === 'view') {
      router.push(flowPaths.openOrders);
      return;
    }

    if (action === 'edit' || action === 'pay') {
      if (action === 'edit') {
        const tableId = order.tableId ?? resolveTableIdFromReference(order.reference) ?? null;
        if (tableId) setSelectedTable(tableId, order.reference);
        setOrderLines(order.lines ?? []);
        setEditingOrderId(orderId);
        router.push(flowPaths.dineIn);
        return;
      }
      router.push(flowPaths.orderDetails(orderId));
    }
  }

  return {
    ...data,
    isLoading,
    isError,
    loadError,
    isFetching:
      openQuery.isFetching ||
      readyQuery.isFetching ||
      onlineQuery.isFetching ||
      tablesQuery.isFetching,
    handleLiveOrderAction,
  };
}

export type PosDashboardViewModel = ReturnType<typeof usePosDashboard>;
