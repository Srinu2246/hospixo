import { floors } from '@/features/floor-table-setup/config';
import { findCreatedFloor, listCreatedFloors } from '@/features/floor-table-setup/lib/store';
import type { Floor } from '@/features/floor-table-setup/types/floor-table-setup';

export function resolveFloor(floorId: string): Floor | undefined {
  return findCreatedFloor(floorId) ?? floors.find((floor) => floor.id === floorId);
}

export async function getFloors(): Promise<readonly Floor[]> {
  const created = listCreatedFloors();
  const createdIds = new Set(created.map((floor) => floor.id));
  return [...created, ...floors.filter((floor) => !createdIds.has(floor.id))];
}

export async function getFloorById(floorId: string): Promise<Floor | undefined> {
  return resolveFloor(floorId);
}
