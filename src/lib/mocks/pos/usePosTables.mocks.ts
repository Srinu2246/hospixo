export type PosTableStatus = 'available' | 'occupied' | 'reserved' | 'billing' | 'cleaning';

export interface PosTableItem {
  id: string;
  name: string;
  floorId: string;
  sectionId: string;
  status: PosTableStatus;
  /** Seat count from the table catalog. */
  capacity?: number;
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

export interface PosStatusFilter {
  id: string;
  label: string;
}

/** Fallback floor tabs when the floors API has not loaded yet. */
export const POS_FLOOR_TABS: PosFloorTab[] = [
  { id: '59', label: 'Ground Floor' },
  { id: '66', label: 'First Floor' },
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
