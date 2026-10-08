import 'server-only';

import { mapFloorTablesToPos } from '@/features/pos/lib/map-floors-to-pos';
import { loadFloorsWithTablesPageData, type FloorRequestOptions } from '@/lib/floors-server';
import type { PosFloor, PosTable } from '@/features/pos/config/tables';

export type PosTablesPayload = Readonly<{
  floors: PosFloor[];
  tables: PosTable[];
  branchId: number | null;
  source: 'backend';
  loadError: string | null;
}>;

export async function loadPosTablesData(
  options: FloorRequestOptions = {},
): Promise<PosTablesPayload> {
  const result = await loadFloorsWithTablesPageData(options);
  const mapped = mapFloorTablesToPos(result.floors);

  return {
    floors: mapped.floors,
    tables: mapped.tables,
    branchId: result.branchId,
    source: 'backend',
    loadError: result.error,
  };
}
