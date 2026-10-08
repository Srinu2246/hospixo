import 'server-only';

import { posFloors, posTables, type PosFloor, type PosTable } from '@/features/pos/config/tables';
import { mapFloorTablesToPos } from '@/features/pos/lib/map-floors-to-pos';
import { loadFloorsPageData, type FloorRequestOptions } from '@/lib/floors-server';

export type PosTablesPayload = Readonly<{
  floors: PosFloor[];
  tables: PosTable[];
  branchId: number | null;
  source: 'backend' | 'fallback';
  loadError: string | null;
}>;

export async function loadPosTablesData(
  options: FloorRequestOptions = {},
): Promise<PosTablesPayload> {
  const result = await loadFloorsPageData(options);

  if (result.error || result.floors.length === 0) {
    return {
      floors: [...posFloors],
      tables: [...posTables],
      branchId: result.branchId,
      source: 'fallback',
      loadError: result.error,
    };
  }

  const mapped = mapFloorTablesToPos(result.floors);
  if (mapped.tables.length === 0) {
    return {
      floors: mapped.floors.length > 0 ? mapped.floors : [...posFloors],
      tables: [...posTables],
      branchId: result.branchId,
      source: 'fallback',
      loadError: null,
    };
  }

  return {
    floors: mapped.floors,
    tables: mapped.tables,
    branchId: result.branchId,
    source: 'backend',
    loadError: null,
  };
}
