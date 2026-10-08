import type { FloorDto, TableDto } from '@/features/floor-table-setup/types/floor-table';

/** Live floor operations status (distinct from setup active/inactive). */
export type TableOperationalStatus = 'vacant' | 'occupied' | 'billing' | 'reserved' | 'inactive';

export type BranchTableView = Readonly<{
  id: number;
  floorId: number;
  name: string;
  seats: number;
  shape: NonNullable<TableDto['shape']>;
  operationalStatus: TableOperationalStatus;
  sortOrder: number | null;
}>;

export type BranchFloorSection = Readonly<{
  floor: FloorDto;
  tables: readonly BranchTableView[];
}>;

export type BranchTablesOverview = Readonly<{
  floors: readonly FloorDto[];
  sections: readonly BranchFloorSection[];
  selectedFloorId: number | null;
}>;
