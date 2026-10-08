import type { PosFloor, PosTable, TableStatus } from '@/features/pos/config/tables';
import type { Floor, FloorTableItem } from '@/features/floor-table-setup/types/floor-table-setup';

function mapOperationalStatus(table: FloorTableItem): TableStatus {
  if (table.configStatus === 'inactive') return 'cleaning';
  switch (table.status) {
    case 'occupied':
      return 'occupied';
    case 'reserved':
      return 'occupied';
    case 'available':
    default:
      return 'available';
  }
}

export function mapFloorTablesToPos(floors: readonly Floor[]): Readonly<{
  floors: PosFloor[];
  tables: PosTable[];
}> {
  const posFloors: PosFloor[] = floors.map((floor) => ({
    id: floor.id,
    label: floor.name,
  }));

  const posTables: PosTable[] = floors.flatMap((floor) =>
    (floor.tables ?? []).map((table) => ({
      id: table.id,
      label: table.number,
      floorId: floor.id,
      status: mapOperationalStatus(table),
      placeholder: table.status === 'available' ? 'Tap to open' : undefined,
    })),
  );

  return { floors: posFloors, tables: posTables };
}
