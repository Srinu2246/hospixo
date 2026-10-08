'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import type { KitchenOrder, KitchenOrderStatus } from '@/features/kitchen/types';
import type { DineInOrderLine } from '@/features/pos/config/dine-in';
import type { OpenOrder } from '@/features/pos/config/open-orders';
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

function matchesTableId(left?: string, right?: string) {
  if (!left || !right) return false;
  return normalizeTableId(left) === normalizeTableId(right);
}

function nextKitchenOrderId() {
  return `kot-${Date.now()}`;
}

export function PosOrdersProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [openOrders, setOpenOrders] = useState<OpenOrder[]>([]);
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);
  const [checkoutOrderId, setCheckoutOrderId] = useState<string | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [lastKotSentAt, setLastKotSentAt] = useState<number | null>(null);

  const getOrderById = useCallback(
    (orderId: string) => openOrders.find((order) => order.id === orderId),
    [openOrders],
  );

  const sendToKot = useCallback((payload: SendToKotPayload) => {
    const orderId = payload.existingOrderId ?? nextKitchenOrderId();
    const amount = computeLinesAmount(payload.lines);
    const kitchenOrder = createKitchenOrderFromKot({
      id: orderId,
      orderNumber: payload.orderNumber,
      tableLabel: payload.tableLabel,
      lines: payload.lines,
    });

    setKitchenOrders((current) => {
      const existingIndex = current.findIndex((order) => order.id === orderId);
      if (existingIndex >= 0) {
        const next = [...current];
        next[existingIndex] = kitchenOrder;
        return next;
      }
      return [...current, kitchenOrder];
    });

    setOpenOrders((current) => {
      const existing = current.find((order) => order.id === orderId);
      const kitchenStatus = mapKitchenStatusToOpenOrder(kitchenOrder.status);
      const reference = buildTableReference(payload.tableLabel, payload.tableId);

      if (existing) {
        return current.map((order) =>
          order.id === orderId
            ? {
                ...order,
                lines: mergeOrderLines(order.lines ?? [], payload.lines),
                amount: computeLinesAmount(mergeOrderLines(order.lines ?? [], payload.lines)),
                kitchenStatus,
                kitchenOrderId: orderId,
              }
            : order,
        );
      }

      return [
        ...current,
        {
          id: orderId,
          orderNumber: payload.orderNumber,
          type: 'dineIn',
          reference,
          kitchenStatus,
          paymentStatus: 'unpaid',
          age: '0m',
          amount,
          tableId: payload.tableId,
          lines: [...payload.lines],
          waiter: payload.waiter,
          kitchenOrderId: orderId,
        },
      ];
    });

    setLastKotSentAt(Date.now());
    return orderId;
  }, []);

  const updateKitchenOrderStatus = useCallback(
    (kitchenOrderId: string, status: KitchenOrderStatus | 'served') => {
      setKitchenOrders((current) =>
        current.map((order) =>
          order.id === kitchenOrderId
            ? { ...order, status: status === 'served' ? 'ready' : status }
            : order,
        ),
      );

      setOpenOrders((current) =>
        current.map((order) =>
          order.kitchenOrderId === kitchenOrderId
            ? { ...order, kitchenStatus: mapKitchenStatusToOpenOrder(status) }
            : order,
        ),
      );
    },
    [],
  );

  const appendItemsToOrder = useCallback((orderId: string, lines: readonly DineInOrderLine[]) => {
    setOpenOrders((current) =>
      current.map((order) => {
        if (order.id !== orderId) return order;
        const merged = mergeOrderLines(order.lines ?? [], lines);
        return {
          ...order,
          lines: merged,
          amount: computeLinesAmount(merged),
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
    (): PosOrdersContextValue => ({
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

export function findOpenOrderForTable(openOrders: readonly OpenOrder[], tableId: string) {
  return openOrders.find((order) => matchesTableId(order.tableId, tableId));
}
