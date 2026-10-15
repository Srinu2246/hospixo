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

/** Fallback floor tabs when the floors API has not loaded yet. */
export const POS_FLOOR_TABS: PosFloorTab[] = [
  { id: '59', label: 'Ground Floor' },
  { id: '66', label: 'First Floor' },
];

/** Fallback section options when the floors API has not loaded yet. */
export const POS_SECTIONS: PosSectionOption[] = [
  { id: '93', label: 'Main Dining' },
  { id: '92', label: 'Right side' },
];

export const POS_STATUS_FILTERS: PosStatusFilter[] = [
  { id: 'all', label: 'All' },
  { id: 'available', label: 'Available' },
  { id: 'occupied', label: 'Occupied' },
  { id: 'billing', label: 'Billing' },
];

/** Dine-in only lists tables that already have a reservation or an active order. */
export const DINE_IN_TABLE_STATUSES: PosTableStatus[] = ['reserved', 'occupied', 'billing'];

export const DINE_IN_STATUS_FILTERS: PosStatusFilter[] = [
  { id: 'all', label: 'All' },
  { id: 'occupied', label: 'Occupied' },
  { id: 'reserved', label: 'Reserved' },
  { id: 'billing', label: 'Billing' },
];

/** Table cards use floor/section ids from the floors API mock (branch 49). */
export const POS_TABLES_DATA: PosTableItem[] = [
  {
    id: 't-1',
    name: 'T1',
    floorId: '59',
    sectionId: '93',
    status: 'available',
    message: 'Tap to open',
  },
  {
    id: 't-2',
    name: 'T2',
    floorId: '59',
    sectionId: '93',
    status: 'occupied',
    amount: 'Rs.1,250',
    guests: 4,
    waiter: 'Ravi',
    time: '32m',
  },
  {
    id: 't-3',
    name: 'T3',
    floorId: '59',
    sectionId: '93',
    status: 'available',
    amount: 'Rs.880',
    guests: 2,
    waiter: 'Anil',
    time: '14m',
  },
  {
    id: 't-4',
    name: 'T4',
    floorId: '59',
    sectionId: '93',
    status: 'occupied',
    amount: 'Rs.882',
    guests: 3,
    waiter: 'Ravi',
    time: '21m',
  },
  {
    id: 't-5',
    name: 'T5',
    floorId: '59',
    sectionId: '93',
    status: 'reserved',
    amount: 'Rs.0',
    guests: 2,
    waiter: 'Sunita',
    time: '7:00 PM',
  },
  {
    id: 't-6',
    name: 'T6',
    floorId: '59',
    sectionId: '93',
    status: 'available',
    amount: 'Rs.450',
    guests: 1,
    waiter: 'Anil',
    time: '5m',
  },
  {
    id: 't-7',
    name: 'T7',
    floorId: '59',
    sectionId: '93',
    status: 'cleaning',
    message: 'Being cleaned',
  },
  {
    id: 't-8',
    name: 'T8',
    floorId: '59',
    sectionId: '93',
    status: 'reserved',
    amount: 'Rs.1,840',
    guests: 5,
    waiter: 'Sunita',
    time: '58m',
  },
  {
    id: 't-9',
    name: 'T9',
    floorId: '59',
    sectionId: '93',
    status: 'available',
    message: 'Tap to open',
  },
  {
    id: 't-10',
    name: 'T10',
    floorId: '59',
    sectionId: '93',
    status: 'occupied',
    amount: 'Rs.640',
    guests: 2,
    waiter: 'Anil',
    time: '9m',
  },
  {
    id: 't-11',
    name: 'T11',
    floorId: '66',
    sectionId: '92',
    status: 'available',
    amount: 'Rs.1,120',
    guests: 4,
    waiter: 'Ravi',
    time: '18m',
  },
  {
    id: 't-12',
    name: 'T12',
    floorId: '66',
    sectionId: '92',
    status: 'available',
    amount: 'Rs.920',
    guests: 2,
    waiter: 'Sunita',
    time: '46m',
  },
];
