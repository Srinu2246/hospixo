export type TableStatus =
  'available' | 'occupied' | 'kotSent' | 'preparing' | 'billing' | 'ready' | 'cleaning';

export interface PosTable {
  id: string;
  label: string;
  floorId: string;
  status: TableStatus;
  amount?: number;
  guests?: number;
  waiter?: string;
  elapsedMinutes?: number;
  placeholder?: string;
}

export interface PosFloor {
  id: string;
  label: string;
}

export const posFloors: PosFloor[] = [
  { id: 'ground', label: 'Ground Floor' },
  { id: 'first', label: 'First Floor' },
  { id: 'terrace', label: 'Terrace' },
];

export const posTableFilters = [
  { id: 'all', label: 'All' },
  { id: 'available', label: 'Available' },
  { id: 'occupied', label: 'Occupied' },
  { id: 'billing', label: 'Billing' },
] as const;

export type PosTableFilterId = (typeof posTableFilters)[number]['id'];

export const posTableStatusLegend: { status: TableStatus; label: string }[] = [
  { status: 'available', label: 'Available' },
  { status: 'occupied', label: 'Occupied' },
  { status: 'kotSent', label: 'KOT Sent' },
  { status: 'preparing', label: 'Preparing' },
  { status: 'billing', label: 'Billing' },
  { status: 'ready', label: 'Ready' },
];

export const posTables: PosTable[] = [
  {
    id: 't1',
    label: 'T1',
    floorId: 'ground',
    status: 'occupied',
    amount: 1250,
    guests: 4,
    waiter: 'Ravi',
    elapsedMinutes: 32,
  },
  {
    id: 't2',
    label: 'T2',
    floorId: 'ground',
    status: 'available',
    placeholder: 'Tap to open',
  },
  {
    id: 't3',
    label: 'T3',
    floorId: 'ground',
    status: 'kotSent',
    amount: 890,
    guests: 2,
    waiter: 'Priya',
    elapsedMinutes: 18,
  },
  {
    id: 't4',
    label: 'T4',
    floorId: 'ground',
    status: 'occupied',
    amount: 882,
    guests: 3,
    waiter: 'Ravi',
    elapsedMinutes: 21,
  },
  {
    id: 't5',
    label: 'T5',
    floorId: 'ground',
    status: 'preparing',
    amount: 1560,
    guests: 5,
    waiter: 'Alex',
    elapsedMinutes: 45,
  },
  {
    id: 't6',
    label: 'T6',
    floorId: 'ground',
    status: 'billing',
    amount: 2100,
    guests: 6,
    waiter: 'Ravi',
    elapsedMinutes: 58,
  },
  {
    id: 't7',
    label: 'T7',
    floorId: 'ground',
    status: 'ready',
    amount: 740,
    guests: 2,
    waiter: 'Priya',
    elapsedMinutes: 12,
  },
  {
    id: 't8',
    label: 'T8',
    floorId: 'ground',
    status: 'cleaning',
    placeholder: 'Being cleaned',
  },
  {
    id: 't9',
    label: 'T9',
    floorId: 'first',
    status: 'available',
    placeholder: 'Tap to open',
  },
  {
    id: 't10',
    label: 'T10',
    floorId: 'first',
    status: 'occupied',
    amount: 980,
    guests: 3,
    waiter: 'Alex',
    elapsedMinutes: 27,
  },
  {
    id: 't11',
    label: 'T11',
    floorId: 'terrace',
    status: 'available',
    placeholder: 'Tap to open',
  },
  {
    id: 't12',
    label: 'T12',
    floorId: 'terrace',
    status: 'occupied',
    amount: 1340,
    guests: 4,
    waiter: 'Ravi',
    elapsedMinutes: 35,
  },
];

export function normalizeTableId(id: string): string {
  const numeric = id.replace(/^t/i, '');
  return `t${numeric.padStart(2, '0')}`;
}

export function formatRupee(amount: number) {
  return `Rs.${amount.toLocaleString('en-IN')}`;
}

export function getTableStatusLabel(status: TableStatus) {
  const found = posTableStatusLegend.find((item) => item.status === status);
  return found?.label ?? status;
}
