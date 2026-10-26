import { z } from 'zod';

export const reservationStatusSchema = z.enum(['confirmed', 'checked-in', 'cancelled']);
export type ReservationStatus = z.infer<typeof reservationStatusSchema>;

export const reservationItemSchema = z.object({
  id: z.string().min(1),
  time: z.string().min(1),
  guestName: z.string().min(1),
  guestCount: z.number().int().positive(),
  section: z.string().min(1),
  sectionId: z.string().min(1),
  status: reservationStatusSchema,
  date: z.string().min(1),
  phone: z.string().optional(),
  tableNumber: z.string().optional(),
  notes: z.string().optional(),
});

export type ReservationItem = z.infer<typeof reservationItemSchema>;

export const reservationListSchema = z.array(reservationItemSchema);

export const RESERVATION_STATUS_OPTIONS = [
  { id: 'all', label: 'All Statuses' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'checked-in', label: 'Checked In' },
  { id: 'cancelled', label: 'Cancelled' },
] as const;

export const RESERVATION_SECTION_OPTIONS = [
  { id: 'all', label: 'All Sections' },
  { id: 'indoor', label: 'Indoor' },
  { id: 'outdoor-patio', label: 'Outdoor Patio' },
  { id: 'private-room', label: 'Private Room' },
  { id: 'bar', label: 'Bar' },
] as const;

export const reservationDetailItemSchema = z.object({
  id: z.string().min(1),
  status: reservationStatusSchema,
  guestName: z.string().min(1),
  phone: z.string().min(1),
  visitHistory: z.string().min(1),
  description: z.string().optional(),
  smsStatus: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  partySize: z.number().int().positive(),
  table: z.string().min(1),
  seatingPreference: z.string().min(1),
  specialRequests: z.array(z.string()),
});

export type ReservationDetailItem = z.infer<typeof reservationDetailItemSchema>;
