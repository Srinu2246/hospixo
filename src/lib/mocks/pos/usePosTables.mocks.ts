export type PosTableStatus = 'available' | 'occupied' | 'reserved' | 'billing' | 'cleaning';

export interface PosTableItem {
  id: string;
  name: string;
  floorId: string;
  sectionId: string;
  status: PosTableStatus;
  amount?: string;
  guests?: number;
  waiter?: string;
  time?: string;
  message?: string;
}

export interface PosFloorTab {
  id: string;
  label: string;
}

export interface PosSectionOption {
  id: string;
  label: string;
}

export interface PosStatusFilter {
  id: string;
  label: string;
}

export const POS_FLOOR_TABS: PosFloorTab[] = [
  { id: 'ground-floor', label: 'Ground Floor' },
  { id: 'first-floor', label: 'First Floor' },
  { id: 'terrace', label: 'Terrace' },
];

export const POS_SECTIONS: PosSectionOption[] = [
  { id: 'section-a', label: 'Section A' },
  { id: 'section-b', label: 'Section B' },
  { id: 'section-c', label: 'Section C' },
];

export const POS_STATUS_FILTERS: PosStatusFilter[] = [
  { id: 'all', label: 'All' },
  { id: 'available', label: 'Available' },
  { id: 'occupied', label: 'Occupied' },
  { id: 'billing', label: 'Billing' },
];

export const POS_TABLES_DATA: PosTableItem[] = [
  {
    id: 't-1',
    name: 'T1',
    floorId: 'ground-floor',
    sectionId: 'section-a',
    status: 'available',
    message: 'Tap to open',
  },
  {
    id: 't-2',
    name: 'T2',
    floorId: 'ground-floor',
    sectionId: 'section-a',
    status: 'occupied',
    amount: 'Rs.1,250',
    guests: 4,
    waiter: 'Ravi',
    time: '32m',
  },
  {
    id: 't-3',
    name: 'T3',
    floorId: 'ground-floor',
    sectionId: 'section-a',
    status: 'available',
    amount: 'Rs.880',
    guests: 2,
    waiter: 'Anil',
    time: '14m',
  },
  {
    id: 't-4',
    name: 'T4',
    floorId: 'ground-floor',
    sectionId: 'section-a',
    status: 'occupied',
    amount: 'Rs.882',
    guests: 3,
    waiter: 'Ravi',
    time: '21m',
  },
  {
    id: 't-5',
    name: 'T5',
    floorId: 'ground-floor',
    sectionId: 'section-a',
    status: 'reserved',
    amount: 'Rs.0',
    guests: 2,
    waiter: 'Sunita',
    time: '7:00 PM',
  },
  {
    id: 't-6',
    name: 'T6',
    floorId: 'ground-floor',
    sectionId: 'section-a',
    status: 'available',
    amount: 'Rs.450',
    guests: 1,
    waiter: 'Anil',
    time: '5m',
  },
  {
    id: 't-7',
    name: 'T7',
    floorId: 'ground-floor',
    sectionId: 'section-a',
    status: 'cleaning',
    message: 'Being cleaned',
  },
  {
    id: 't-8',
    name: 'T8',
    floorId: 'ground-floor',
    sectionId: 'section-a',
    status: 'reserved',
    amount: 'Rs.1,840',
    guests: 5,
    waiter: 'Sunita',
    time: '58m',
  },
  {
    id: 't-9',
    name: 'T9',
    floorId: 'ground-floor',
    sectionId: 'section-a',
    status: 'available',
    message: 'Tap to open',
  },
  {
    id: 't-10',
    name: 'T10',
    floorId: 'ground-floor',
    sectionId: 'section-a',
    status: 'occupied',
    amount: 'Rs.640',
    guests: 2,
    waiter: 'Anil',
    time: '9m',
  },
  {
    id: 't-11',
    name: 'T11',
    floorId: 'ground-floor',
    sectionId: 'section-a',
    status: 'available',
    amount: 'Rs.1,120',
    guests: 4,
    waiter: 'Ravi',
    time: '18m',
  },
  {
    id: 't-12',
    name: 'T12',
    floorId: 'ground-floor',
    sectionId: 'section-a',
    status: 'available',
    amount: 'Rs.920',
    guests: 2,
    waiter: 'Sunita',
    time: '46m',
  },
];
