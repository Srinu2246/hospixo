import { listFloors, listTables } from '@/lib/api/floors';
import { mapTableToBranchView } from '@/features/pos/lib/map-branch-table';
import type { BranchFloorSection, BranchTablesOverview } from '@/features/pos/types/branch-tables';

type GetBranchTablesOverviewInput = Readonly<{
  token: string;
  branchId: number;
  floorId?: number | null;
}>;

/** Aggregate active floors + tables for branch operations (server / BFF only). */
export async function getBranchTablesOverview({
  token,
  branchId,
  floorId,
}: GetBranchTablesOverviewInput): Promise<BranchTablesOverview> {
  const floorsResponse = await listFloors(token, branchId, { status: 'active' });
  const floors = floorsResponse.items;

  const floorsToLoad =
    floorId != null && floorId > 0 ? floors.filter((floor) => floor.id === floorId) : floors;

  const sections: BranchFloorSection[] = [];

  for (const floor of floorsToLoad) {
    const tablesResponse = await listTables(token, branchId, floor.id, { status: 'active' });
    sections.push({
      floor,
      tables: tablesResponse.items.map(mapTableToBranchView),
    });
  }

  return {
    floors,
    sections,
    selectedFloorId: floorId ?? null,
  };
}
