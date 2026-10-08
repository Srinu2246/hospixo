'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { kitchenPreviewOrders } from '@/features/kitchen/config/fixture';
import type { KitchenOrder, KitchenOrderStatus } from '@/features/kitchen/types';
import type { DineInOrderLine } from '@/features/pos/config/dine-in';
import {
  openOrders as seedOpenOrders,
  type OpenOrder,
  type OpenOrderKitchenStatus,
} from '@/features/pos/config/open-orders';
import { createKitchenOrderFromKot } from '@/features/pos/lib/order/kot';
import { mapKitchenStatusToOpenOrder } from '@/features/pos/lib/order/kitchen-status';
import { computeLinesAmount, mergeOrderLines } from '@/features/pos/lib/order/lines';
import { buildTableReference } from '@/features/pos/lib/order/reference';
import { normalizeTableId } from '@/features/pos/config/tables';

export interface SendToKotPayload {
  tableId: string;
  tableLabel: string;
  orderNumber: string;
  lines: readonly DineInOrderLine[];
  waiter?: string;
  existingOrderId?: string | null;
}

interface PosOrdersContextValue {
  openOrders: OpenOrder[];
  kitchenOrders: KitchenOrder[];
  checkoutOrderId: string | null;
  editingOrderId: string | null;
  lastKotSentAt: number | null;
  sendToKot: (payload: SendToKotPayload) => string;
  updateKitchenOrderStatus: (kitchenOrderId: string, status: KitchenOrderStatus | 'served') => void;
  appendItemsToOrder: (orderId: string, lines: readonly DineInOrderLine[]) => void;
  getOrderById: (orderId: string) => OpenOrder | undefined;
  selectOrderForCheckout: (orderId: string) => void;
  setEditingOrderId: (orderId: string | null) => void;
  clearCheckoutOrder: () => void;
}

const PosOrdersContext = createContext<PosOrdersContextValue | null>(null);

function cloneSeedOpenOrders(): OpenOrder[] {
  return seedOpenOrders.map((order) => {
    const lines = order.lines ? [...order.lines] : undefined;
    return {
      ...order,
      lines,
      amount: lines ? computeLinesAmount(lines) : order.amount,
    };
  });
}

function matchesTableId(left?: string, right?: string) {
  if (!left || !right) return false;
  return normalizeTableId(left) === normalizeTableId(right);
}

function cloneSeedKitchenOrders(): KitchenOrder[] {
  return kitchenPreviewOrders.map((order) => ({
    ...order,
    items: [...order.items],
  }));
}

function nextKitchenOrderId() {
  return `kot-${Date.now()}`;
}

