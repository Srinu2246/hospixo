import { z } from 'zod';

/** Floor-plan card status used by dine-in / tables UI. */
export const posTableStatusSchema = z.enum([
  'available',
  'occupied',
  'reserved',
  'billing',
  'cleaning',
]);

export type PosTableStatus = z.infer<typeof posTableStatusSchema>;

/** View model for a POS floor-plan table card. */
export const posTableItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  floorId: z.string().min(1),
  sectionId: z.string().min(1),
  status: posTableStatusSchema,
  capacity: z.number().int().positive().optional(),
  orderId: z.string().optional(),
  orderNumber: z.string().optional(),
  amount: z.string().optional(),
  guests: z.number().int().nonnegative().optional(),
  waiter: z.string().optional(),
  time: z.string().optional(),
  message: z.string().optional(),
});

export type PosTableItem = z.infer<typeof posTableItemSchema>;

export interface PosStatusFilter {
  id: string;
  label: string;
}

export const POS_STATUS_FILTERS: PosStatusFilter[] = [
  { id: 'all', label: 'All' },
  { id: 'available', label: 'Available' },
  { id: 'occupied', label: 'Occupied' },
  { id: 'billing', label: 'Billing' },
];

/** Dine-in only lists tables that already have a reservation or an active order. */
export const DINE_IN_TABLE_STATUSES: readonly PosTableStatus[] = [
  'reserved',
  'occupied',
  'billing',
];

export const DINE_IN_STATUS_FILTERS: PosStatusFilter[] = [
  { id: 'all', label: 'All' },
  { id: 'occupied', label: 'Occupied' },
  // RESERVATION FEATURE (HIDDEN): Uncomment below to restore the "Reserved" status filter in Dine-In
  // { id: 'reserved', label: 'Reserved' },
  { id: 'billing', label: 'Billing' },
];
