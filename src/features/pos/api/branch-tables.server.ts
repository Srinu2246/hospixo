import 'server-only';

import type { FloorTableItem } from '@/features/floor-table-setup/types/floor-table-setup';
import type { FloorDto, TableDto } from '@/features/floor-table-setup/types/floor-table';
import { mapTableToBranchView } from '@/features/pos/lib/map-branch-table';
import type { BranchFloorSection, BranchTablesOverview } from '@/features/pos/types/branch-tables';
import { loadFloorsWithTablesPageData } from '@/lib/floors-server';

type GetBranchTablesOverviewInput = Readonly<{
  branchId: number;
  floorId?: number | null;
}>;

function mapFloorToDto(
  floor: { id: string; name: string; status: string; tableCount: number },
  branchId: number,
): FloorDto {
  return {
    id: Number(floor.id),
    branch_id: branchId,
    name: floor.name,
    status: floor.status === 'active' ? 'active' : 'inactive',
    table_count: floor.tableCount,
  };
}

function mapTableToDto(table: FloorTableItem, branchId: number, floorId: number): TableDto {
  return {
    id: Number(table.id),
    floor_id: floorId,
    branch_id: branchId,
    name: table.number,
    seats: table.capacity,
    shape: table.shape,
    status: table.configStatus === 'active' ? 'active' : 'inactive',
  };
}

/** Aggregate active floors + tables for branch operations (server / BFF only). */
export async function getBranchTablesOverview({
  branchId,
  floorId,
}: GetBranchTablesOverviewInput): Promise<BranchTablesOverview> {
  const data = await loadFloorsWithTablesPageData({
    activeBranchId: branchId,
    preferredBranchId: branchId,
  });

  const floors = data.floors.map((floor) => mapFloorToDto(floor, branchId));
  const floorsToLoad =
    floorId != null && floorId > 0
      ? data.floors.filter((floor) => Number(floor.id) === floorId)
      : data.floors;

  const sections: BranchFloorSection[] = floorsToLoad.map((floor) => {
    const floorDto = mapFloorToDto(floor, branchId);
    const floorIdNum = Number(floor.id);
    const tables = (floor.tables ?? []).map((table) =>
      mapTableToBranchView(mapTableToDto(table, branchId, floorIdNum)),
    );
    return { floor: floorDto, tables };
  });

  return {
    floors,
    sections,
    selectedFloorId: floorId ?? null,
  };
}
