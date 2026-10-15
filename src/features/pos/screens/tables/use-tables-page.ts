'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { PosTableFilterId, TableStatus } from '@/features/pos/config/tables';
import { normalizeTableId } from '@/features/pos/config/tables';
import { usePosFlowPaths } from '@/features/pos/hooks/use-pos-flow-paths';
import { useDineInMenu } from '@/features/pos/hooks/use-dine-in-menu';
import { usePosTables } from '@/features/pos/hooks/use-pos-tables';
import { usePosOrder } from '@/context/pos-order';

const filterStatusMap: Record<Exclude<PosTableFilterId, 'all'>, TableStatus[]> = {
  available: ['available'],
  occupied: ['occupied', 'kotSent', 'preparing', 'ready'],
  billing: ['billing'],
};

export function useTablesPage() {
  const router = useRouter();
  const flowPaths = usePosFlowPaths();
  const { selectedTableId, setSelectedTable } = usePosOrder();
  const { data: tableData, isFetching, isError, error } = usePosTables();
  const {
    data: menuData,
    isFetching: isMenuLoading,
    isError: isMenuError,
    error: menuQueryError,
  } = useDineInMenu();
  const menuItems = useMemo(() => menuData?.items ?? [], [menuData?.items]);
  const posFloors = useMemo(() => tableData?.floors ?? [], [tableData?.floors]);
  const posTables = useMemo(() => tableData?.tables ?? [], [tableData?.tables]);
  const [activeFloorId, setActiveFloorId] = useState('');
  const [activeFilter, setActiveFilter] = useState<PosTableFilterId>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const defaultFloorId = posFloors[0]?.id ?? '';
  const resolvedFloorId =
    activeFloorId && posFloors.some((floor) => floor.id === activeFloorId)
      ? activeFloorId
      : defaultFloorId;

  const visibleTables = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return posTables.filter((table) => {
      if (table.floorId !== resolvedFloorId) return false;

      if (activeFilter !== 'all') {
        const allowed = filterStatusMap[activeFilter];
        if (!allowed.includes(table.status)) return false;
      }

      if (!query) return true;
      return (
        table.label.toLowerCase().includes(query) || table.waiter?.toLowerCase().includes(query)
      );
    });
  }, [resolvedFloorId, activeFilter, posTables, searchQuery]);

  const selectedTable = useMemo(
    () =>
      posTables.find((table) => normalizeTableId(table.id) === normalizeTableId(selectedTableId)) ??
      null,
    [posTables, selectedTableId],
  );

  function handleDesktopTableSelect(tableId: string) {
    const table = posTables.find(
      (entry) => normalizeTableId(entry.id) === normalizeTableId(tableId),
    );
    setSelectedTable(tableId, table?.label);
    router.push(flowPaths.dineIn);
  }

  function handleCompactTableSelect(tableId: string) {
    const table = posTables.find(
      (entry) => normalizeTableId(entry.id) === normalizeTableId(tableId),
    );
    setSelectedTable(tableId, table?.label);
    router.push(flowPaths.dineIn);
  }

  function handleOrderMenu() {
    if (!selectedTableId) return;
    router.push(flowPaths.dineIn);
  }

  return {
    activeFloorId: resolvedFloorId,
    setActiveFloorId,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    visibleTables,
    posFloors,
    selectedTable,
    selectedTableId,
    isFetching,
    isError,
    loadError: error instanceof Error ? error.message : (tableData?.loadError ?? null),
    dataSource: tableData?.source ?? 'backend',
    hasAnyTables: posTables.length > 0,
    handleDesktopTableSelect,
    handleCompactTableSelect,
    handleOrderMenu,
    isMenuLoading,
    isMenuError,
    menuError: isMenuError && menuQueryError instanceof Error ? menuQueryError.message : null,
    menuLoadWarning:
      !isMenuLoading && menuItems.length === 0 ? (menuData?.loadError ?? null) : null,
    menuIsEmpty: !isMenuLoading && menuItems.length === 0,
  };
}

export type TablesPageViewModel = ReturnType<typeof useTablesPage>;
