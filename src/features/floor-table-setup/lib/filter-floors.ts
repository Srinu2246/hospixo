import type {
  Floor,
  FloorSortId,
  FloorStatusFilter,
} from '@/features/floor-table-setup/types/floor-table-setup';

type FilterFloorsInput = Readonly<{
  floors: readonly Floor[];
  query: string;
  status: FloorStatusFilter;
  sort: FloorSortId;
}>;

export function filterFloors({ floors, query, status, sort }: FilterFloorsInput): Floor[] {
  const normalized = query.trim().toLowerCase();

  const filtered = floors.filter((floor) => {
    if (status !== 'all' && floor.status !== status) return false;
    if (!normalized) return true;
    return (
      floor.name.toLowerCase().includes(normalized) ||
      floor.branch.toLowerCase().includes(normalized)
    );
  });

  return [...filtered].sort((left, right) => {
    if (sort === 'name') return left.name.localeCompare(right.name);
    if (sort === 'tables') return right.tableCount - left.tableCount;
    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });
}

export function createDraftFloor(name: string): Floor {
  const now = new Date().toISOString();
  const id = `floor-${crypto.randomUUID()}`;

  return {
    id,
    name: name.trim(),
    type: null,
    status: 'draft',
    tableCount: 0,
    seatCount: 0,
    updatedAt: now,
    branch: 'Hyderabad',
    createdOn: now.slice(0, 10),
    createdBy: 'Admin',
    description: '',
    sections: [],
    stats: {
      totalTables: 0,
      totalSeats: 0,
      activeTables: 0,
      maintenance: 0,
    },
    activity: [
      {
        id: `${id}-created`,
        message: 'Floor draft created',
        occurredAt: now,
      },
    ],
  };
}
