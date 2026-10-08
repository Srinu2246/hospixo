import type {
  FloorHistoryEntry,
  FloorHistoryLog,
  HistoryActionId,
  TableStatusHistoryEntry,
} from '@/features/floor-table-setup/types/floor-table-setup';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function isoAgo(ms: number) {
  return new Date(Date.now() - ms).toISOString();
}

function general(
  id: string,
  hoursAgo: number,
  action: HistoryActionId,
  changedBy: string,
  previousValue: string,
  newValue: string,
): FloorHistoryEntry {
  return {
    id,
    occurredAt: isoAgo(hoursAgo * HOUR),
    action,
    changedBy,
    previousValue,
    newValue,
  };
}

function tableStatus(
  id: string,
  hoursAgo: number,
  tableNumber: string,
  guestName: string,
  partySize: number,
  source: string,
): TableStatusHistoryEntry {
  return {
    id,
    occurredAt: isoAgo(hoursAgo * HOUR),
    tableNumber,
    guestName,
    partySize,
    source,
  };
}

const groundHistory: FloorHistoryLog = {
  stats: {
    reserved: 8,
    occupied: 14,
    notReserved: 26,
  },
  general: [
    general('g-h1', 2, 'update', 'Admin', 'Ground Floor A', 'Ground Floor'),
    general('g-h2', 5, 'settings', 'Admin', 'Reservations off', 'Reservations on'),
    general('g-h3', 24, 'create', 'Manager', '—', 'Section Main Dining'),
    general('g-h4', 30, 'update', 'Admin', '48 seats', '52 seats'),
    general('g-h5', 48, 'create', 'Admin', '—', 'Table T012'),
    general('g-h6', 56, 'delete', 'Manager', 'Table T018', '—'),
    general('g-h7', 72, 'settings', 'Admin', 'Draft', 'Active'),
    general('g-h8', 96, 'update', 'Admin', 'Indoor Dining', 'Indoor Dining'),
  ],
  tableStatus: [
    tableStatus('g-t1', 1, 'T003', 'Priya Shah', 6, 'Reservation'),
    tableStatus('g-t2', 2, 'T012', 'Rahul Mehta', 4, 'Walk-in'),
    tableStatus('g-t3', 3, 'T002', 'Aisha Khan', 2, 'Reservation'),
    tableStatus('g-t4', 6, 'T009', 'Hotel Guest', 8, 'In-house'),
    tableStatus('g-t5', 10, 'T001', 'Walk-in party', 4, 'Walk-in'),
    tableStatus('g-t6', 26, 'T005', 'Bar booking', 2, 'Reservation'),
  ],
};

export const floorHistoryLogs: Readonly<Record<string, FloorHistoryLog>> = {
  ground: groundHistory,
};
