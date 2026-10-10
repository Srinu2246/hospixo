'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { formatOpenOrderTime, getOpenOrderTypeLabel } from '@/features/pos/config/open-orders';
import type { OpenOrder } from '@/features/pos/config/open-orders';
import {
  computeOrderGrandTotal,
  computeOrderSubtotal,
  computeOrderTax,
  orderDetailsPageMeta,
} from '@/features/pos/config/order-details';
import { posOrderActions } from '@/features/pos/config/order-actions';
import { usePosFlowPaths } from '@/features/pos/hooks/use-pos-flow-paths';
import { countLineItems } from '@/features/pos/lib/order/lines';
import { useOpenOrdersQuery } from '@/features/pos/hooks/use-branch-orders';
import { usePosOrder } from '@/context/pos-order';
import { usePosOrdersStore } from '@/context/pos-orders-store';

const emptyOrderLines: NonNullable<OpenOrder['lines']> = [];

export function useOrderDetailsPage(orderId: string) {
  const router = useRouter();
  const flowPaths = usePosFlowPaths();
  const { openOrders, selectOrderForCheckout } = usePosOrdersStore();
  const { setSelectedTable, setOrderLines } = usePosOrder();
  const { data, isPending, isError, error } = useOpenOrdersQuery();

  const order = useMemo(
    () =>
      data?.orders.find((entry) => entry.id === orderId) ??
      openOrders.find((entry) => entry.id === orderId),
    [data?.orders, openOrders, orderId],
  );

  const lines = order?.lines ?? emptyOrderLines;
  const subtotal = useMemo(() => computeOrderSubtotal(lines), [lines]);
  const tax = useMemo(() => computeOrderTax(subtotal), [subtotal]);
  const grandTotal = useMemo(() => computeOrderGrandTotal(subtotal), [subtotal]);
  const itemCount = useMemo(() => countLineItems(lines), [lines]);

  const subtitle = order ? `${order.reference} · ${getOpenOrderTypeLabel(order.type)}` : '';

  const metaLine = order
    ? `${orderDetailsPageMeta.orderedAgoPrefix} ${formatOpenOrderTime(order.age)}${
        order.waiter ? ` · ${orderDetailsPageMeta.waiterPrefix}: ${order.waiter}` : ''
      }`
    : '';

  function handleGenerateReceipt() {
    if (!order) return;
    if (order.tableId) setSelectedTable(order.tableId, order.reference);
    setOrderLines(order.lines ?? []);
    selectOrderForCheckout(order.id);
    router.push(flowPaths.checkout);
  }

  function goBack() {
    router.push(flowPaths.orders);
  }

  return {
    order,
    isLoading: isPending,
    loadError: isError && error instanceof Error ? error.message : null,
    lines,
    subtotal,
    tax,
    grandTotal,
    itemCount,
    subtitle,
    metaLine,
    generateReceiptLabel: posOrderActions.generateReceipt,
    handleGenerateReceipt,
    goBack,
  };
}

export type OrderDetailsPageViewModel = ReturnType<typeof useOrderDetailsPage>;
