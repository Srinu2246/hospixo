'use client';

import { useEffect, useMemo, useState } from 'react';

import { useFloorSections } from '@/lib/hooks/floor-and-table-setup/useRestaurantFloors';
import { usePosFloorLayout } from '@/lib/hooks/pos/point-of-sale/tables/usePosFloorLayout';
import { POS_FLOOR_TABS } from '@/lib/mocks/pos/usePosTables.mocks';
import type { PosTableItem } from '@/lib/mocks/pos/usePosTables.mocks';
import { useSidebarStore } from '@/stores/sidebarStore';

/** Floor / section dropdowns for captain mobile menu and table screens (Figma). */
export function useCaptainWorkspaceFloorFilters(table?: PosTableItem | null) {
  const branchId = useSidebarStore((state) => state.context.branchId);
  const floorsQuery = usePosFloorLayout(branchId);
  const floors = useMemo(() => floorsQuery.data ?? [], [floorsQuery.data]);

  const floorTabs = useMemo(
    () =>
      floors.length > 0
        ? floors.map((floor) => ({ id: String(floor.id), label: floor.name }))
        : POS_FLOOR_TABS,
    [floors],
  );

  const [activeFloor, setActiveFloor] = useState(
    () => table?.floorId ?? POS_FLOOR_TABS[0]?.id ?? '',
  );
  const [activeSection, setActiveSection] = useState(() => table?.sectionId ?? '');

  useEffect(() => {
    if (table?.floorId) setActiveFloor(table.floorId);
    if (table?.sectionId) setActiveSection(table.sectionId);
  }, [table?.floorId, table?.sectionId]);

  const numericFloorId = /^\d+$/.test(activeFloor) ? Number(activeFloor) : undefined;
  const sectionsQuery = useFloorSections(branchId, numericFloorId);

  const sectionOptions = useMemo(
    () =>
      (sectionsQuery.data ?? [])
        .filter((section) => section.active)
        .map((section) => ({ id: section.id, label: section.name })),
    [sectionsQuery.data],
  );

  const isSingleSection = sectionOptions.length === 1;

  const resolvedFloor =
    floorTabs.length === 0 || floorTabs.some((tab) => tab.id === activeFloor)
      ? activeFloor
      : (floorTabs[0]?.id ?? activeFloor);
  if (resolvedFloor !== activeFloor) {
    setActiveFloor(resolvedFloor);
  }

  const resolvedSection =
    sectionOptions.length === 0 || sectionOptions.some((option) => option.id === activeSection)
      ? activeSection
      : (sectionOptions[0]?.id ?? activeSection);
  if (resolvedSection !== activeSection) {
    setActiveSection(resolvedSection);
  }

  return {
    floorTabs,
    activeFloor,
    setActiveFloor,
    sectionOptions,
    activeSection,
    setActiveSection,
    sectionDisabled: sectionsQuery.isLoading || isSingleSection,
  };
}
