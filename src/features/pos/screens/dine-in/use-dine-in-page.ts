'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { DineInMenuCategoryId, MenuItemCustomization } from '@/features/pos/config/dine-in';
import { dineInMenuItems } from '@/features/pos/config/dine-in';
import { usePosFlowPaths } from '@/features/pos/hooks/use-pos-flow-paths';
import { createLineFromMenuItem, usePosOrder } from '@/context/pos-order';
import { usePosOrdersStore } from '@/context/pos-orders-store';

export function useDineInPage() {
  const router = useRouter();
  const flowPaths = usePosFlowPaths();
  const { orderLines, setOrderLines, selectedTableId, tableLabel, tableNumber, orderNumber } =
    usePosOrder();
  const { sendToKot, editingOrderId, setEditingOrderId } = usePosOrdersStore();
  const [activeCategory, setActiveCategory] = useState<DineInMenuCategoryId>('all');
  const [customizingItemId, setCustomizingItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [kotSentNotice, setKotSentNotice] = useState<number | null>(null);

  const filteredMenuItems = useMemo(() => {
    const items =
      activeCategory === 'all'
        ? dineInMenuItems
        : dineInMenuItems.filter((item) => item.category === activeCategory);

    const query = searchQuery.trim().toLowerCase();
    if (!query) return items;

    return items.filter(
      (item) => item.name.toLowerCase().includes(query) || item.group.toLowerCase().includes(query),
    );
  }, [activeCategory, searchQuery]);

  const menuQuantities = useMemo(() => {
    return orderLines.reduce<Record<string, number>>((acc, line) => {
      if (!line.menuItemId) return acc;
      acc[line.menuItemId] = (acc[line.menuItemId] ?? 0) + line.quantity;
      return acc;
    }, {});
  }, [orderLines]);

  const subtotal = orderLines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const discount = 0;
  const total = subtotal - discount;
  const itemCount = orderLines.reduce((sum, line) => sum + line.quantity, 0);

  const selectedTable = useMemo(() => {
    const table = tableLabel;
    const waiter = orderLines.length > 0 ? 'Ravi' : undefined;
    return { table, waiter };
  }, [tableLabel, orderLines.length]);

  function handleMenuQuantityChange(menuItemId: string, quantity: number) {
    setOrderLines((prev) => {
      const linesForItem = prev.filter((line) => line.menuItemId === menuItemId);
      if (linesForItem.length === 0) return prev;

      const totalQty = linesForItem.reduce((sum, line) => sum + line.quantity, 0);
      if (quantity >= totalQty) return prev;

      let toRemove = totalQty - quantity;
      const next = [...prev];

      for (let i = next.length - 1; i >= 0 && toRemove > 0; i -= 1) {
        const line = next[i];
        if (line.menuItemId !== menuItemId) continue;

        if (line.quantity <= toRemove) {
          toRemove -= line.quantity;
          next.splice(i, 1);
        } else {
          next[i] = { ...line, quantity: line.quantity - toRemove };
          toRemove = 0;
        }
      }

      return next;
    });
  }

  function handleCustomizeAdd(menuItemId: string, customization: MenuItemCustomization) {
    const created = createLineFromMenuItem(menuItemId, customization);
    if (!created) return;

    setOrderLines((prev) => [...prev, created]);
    setCustomizingItemId(null);
  }

  function handleOrderQuantityChange(lineId: string, quantity: number) {
    setOrderLines((prev) =>
      prev.map((entry) => (entry.id === lineId ? { ...entry, quantity } : entry)),
    );
  }

  function handleRemoveLine(lineId: string) {
    setOrderLines((prev) => prev.filter((entry) => entry.id !== lineId));
  }

  function handleSendToKot() {
    if (!selectedTableId || itemCount === 0) return;

    sendToKot({
      tableId: selectedTableId,
      tableLabel,
      orderNumber,
      lines: orderLines,
      waiter: selectedTable.waiter,
      existingOrderId: editingOrderId,
    });

    setOrderLines([]);
    setKotSentNotice(Date.now());
    router.push(flowPaths.orders);
  }

  function goToTables() {
    router.push(flowPaths.tables);
  }

  return {
    selectedTableId,
    tableLabel,
    tableNumber,
    orderNumber,
    activeCategory,
    setActiveCategory,
    customizingItemId,
    setCustomizingItemId,
    searchQuery,
    setSearchQuery,
    filteredMenuItems,
    menuQuantities,
    orderLines,
    subtotal,
    discount,
    total,
    itemCount,
    selectedTable,
    handleMenuQuantityChange,
    handleCustomizeAdd,
    handleOrderQuantityChange,
    handleRemoveLine,
    handleSendToKot,
    goToTables,
    kotSentNotice,
  };
}

export type DineInPageViewModel = ReturnType<typeof useDineInPage>;
