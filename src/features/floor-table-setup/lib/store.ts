import type { Floor } from '@/features/floor-table-setup/types/floor-table-setup';

const STORAGE_KEY = 'hospixo.floor-table-setup.created';

function readCreatedFloors(): Floor[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Floor[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCreatedFloors(floors: readonly Floor[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(floors));
  } catch {
    /* ignore private-mode storage errors */
  }
}

export function listCreatedFloors(): readonly Floor[] {
  return readCreatedFloors();
}

export function addCreatedFloor(floor: Floor) {
  writeCreatedFloors([floor, ...readCreatedFloors()]);
}

export function findCreatedFloor(floorId: string) {
  return readCreatedFloors().find((floor) => floor.id === floorId);
}
