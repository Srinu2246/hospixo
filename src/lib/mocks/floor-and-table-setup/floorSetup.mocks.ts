import type {
  CatalogFloor,
  CatalogSection,
  CatalogTable,
  FloorActivity,
} from '@/features/management/floor-and-table-setup/types/floorSetup';

const NOW = Date.UTC(2026, 9, 13, 2, 0, 0);

/** Placeholder history until a floor activity API exists. */
export const MOCK_FLOOR_ACTIVITY: FloorActivity[] = [
  { id: 'a1', message: 'Table T12 moved to Terrace', timeLabel: '2 hours ago' },
  { id: 'a2', message: 'Bar Area capacity updated to 24', timeLabel: '5 hours ago' },
  { id: 'a3', message: 'VIP Room set to Maintenance', timeLabel: '1 day ago' },
  { id: 'a4', message: 'New section Lounge added', timeLabel: '2 days ago' },
  { id: 'a5', message: 'Floor published by Admin', timeLabel: '3 days ago' },
];

const groundSections: CatalogSection[] = [
  {
    id: 'main-dining',
    name: 'Main Dining',
    code: 'MD-001',
    description:
      'The primary dining room area characterized by ambient warm lighting, main floor access, and proximity to the kitchen for fast service routing.',
    active: true,
    tableCount: 12,
    seatCount: 48,
    activeTableCount: 10,
    inactiveTableCount: 2,
  },
  {
    id: 'bar-area',
    name: 'Bar Area',
    code: 'BA-001',
    description: 'Counter and high-top seating beside the bar.',
    active: true,
    tableCount: 6,
    seatCount: 24,
    activeTableCount: 6,
    inactiveTableCount: 0,
  },
  {
    id: 'outdoor-patio',
    name: 'Outdoor Patio',
    code: 'OP-001',
    description: 'Open-air seating along the garden edge.',
    active: true,
    tableCount: 8,
    seatCount: 32,
    activeTableCount: 8,
    inactiveTableCount: 0,
  },
  {
    id: 'vip-lounge',
    name: 'VIP Lounge',
    code: 'VL-001',
    description: 'Reserved lounge for hosted parties.',
    active: true,
    tableCount: 4,
    seatCount: 16,
    activeTableCount: 4,
    inactiveTableCount: 0,
  },
  {
    id: 'private-dining',
    name: 'Private Dining',
    code: 'PD-001',
    description: 'Closed room for private bookings.',
    active: true,
    tableCount: 2,
    seatCount: 12,
    activeTableCount: 2,
    inactiveTableCount: 0,
  },
  {
    id: 'rooftop-section',
    name: 'Rooftop Terrace',
    code: 'RT-001',
    description: 'Upper terrace seating, currently closed for service.',
    active: false,
    tableCount: 10,
    seatCount: 40,
    activeTableCount: 0,
    inactiveTableCount: 10,
  },
];

const groundTables: CatalogTable[] = [
  table('T001', 4, true, 'main-dining', 'Main Hall', 'Square'),
  table('T002', 2, true, 'main-dining', 'Main Hall', 'Round'),
  table('T003', 4, true, 'main-dining', 'Main Hall', 'Square'),
  table('T004', 6, true, 'main-dining', 'Main Hall', 'Rectangle'),
  table('T005', 2, false, 'main-dining', 'Main Hall', 'Round'),
  table('T006', 8, true, 'main-dining', 'Main Hall', 'Rectangle'),
  table('T007', 4, true, 'main-dining', 'Main Hall', 'Square'),
  table('T008', 6, false, 'main-dining', 'Window', 'Square'),
  table('T009', 4, true, 'main-dining', 'Window', 'Square'),
  table('T010', 2, false, 'main-dining', 'Window', 'Round'),
  table('T011', 10, true, 'main-dining', 'Window', 'Rectangle'),
  table('T012', 5, true, 'main-dining', 'Window', 'Round'),
  table('T013', 3, false, 'bar-area', 'Bar', 'Round'),
  table('T014', 7, true, 'bar-area', 'Bar', 'Rectangle'),
  table('T015', 1, true, 'bar-area', 'Bar', 'Round'),
  table('T016', 9, true, 'bar-area', 'Bar', 'Rectangle'),
  table('T017', 2, false, 'bar-area', 'Bar', 'Round'),
  table('T018', 3, true, 'bar-area', 'Bar', 'Square'),
  table('T019', 5, true, 'outdoor-patio', 'Patio', 'Square'),
  table('T020', 8, false, 'outdoor-patio', 'Patio', 'Rectangle'),
  table('T021', 12, true, 'outdoor-patio', 'Patio', 'Rectangle'),
  table('T022', 6, true, 'outdoor-patio', 'Patio', 'Square'),
  table('T023', 5, false, 'outdoor-patio', 'Patio', 'Round'),
  table('T024', 4, true, 'outdoor-patio', 'Patio', 'Square'),
  table('T025', 11, true, 'outdoor-patio', 'Patio', 'Rectangle'),
  table('T026', 1, false, 'outdoor-patio', 'Patio', 'Round'),
  table('T027', 9, true, 'vip-lounge', 'Lounge', 'Square'),
  table('T028', 3, true, 'vip-lounge', 'Lounge', 'Round'),
  table('T029', 7, false, 'private-dining', 'Private', 'Rectangle'),
  table('T030', 2, true, 'private-dining', 'Private', 'Round'),
];

