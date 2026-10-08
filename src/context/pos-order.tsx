'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import type { DineInOrderLine, MenuItemCustomization } from '@/features/pos/config/dine-in';
import { computeCustomizedUnitPrice, dineInMenuItems } from '@/features/pos/config/dine-in';
import {
  INITIAL_ORDER_SEQUENCE,
  formatPosOrderNumber,
  getDemoPosOrderState,
  getEmptyPosOrderState,
  getTableLabel,
  getTableNumber,
} from '@/features/pos/lib/order/state';

interface PosOrderContextValue {
  orderLines: DineInOrderLine[];
  setOrderLines: React.Dispatch<React.SetStateAction<DineInOrderLine[]>>;
  menuQuantities: Record<string, number>;
  setMenuQuantities: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  selectedTableId: string;
  setSelectedTableId: (tableId: string) => void;
  tableLabel: string;
  tableNumber: string;
  orderNumber: string;
  resetOrder: () => void;
  completeOrder: () => void;
}

const PosOrderContext = createContext<PosOrderContextValue | null>(null);

export function PosOrderProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const demoState = getDemoPosOrderState();
  const [orderSequence, setOrderSequence] = useState(INITIAL_ORDER_SEQUENCE);
  const [selectedTableId, setSelectedTableId] = useState(demoState.selectedTableId);
  const [menuQuantities, setMenuQuantities] = useState<Record<string, number>>(
    demoState.menuQuantities,
  );
  const [orderLines, setOrderLines] = useState<DineInOrderLine[]>(demoState.orderLines);

  const resetOrder = useCallback(() => {
    const emptyState = getEmptyPosOrderState();
    setSelectedTableId(emptyState.selectedTableId);
    setMenuQuantities(emptyState.menuQuantities);
    setOrderLines(emptyState.orderLines);
  }, []);

  const completeOrder = useCallback(() => {
    setOrderSequence((current) => current + 1);
    resetOrder();
  }, [resetOrder]);

  const tableLabel = useMemo(() => getTableLabel(selectedTableId), [selectedTableId]);
  const tableNumber = useMemo(() => getTableNumber(selectedTableId), [selectedTableId]);
  const orderNumber = useMemo(() => formatPosOrderNumber(orderSequence), [orderSequence]);

  const value = useMemo(
    () => ({
      orderLines,
      setOrderLines,
      menuQuantities,
      setMenuQuantities,
      selectedTableId,
      setSelectedTableId,
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
  menuItemId: string,
  customization?: MenuItemCustomization,
): DineInOrderLine | null {
  const menuItem = dineInMenuItems.find((item) => item.id === menuItemId);
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