export function PosOrdersProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [openOrders, setOpenOrders] = useState<OpenOrder[]>(cloneSeedOpenOrders);
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>(cloneSeedKitchenOrders);
  const [checkoutOrderId, setCheckoutOrderId] = useState<string | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [lastKotSentAt, setLastKotSentAt] = useState<number | null>(null);

  const getOrderById = useCallback(
    (orderId: string) => openOrders.find((order) => order.id === orderId),
    [openOrders],
  );

  const sendToKot = useCallback((payload: SendToKotPayload) => {
    const amount = computeLinesAmount(payload.lines);
    const kitchenOrderId = nextKitchenOrderId();
    const reference = buildTableReference(payload.tableId);

    const kitchenTicket = createKitchenOrderFromKot({
      id: kitchenOrderId,
      orderNumber: payload.orderNumber,
      tableLabel: reference,
      lines: payload.lines,
    });

    setKitchenOrders((prev) => [kitchenTicket, ...prev]);
    setLastKotSentAt(Date.now());

    let resolvedOrderId = payload.existingOrderId ?? '';

    setOpenOrders((prev) => {
      const existingIndex = payload.existingOrderId
        ? prev.findIndex((order) => order.id === payload.existingOrderId)
        : prev.findIndex(
            (order) =>
              order.type === 'dineIn' &&
              matchesTableId(order.tableId, payload.tableId) &&
              order.paymentStatus === 'unpaid',
          );

      if (existingIndex >= 0) {
        const existing = prev[existingIndex]!;
        const mergedLines = mergeOrderLines(existing.lines ?? [], payload.lines);
        resolvedOrderId = existing.id;

        const updated: OpenOrder = {
          ...existing,
          lines: mergedLines,
          amount: computeLinesAmount(mergedLines),
          kitchenStatus: 'kotSent',
          kitchenOrderId,
          reference,
          tableId: payload.tableId,
          age: 'now',
          waiter: payload.waiter ?? existing.waiter,
        };
        const rest = prev.filter((_, index) => index !== existingIndex);
        return [updated, ...rest];
      }

      resolvedOrderId = `o-${Date.now()}`;
      const created: OpenOrder = {
        id: resolvedOrderId,
        orderNumber: payload.orderNumber,
        type: 'dineIn',
        reference,
        kitchenStatus: 'kotSent',
        paymentStatus: 'unpaid',
        age: 'now',
        amount,
        tableId: payload.tableId,
        lines: [...payload.lines],
        waiter: payload.waiter,
        kitchenOrderId,
      };
      return [created, ...prev];
    });

    setEditingOrderId(resolvedOrderId);
    return resolvedOrderId;
  }, []);

  const updateKitchenOrderStatus = useCallback(
    (kitchenOrderId: string, status: KitchenOrderStatus | 'served') => {
      if (status === 'served') {
        setKitchenOrders((prev) => prev.filter((order) => order.id !== kitchenOrderId));
        setOpenOrders((prev) =>
          prev.map((order) =>
            order.kitchenOrderId === kitchenOrderId
              ? { ...order, kitchenStatus: 'billing' as OpenOrderKitchenStatus }
              : order,
          ),
        );
        return;
      }

      const openStatus = mapKitchenStatusToOpenOrder(status);

      setKitchenOrders((prev) =>
        prev.map((order) => (order.id === kitchenOrderId ? { ...order, status } : order)),
      );

      setOpenOrders((prev) =>
        prev.map((order) =>
          order.kitchenOrderId === kitchenOrderId ? { ...order, kitchenStatus: openStatus } : order,
        ),
      );
    },
    [],
  );

  const appendItemsToOrder = useCallback((orderId: string, lines: readonly DineInOrderLine[]) => {
    setOpenOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const mergedLines = mergeOrderLines(order.lines ?? [], lines);
        return {
          ...order,
          lines: mergedLines,
          amount: computeLinesAmount(mergedLines),
        };
      }),
    );
  }, []);

  const selectOrderForCheckout = useCallback((orderId: string) => {
    setCheckoutOrderId(orderId);
  }, []);

  const clearCheckoutOrder = useCallback(() => {
    setCheckoutOrderId(null);
  }, []);

  const value = useMemo(
    () => ({
      openOrders,
      kitchenOrders,
      checkoutOrderId,
      editingOrderId,
      lastKotSentAt,
      sendToKot,
      updateKitchenOrderStatus,
      appendItemsToOrder,
      getOrderById,
      selectOrderForCheckout,
      setEditingOrderId,
      clearCheckoutOrder,
    }),
    [
      openOrders,
      kitchenOrders,
      checkoutOrderId,
      editingOrderId,
      lastKotSentAt,
      sendToKot,
      updateKitchenOrderStatus,
      appendItemsToOrder,
      getOrderById,
      selectOrderForCheckout,
      clearCheckoutOrder,
    ],
  );

  return <PosOrdersContext.Provider value={value}>{children}</PosOrdersContext.Provider>;
}

export function usePosOrdersStore() {
  const context = useContext(PosOrdersContext);
  if (!context) {
    throw new Error('usePosOrdersStore must be used within PosOrdersProvider');
  }
  return context;
}