export const floorSetupCatalog: CatalogFloor[] = [
  {
    id: 'ground-floor',
    name: 'Ground Floor',
    code: 'GF-001',
    type: 'indoor',
    description: 'Enter floor description',
    active: true,
    branch: 'Hyderabad',
    createdBy: 'Admin',
    createdOn: '15 Jan 2025',
    updatedLabel: 'Updated 2 hrs ago',
    updatedAt: NOW - 2 * 60 * 60 * 1000,
    tableCount: 42,
    seatCount: 178,
    hubTableCount: 48,
    hubSeatCount: 192,
    activeTableCount: 40,
    maintenanceCount: 2,
    sections: groundSections,
    tables: groundTables,
    activity: MOCK_FLOOR_ACTIVITY,
  },
  floorSummary({
    id: 'rooftop-terrace',
    name: 'Rooftop Terrace',
    code: 'RF-001',
    type: 'outdoor',
    tableCount: 32,
    seatCount: 128,
    updatedLabel: 'Updated 1 day ago',
    updatedAt: NOW - 24 * 60 * 60 * 1000,
    sectionName: 'Terrace Dining',
  }),
  floorSummary({
    id: 'vip-lounge',
    name: 'VIP Lounge',
    code: 'VP-001',
    type: 'vip',
    tableCount: 12,
    seatCount: 48,
    updatedLabel: 'Updated 3 days ago',
    updatedAt: NOW - 3 * 24 * 60 * 60 * 1000,
    sectionName: 'Lounge',
  }),
  floorSummary({
    id: 'banquet-hall',
    name: 'Banquet Hall',
    code: 'BH-001',
    type: 'banquet',
    tableCount: 80,
    seatCount: 400,
    updatedLabel: 'Updated 1 week ago',
    updatedAt: NOW - 7 * 24 * 60 * 60 * 1000,
    sectionName: 'Banquet',
  }),
  floorSummary({
    id: 'garden-courtyard',
    name: 'Garden Courtyard',
    code: 'GC-001',
    type: 'outdoor',
    tableCount: 20,
    seatCount: 80,
    updatedLabel: 'Updated 2 weeks ago',
    updatedAt: NOW - 14 * 24 * 60 * 60 * 1000,
    sectionName: 'Courtyard',
  }),
  floorSummary({
    id: 'basement-bar',
    name: 'Basement Bar',
    code: 'BB-001',
    type: 'indoor',
    tableCount: 30,
    seatCount: 120,
    updatedLabel: 'Updated 1 month ago',
    updatedAt: NOW - 30 * 24 * 60 * 60 * 1000,
    sectionName: 'Bar',
  }),
];

export function findCatalogFloor(floorId: string): CatalogFloor | null {
  return floorSetupCatalog.find((floor) => floor.id === floorId) ?? null;
}

type CatalogSessionSlice = {
  sections: CatalogSection[];
  tables: CatalogTable[];
};

const catalogListeners = new Set<() => void>();
const catalogSession = new Map<string, CatalogSessionSlice>();
const catalogPublished = new Map<string, CatalogFloor>();

function subscribeCatalogSession(listener: () => void): () => void {
  catalogListeners.add(listener);
  return () => catalogListeners.delete(listener);
}

export function readCatalogSession(floorId: string): CatalogFloor | null {
  const base = findCatalogFloor(floorId);
  if (!base) return null;
  const slice = catalogSession.get(floorId);
  if (!slice) return base;
  const cached = catalogPublished.get(floorId);
  if (cached && cached.sections === slice.sections && cached.tables === slice.tables) return cached;
  const next = { ...base, sections: slice.sections, tables: slice.tables };
  catalogPublished.set(floorId, next);
  return next;
}

function writeCatalogSession(floorId: string, patch: Partial<CatalogSessionSlice>): void {
  const current = readCatalogSession(floorId);
  if (!current) return;
  catalogSession.set(floorId, {
    sections: patch.sections ?? [...current.sections],
    tables: patch.tables ?? [...current.tables],
  });
  catalogListeners.forEach((listener) => listener());
}

function table(
  number: string,
  seats: number,
  active: boolean,
  sectionId: string,
  area: string,
  shape: string,
): CatalogTable {
  return {
    id: number.toLowerCase(),
    number,
    seats,
    active,
    reservations: active,
    sectionId,
    area,
    shape,
  };
}

function floorSummary(input: {
  id: string;
  name: string;
  code: string;
  type: CatalogFloor['type'];
  tableCount: number;
  seatCount: number;
  updatedLabel: string;
  updatedAt: number;
  sectionName: string;
}): CatalogFloor {
  const sectionId = `${input.id}-main`;
  return {
    id: input.id,
    name: input.name,
    code: input.code,
    type: input.type,
    description: `${input.name} service area.`,
    active: true,
    branch: 'Hyderabad',
    createdBy: 'Admin',
    createdOn: '15 Jan 2025',
    updatedLabel: input.updatedLabel,
    updatedAt: input.updatedAt,
    tableCount: input.tableCount,
    seatCount: input.seatCount,
    hubTableCount: input.tableCount,
    hubSeatCount: input.seatCount,
    activeTableCount: input.tableCount,
    maintenanceCount: 0,
    sections: [
      {
        id: sectionId,
        name: input.sectionName,
        code: `${input.code}-S`,
        description: `Primary section on ${input.name}.`,
        active: true,
        tableCount: input.tableCount,
        seatCount: input.seatCount,
        activeTableCount: input.tableCount,
        inactiveTableCount: 0,
      },
    ],
    tables: [
      table('T001', 4, true, sectionId, input.sectionName, 'Square'),
      table('T002', 4, true, sectionId, input.sectionName, 'Round'),
    ],
    activity: [
      {
        id: `${input.id}-a1`,
        message: 'Floor published by Admin',
        timeLabel: input.updatedLabel.replace('Updated ', ''),
      },
    ],
  };
}
