import type {
  FloorTableItem,
  FloorTableStatus,
  TableConfigStatus,
  TableShape,
} from '@/features/floor-table-setup/types/floor-table-setup';

type TableSeed = Readonly<{
  number: string;
  sectionId: string;
  area: string;
  capacity: number;
  shape: TableShape;
  configStatus: TableConfigStatus;
  status: FloorTableStatus;
  reservations: boolean;
}>;

function toTable(floorId: string, seed: TableSeed): FloorTableItem {
  return {
    id: `${floorId}-${seed.number.toLowerCase()}`,
    number: seed.number,
    sectionId: seed.sectionId,
    area: seed.area,
    capacity: seed.capacity,
    shape: seed.shape,
    configStatus: seed.configStatus,
    status: seed.status,
    reservations: seed.reservations,
  };
}

const groundSeeds: readonly TableSeed[] = [
  {
    number: 'T001',
    sectionId: 'main-dining',
    area: 'Main Dining',
    capacity: 4,
    shape: 'round',
    configStatus: 'active',
    status: 'available',
    reservations: true,
  },
  {
    number: 'T002',
    sectionId: 'main-dining',
    area: 'Main Dining',
    capacity: 4,
    shape: 'round',
    configStatus: 'active',
    status: 'reserved',
    reservations: true,
  },
  {
    number: 'T003',
    sectionId: 'main-dining',
    area: 'Main Dining',
    capacity: 6,
    shape: 'rectangle',
    configStatus: 'active',
    status: 'occupied',
    reservations: true,
  },
  {
    number: 'T004',
    sectionId: 'main-dining',
    area: 'Main Dining',
    capacity: 2,
    shape: 'square',
    configStatus: 'active',
    status: 'available',
    reservations: false,
  },
  {
    number: 'T005',
    sectionId: 'bar-area',
    area: 'Bar Area',
    capacity: 2,
    shape: 'square',
    configStatus: 'active',
    status: 'available',
    reservations: true,
  },
  {
    number: 'T006',
    sectionId: 'bar-area',
    area: 'Bar Area',
    capacity: 4,
    shape: 'square',
    configStatus: 'inactive',
    status: 'available',
    reservations: false,
  },
  {
    number: 'T007',
    sectionId: 'outdoor-patio',
    area: 'Outdoor Patio',
    capacity: 4,
    shape: 'round',
    configStatus: 'inactive',
    status: 'available',
    reservations: false,
  },
  {
    number: 'T008',
    sectionId: 'outdoor-patio',
    area: 'Outdoor Patio',
    capacity: 6,
    shape: 'rectangle',
    configStatus: 'inactive',
    status: 'available',
    reservations: false,
  },
  {
    number: 'T009',
    sectionId: 'vip-lounge',
    area: 'VIP Lounge',
    capacity: 8,
    shape: 'round',
    configStatus: 'active',
    status: 'reserved',
    reservations: true,
  },
  {
    number: 'T010',
    sectionId: 'private-dining',
    area: 'Private Dining',
    capacity: 10,
    shape: 'rectangle',
    configStatus: 'inactive',
    status: 'available',
    reservations: true,
  },
  {
    number: 'T011',
    sectionId: 'rooftop-terrace',
    area: 'Rooftop Terrace',
    capacity: 4,
    shape: 'round',
    configStatus: 'active',
    status: 'available',
    reservations: true,
  },
  {
    number: 'T012',
    sectionId: 'rooftop-terrace',
    area: 'Rooftop Terrace',
    capacity: 4,
    shape: 'square',
    configStatus: 'active',
    status: 'occupied',
    reservations: true,
  },
];

export const floorTableFixtures: Readonly<Record<string, readonly FloorTableItem[]>> = {
  ground: groundSeeds.map((seed) => toTable('ground', seed)),
};
