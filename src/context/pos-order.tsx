'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import type {
  DineInMenuItem,
  DineInOrderLine,
  MenuItemCustomization,
} from '@/features/pos/config/dine-in';
import { computeCustomizedUnitPrice } from '@/features/pos/config/dine-in';
import {
  INITIAL_ORDER_SEQUENCE,
  formatPosOrderNumber,
  getEmptyPosOrderState,
  getTableLabel,
  getTableNumber,
} from '@/features/pos/lib/order/state';
import { normalizeTableId } from '@/features/pos/config/tables';

interface PosOrderContextValue {
  orderLines: DineInOrderLine[];
  setOrderLines: React.Dispatch<React.SetStateAction<DineInOrderLine[]>>;
  menuQuantities: Record<string, number>;
  setMenuQuantities: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  selectedTableId: string;
  setSelectedTable: (tableId: string, label?: string) => void;
  tableLabel: string;
  tableNumber: string;
  orderNumber: string;
  resetOrder: () => void;
  completeOrder: () => void;
}

const PosOrderContext = createContext<PosOrderContextValue | null>(null);

export function PosOrderProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const emptyState = getEmptyPosOrderState();
  const [orderSequence, setOrderSequence] = useState(INITIAL_ORDER_SEQUENCE);
  const [selectedTableId, setSelectedTableId] = useState(emptyState.selectedTableId);
  const [selectedTableLabel, setSelectedTableLabel] = useState(emptyState.selectedTableLabel);
  const [menuQuantities, setMenuQuantities] = useState<Record<string, number>>(
    emptyState.menuQuantities,
  );
  const [orderLines, setOrderLines] = useState<DineInOrderLine[]>(emptyState.orderLines);

  const setSelectedTable = useCallback((tableId: string, label?: string) => {
    setSelectedTableId(normalizeTableId(tableId));
    setSelectedTableLabel(label?.trim() ?? '');
  }, []);

  const resetOrder = useCallback(() => {
    const next = getEmptyPosOrderState();
    setSelectedTableId(next.selectedTableId);
    setSelectedTableLabel(next.selectedTableLabel);
    setMenuQuantities(next.menuQuantities);
    setOrderLines(next.orderLines);
  }, []);

  const completeOrder = useCallback(() => {
    setOrderSequence((current) => current + 1);
    resetOrder();
  }, [resetOrder]);

  const tableLabel = useMemo(
    () => getTableLabel(selectedTableId, [], selectedTableLabel),
    [selectedTableId, selectedTableLabel],
  );
  const tableNumber = useMemo(
    () => getTableNumber(selectedTableId, [], selectedTableLabel),
    [selectedTableId, selectedTableLabel],
  );
  const orderNumber = useMemo(() => formatPosOrderNumber(orderSequence), [orderSequence]);

  const value = useMemo(
    () => ({
      orderLines,
      setOrderLines,
      menuQuantities,
      setMenuQuantities,
      selectedTableId,
      setSelectedTable,
      tableLabel,
      tableNumber,
      orderNumber,
      resetOrder,
      completeOrder,
    }),
    [
      orderLines,
      menuQuantities,
      selectedTableId,
      setSelectedTable,
      tableLabel,
      tableNumber,
      orderNumber,
      resetOrder,
      completeOrder,
    ],
  );

  return <PosOrderContext.Provider value={value}>{children}</PosOrderContext.Provider>;
}

export function usePosOrder() {
  const context = useContext(PosOrderContext);
  if (!context) {
    throw new Error('usePosOrder must be used within PosOrderProvider');
  }
  return context;
}

export function createLineFromMenuItem(
  menuItems: readonly DineInMenuItem[],
  menuItemId: string,
  customization?: MenuItemCustomization,
): DineInOrderLine | null {
  const menuItem = menuItems.find((item) => item.id === menuItemId);
  if (!menuItem) return null;

  const unitPrice = customization
    ? computeCustomizedUnitPrice(menuItem, customization)
    : menuItem.price;

  const sizeLabel =
    menuItem.sizes?.find((size) => size.id === customization?.sizeId)?.label ??
    customization?.sizeId;

  const addOnLabels =
    customization?.addOnIds
      ?.map((id) => menuItem.addOns?.find((addOn) => addOn.id === id)?.label)
      .filter(Boolean) ?? [];

  return {
    id: `line-${menuItemId}-${Date.now()}`,
    menuItemId: menuItem.id,
    name: menuItem.name,
    price: unitPrice,
    quantity: customization?.quantity ?? 1,
    imageUrl: menuItem.imageUrl,
    variant: sizeLabel,
    addOns: addOnLabels as string[],
    cookingPreference: customization?.cookingPreference,
  };
}
