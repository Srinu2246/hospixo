'use client';

import { useMemo, useState } from 'react';

import { useFloorSections } from '@/lib/hooks/floor-and-table-setup/useRestaurantFloors';
import { usePosFloorLayout } from '@/lib/hooks/pos/point-of-sale/tables/usePosFloorLayout';
import type { PosTableItem } from '@/lib/schemas/pos/point-of-sale/tables/posTableViewSchema';
import { useSidebarStore } from '@/stores/sidebarStore';

/** Floor / section dropdowns for captain mobile menu and table screens (Figma). */
export function useCaptainWorkspaceFloorFilters(table?: PosTableItem | null) {
  const branchId = useSidebarStore((state) => state.context.branchId);
  const floorsQuery = usePosFloorLayout(branchId);
  const floors = useMemo(() => floorsQuery.data ?? [], [floorsQuery.data]);

  const floorTabs = useMemo(
    () =>
      floors.length > 0 ? floors.map((floor) => ({ id: String(floor.id), label: floor.name })) : [],
    [floors],
  );

  const [activeFloor, setActiveFloor] = useState(() => table?.floorId ?? '');
  const [activeSection, setActiveSection] = useState(() => table?.sectionId ?? '');

  const activeFloorResolved = useMemo(() => {
    if (
      activeFloor &&
      (floors.length === 0 || floors.some((floor) => String(floor.id) === activeFloor))
    ) {
      return activeFloor;
    }
    if (table?.floorId && floors.some((floor) => String(floor.id) === table.floorId)) {
      return table.floorId;
    }
    return floors.length > 0 ? String(floors[0].id) : '';
  }, [activeFloor, floors, table]);

  const numericFloorId = useMemo(() => {
    if (!/^\d+$/.test(activeFloorResolved)) return undefined;
    const id = Number(activeFloorResolved);
    if (floors.length > 0 && !floors.some((floor) => floor.id === id)) return undefined;
    return id;
  }, [activeFloorResolved, floors]);

  const sectionsQuery = useFloorSections(branchId, numericFloorId);

  const sectionOptions = useMemo(
    () =>
      (sectionsQuery.data ?? [])
        .filter((section) => section.active)
        .map((section) => ({ id: section.id, label: section.name })),
    [sectionsQuery.data],
  );

  const isSingleSection = sectionOptions.length === 1;

  const activeSectionResolved = useMemo(() => {
    if (activeSection && sectionOptions.some((option) => option.id === activeSection)) {
      return activeSection;
    }
    if (table?.sectionId && sectionOptions.some((option) => option.id === table.sectionId)) {
      return table.sectionId;
    }
    return sectionOptions[0]?.id ?? '';
  }, [activeSection, sectionOptions, table]);

  return {
    floorTabs,
    activeFloor: activeFloorResolved,
    setActiveFloor,
    sectionOptions,
    activeSection: activeSectionResolved,
    setActiveSection,
    sectionDisabled: sectionsQuery.isLoading || isSingleSection,
  };
}
