import { floorDetailTabs, floorHistoryLogs } from '@/features/floor-table-setup/config';
import {
  filterByQuery,
  enrichSetupDraftWithSectionStats,
} from '@/features/floor-table-setup/lib/draft';
import type {
  Floor,
  FloorDetailTabId,
  FloorDraftForm,
  FloorHistoryEntry,
  FloorHistoryLog,
  FloorSection,
  FloorSetupDraft,
  FloorTableItem,
  HistoryActionFilter,
  SectionDraft,
  TableConfigStatus,
  TableDraft,
  TableStatusHistoryEntry,
} from '@/features/floor-table-setup/types/floor-table-setup';

export function isFloorDetailTab(value: string | null): value is FloorDetailTabId {
  return Boolean(value && floorDetailTabs.some((tab) => tab.id === value));
}

export function parseFloorDetailTab(value: string | null): FloorDetailTabId {
  return isFloorDetailTab(value) ? value : 'overview';
}

export function floorToDraftForm(floor: Floor): FloorDraftForm {
  return {
    name: floor.name,
    code: floor.code ?? '',
    type: floor.type ?? '',
    description: floor.description,
    active: floor.status === 'active',
  };
}

export function sectionToDraft(section: FloorSection): SectionDraft {
  return {
    id: section.id,
    name: section.name,
    code: section.code ?? '',
    description: section.description ?? '',
    active: section.status === 'active',
    tableCount: section.tableCount,
    seatCount: section.seatCount,
    version: section.version,
    isDefault: section.isDefault,
  };
}

export function tableToDraft(table: FloorTableItem): TableDraft {
  return {
    id: table.id,
    number: table.number,
    capacity: table.capacity,
    status: table.status,
    reservations: table.reservations,
    sectionId: table.sectionId,
    version: table.version,
  };
}

export function tableDraftToFloorTableItem(
  table: TableDraft,
  sections: readonly SectionDraft[],
): FloorTableItem {
  const section = sections.find((item) => item.id === table.sectionId);
  return {
    id: table.id,
    number: table.number,
    capacity: table.capacity,
    status: table.status,
    configStatus: 'active',
    reservations: table.reservations,
    area: section?.name ?? sections[0]?.name ?? '',
    shape: 'square',
    sectionId: table.sectionId,
    version: table.version,
  };
}

/** Backend floor (with sections + tables) → wizard draft. */
export function floorToSetupDraft(floor: Floor): FloorSetupDraft {
  const tables = tablesForFloor(floor).map(tableToDraft);
  return enrichSetupDraftWithSectionStats({
    floor: floorToDraftForm(floor),
    sections: floor.sections.map(sectionToDraft),
    tables,
  });
}

export function tablesForFloor(floor: Floor): FloorTableItem[] {
  if (floor.tables?.length) return [...floor.tables];
  return [];
}

export function tablesForSection(
  tables: readonly FloorTableItem[],
  sectionId: string,
): FloorTableItem[] {
  return tables.filter((table) => table.sectionId === sectionId);
}

export function sectionStatsFromTables(
  section: FloorSection,
  tables: readonly FloorTableItem[],
): Pick<FloorSection, 'tableCount' | 'seatCount'> {
  const sectionTables = tablesForSection(tables, section.id);
  if (sectionTables.length === 0) {
    return { tableCount: section.tableCount, seatCount: section.seatCount };
  }
  return {
    tableCount: sectionTables.length,
    seatCount: sectionTables.reduce((sum, table) => sum + table.capacity, 0),
  };
}

export function historyForFloor(floor: Floor): FloorHistoryLog {
  const log = floorHistoryLogs[floor.id];
  if (log) return log;

  const tables = tablesForFloor(floor);
  return {
    stats: {
      reserved: tables.filter((table) => table.status === 'reserved').length,
      occupied: tables.filter((table) => table.status === 'occupied').length,
      notReserved: tables.filter((table) => table.status === 'available').length,
    },
    general: floor.activity.map((item) => ({
      id: item.id,
      occurredAt: item.occurredAt,
      action: 'update' as const,
      changedBy: floor.createdBy,
      previousValue: '—',
      newValue: item.message,
    })),
    tableStatus: [],
  };
}

export function filterHistoryEntries(
  entries: readonly FloorHistoryEntry[],
  query: string,
  action: HistoryActionFilter,
  date: string,
): FloorHistoryEntry[] {
  const byAction =
    action === 'all' ? [...entries] : entries.filter((entry) => entry.action === action);
  const byDate = date
    ? byAction.filter((entry) => entry.occurredAt.slice(0, 10) === date)
    : byAction;
  return filterByQuery(
    byDate,
    query,
    (entry) => `${entry.changedBy} ${entry.previousValue} ${entry.newValue} ${entry.action}`,
  );
}

export function filterTableStatusHistory(
  entries: readonly TableStatusHistoryEntry[],
  query: string,
  date: string,
): TableStatusHistoryEntry[] {
  const byDate = date
    ? entries.filter((entry) => entry.occurredAt.slice(0, 10) === date)
    : [...entries];
  return filterByQuery(
    byDate,
    query,
    (entry) => `${entry.tableNumber} ${entry.guestName} ${entry.source}`,
  );
}

export function paginate<T>(
  items: readonly T[],
  page: number,
  pageSize: number,
): { items: T[]; page: number; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: current,
    totalPages,
  };
}

export function isTableConfigStatus(value: string): value is TableConfigStatus {
  return value === 'active' || value === 'inactive' || value === 'maintenance';
}

export function isTableShape(value: string): value is FloorTableItem['shape'] {
  return value === 'round' || value === 'square' || value === 'rectangle';
}
