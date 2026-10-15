export type ReservationStatus = 'confirmed' | 'checked-in' | 'cancelled';

export interface ReservationItem {
  id: string;
  time: string;
  guestName: string;
  guestCount: number;
  section: string;
  sectionId: string;
  status: ReservationStatus;
  date: string; // YYYY-MM-DD format
  phone?: string;
  tableNumber?: string;
  notes?: string;
}

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

export const MOCK_RESERVATIONS: ReservationItem[] = [
  {
    id: 'res-1',
    time: '11:30 AM',
    guestName: 'Maria Garcia',
    guestCount: 2,
    section: 'Indoor',
    sectionId: 'indoor',
    status: 'confirmed',
    date: '2024-10-12',
    phone: '+1 (555) 234-5678',
    tableNumber: 'T-02',
  },
  {
    id: 'res-2',
    time: '12:00 PM',
    guestName: 'Jonathan Doe',
    guestCount: 4,
    section: 'Outdoor Patio',
    sectionId: 'outdoor-patio',
    status: 'confirmed',
    date: '2024-10-12',
    phone: '+1 (555) 345-6789',
    tableNumber: 'P-04',
  },
  {
    id: 'res-3',
    time: '12:30 PM',
    guestName: 'James Wilson',
    guestCount: 6,
    section: 'Private Room',
    sectionId: 'private-room',
    status: 'confirmed',
    date: '2024-10-12',
    phone: '+1 (555) 456-7890',
    tableNumber: 'PR-01',
  },
  {
    id: 'res-4',
    time: '1:00 PM',
    guestName: 'Sarah Chen',
    guestCount: 2,
    section: 'Bar',
    sectionId: 'bar',
    status: 'checked-in',
    date: '2024-10-12',
    phone: '+1 (555) 567-8901',
    tableNumber: 'B-03',
  },
  {
    id: 'res-5',
    time: '1:00 PM',
    guestName: 'Robert Kim',
    guestCount: 4,
    section: 'Outdoor Patio',
    sectionId: 'outdoor-patio',
    status: 'checked-in',
    date: '2024-10-12',
    phone: '+1 (555) 678-9012',
    tableNumber: 'P-02',
  },
  {
    id: 'res-6',
    time: '5:30 PM',
    guestName: 'Emily Davis',
    guestCount: 8,
    section: 'Indoor',
    sectionId: 'indoor',
    status: 'checked-in',
    date: '2024-10-12',
    phone: '+1 (555) 789-0123',
    tableNumber: 'T-08',
  },
  {
    id: 'res-7',
    time: '6:00 PM',
    guestName: 'Michael Brown',
    guestCount: 3,
    section: 'Outdoor Patio',
    sectionId: 'outdoor-patio',
    status: 'confirmed',
    date: '2024-10-12',
    phone: '+1 (555) 890-1234',
    tableNumber: 'P-01',
  },
  {
    id: 'res-8',
    time: '7:00 PM',
    guestName: 'Lisa Anderson',
    guestCount: 2,
    section: 'Indoor',
    sectionId: 'indoor',
    status: 'confirmed',
    date: '2024-10-12',
    phone: '+1 (555) 901-2345',
    tableNumber: 'T-04',
  },
  {
    id: 'res-9',
    time: '7:30 PM',
    guestName: 'David Martinez',
    guestCount: 4,
    section: 'Private Room',
    sectionId: 'private-room',
    status: 'confirmed',
    date: '2024-10-12',
    phone: '+1 (555) 012-3456',
    tableNumber: 'PR-02',
  },
  {
    id: 'res-10',
    time: '8:00 PM',
    guestName: 'Jessica Taylor',
    guestCount: 5,
    section: 'Outdoor Patio',
    sectionId: 'outdoor-patio',
    status: 'checked-in',
    date: '2024-10-12',
    phone: '+1 (555) 123-4567',
    tableNumber: 'P-05',
  },
  {
    id: 'res-11',
    time: '8:30 PM',
    guestName: 'Daniel Thomas',
    guestCount: 2,
    section: 'Bar',
    sectionId: 'bar',
    status: 'confirmed',
    date: '2024-10-12',
    phone: '+1 (555) 234-5679',
    tableNumber: 'B-01',
  },
  {
    id: 'res-12',
    time: '9:00 PM',
    guestName: 'Ashley Jackson',
    guestCount: 6,
    section: 'Indoor',
    sectionId: 'indoor',
    status: 'confirmed',
    date: '2024-10-12',
    phone: '+1 (555) 345-6780',
    tableNumber: 'T-06',
  },
  {
    id: 'res-13',
    time: '11:00 AM',
    guestName: 'Brian White',
    guestCount: 2,
    section: 'Indoor',
    sectionId: 'indoor',
    status: 'confirmed',
    date: '2024-10-12',
    phone: '+1 (555) 456-7891',
    tableNumber: 'T-01',
  },
  {
    id: 'res-14',
    time: '11:45 AM',
    guestName: 'Amanda Harris',
    guestCount: 4,
    section: 'Outdoor Patio',
    sectionId: 'outdoor-patio',
    status: 'confirmed',
    date: '2024-10-12',
    phone: '+1 (555) 567-8902',
    tableNumber: 'P-03',
  },
  {
    id: 'res-15',
    time: '12:15 PM',
    guestName: 'Kevin Martin',
    guestCount: 3,
    section: 'Indoor',
    sectionId: 'indoor',
    status: 'checked-in',
    date: '2024-10-12',
    phone: '+1 (555) 678-9013',
    tableNumber: 'T-03',
  },
  {
    id: 'res-16',
    time: '1:30 PM',
    guestName: 'Rachel Clark',
    guestCount: 2,
    section: 'Bar',
    sectionId: 'bar',
    status: 'confirmed',
    date: '2024-10-12',
    phone: '+1 (555) 789-0124',
    tableNumber: 'B-04',
  },
  {
    id: 'res-17',
    time: '2:00 PM',
    guestName: 'Steven Lewis',
    guestCount: 5,
    section: 'Private Room',
    sectionId: 'private-room',
    status: 'confirmed',
    date: '2024-10-12',
    phone: '+1 (555) 890-1235',
    tableNumber: 'PR-03',
  },
  {
    id: 'res-18',
    time: '5:00 PM',
    guestName: 'Hannah Lee',
    guestCount: 4,
    section: 'Indoor',
    sectionId: 'indoor',
    status: 'confirmed',
    date: '2024-10-12',
    phone: '+1 (555) 901-2346',
    tableNumber: 'T-05',
  },
  {
    id: 'res-19',
    time: '6:30 PM',
    guestName: 'George Walker',
    guestCount: 2,
    section: 'Outdoor Patio',
    sectionId: 'outdoor-patio',
    status: 'checked-in',
    date: '2024-10-12',
    phone: '+1 (555) 012-3457',
    tableNumber: 'P-06',
  },
  {
    id: 'res-20',
    time: '7:15 PM',
    guestName: 'Sophia Hall',
    guestCount: 6,
    section: 'Private Room',
    sectionId: 'private-room',
    status: 'confirmed',
    date: '2024-10-12',
    phone: '+1 (555) 123-4568',
    tableNumber: 'PR-04',
  },
  {
    id: 'res-21',
    time: '8:15 PM',
    guestName: 'Tyler Allen',
    guestCount: 3,
    section: 'Indoor',
    sectionId: 'indoor',
    status: 'confirmed',
    date: '2024-10-12',
    phone: '+1 (555) 234-5670',
    tableNumber: 'T-07',
  },
  {
    id: 'res-22',
    time: '8:45 PM',
    guestName: 'Victoria Young',
    guestCount: 2,
    section: 'Bar',
    sectionId: 'bar',
    status: 'checked-in',
    date: '2024-10-12',
    phone: '+1 (555) 345-6781',
    tableNumber: 'B-02',
  },
  {
    id: 'res-23',
    time: '9:15 PM',
    guestName: 'Nathan King',
    guestCount: 4,
    section: 'Outdoor Patio',
    sectionId: 'outdoor-patio',
    status: 'confirmed',
    date: '2024-10-12',
    phone: '+1 (555) 456-7892',
    tableNumber: 'P-07',
  },
  {
    id: 'res-24',
    time: '9:30 PM',
    guestName: 'Megan Wright',
    guestCount: 2,
    section: 'Indoor',
    sectionId: 'indoor',
    status: 'confirmed',
    date: '2024-10-12',
    phone: '+1 (555) 567-8903',
    tableNumber: 'T-09',
  },
];

export interface ReservationDetailItem {
  id: string; // Formatted code (e.g. #RES-2024-0847)
  status: ReservationStatus; // Status (confirmed | checked-in | cancelled)
  guestName: string; // Full name
  phone: string; // Contact phone
  visitHistory: string; // Frequency & last visit
  description?: string; // Additional notes
  smsStatus: string; // SMS delivery status
  date: string; // Full formatted date string
  time: string; // Time window
  partySize: number; // Number of guests
  table: string; // Table name & seating summary
  seatingPreference: string; // Section preference
  specialRequests: string[]; // List of special requests
}

export const MOCK_RESERVATION_DETAILS: Record<string, ReservationDetailItem> = {
  'RES-2024-0847': {
    id: '#RES-2024-0847',
    status: 'confirmed',
    guestName: 'Jonathan Doe',
    phone: '+1 (555) 019-2834',
    visitHistory: '14 visits · Last visit Sep 28 2024',
    description: '—',
    smsStatus: 'Delivered 10:45 AM',
    date: 'Friday, October 12, 2024',
    time: '12:00 PM to 2:00 PM',
    partySize: 4,
    table: 'Table 12 (Outdoor Patio, Seats 4)',
    seatingPreference: 'Outdoor Patio',
    specialRequests: ['High chair', 'Wheelchair accessible', 'Anniversary setup'],
  },
  'res-2': {
    id: '#RES-2024-0847',
    status: 'confirmed',
    guestName: 'Jonathan Doe',
    phone: '+1 (555) 019-2834',
    visitHistory: '14 visits · Last visit Sep 28 2024',
    description: '—',
    smsStatus: 'Delivered 10:45 AM',
    date: 'Friday, October 12, 2024',
    time: '12:00 PM to 2:00 PM',
    partySize: 4,
    table: 'Table 12 (Outdoor Patio, Seats 4)',
    seatingPreference: 'Outdoor Patio',
    specialRequests: ['High chair', 'Wheelchair accessible', 'Anniversary setup'],
  },
  'res-1': {
    id: '#RES-2024-0846',
    status: 'confirmed',
    guestName: 'Maria Garcia',
    phone: '+1 (555) 234-5678',
    visitHistory: '6 visits · Last visit Aug 14 2024',
    description: 'VIP regular customer',
    smsStatus: 'Delivered 10:15 AM',
    date: 'Friday, October 12, 2024',
    time: '11:30 AM to 1:30 PM',
    partySize: 2,
    table: 'Table 02 (Indoor, Seats 2)',
    seatingPreference: 'Indoor',
    specialRequests: ['Quiet corner table', 'Window view'],
  },
  'res-3': {
    id: '#RES-2024-0848',
    status: 'confirmed',
    guestName: 'James Wilson',
    phone: '+1 (555) 456-7890',
    visitHistory: '2 visits · Last visit Jul 10 2024',
    description: 'Corporate dinner reservation',
    smsStatus: 'Delivered 11:00 AM',
    date: 'Friday, October 12, 2024',
    time: '12:30 PM to 2:30 PM',
    partySize: 6,
    table: 'Table 01 (Private Room, Seats 6)',
    seatingPreference: 'Private Room',
    specialRequests: ['Business presentation setup', 'Projector access'],
  },
};

/**
 * Resolves a detailed mock reservation by ID, with case-insensitive matching and fallback
 */
export function getMockReservationDetail(id?: string): ReservationDetailItem {
  if (!id) return MOCK_RESERVATION_DETAILS['RES-2024-0847'];

  const cleanId = id.replace(/^#/, '');

  // Exact or case-insensitive dictionary match
  const directMatch =
    MOCK_RESERVATION_DETAILS[id] ||
    MOCK_RESERVATION_DETAILS[cleanId] ||
    MOCK_RESERVATION_DETAILS[cleanId.toUpperCase()] ||
    MOCK_RESERVATION_DETAILS[cleanId.toLowerCase()];

  if (directMatch) return directMatch;

  // Fallback match from MOCK_RESERVATIONS array
  const baseRes = MOCK_RESERVATIONS.find(
    (r) => r.id.toLowerCase() === id.toLowerCase() || r.id.toLowerCase() === cleanId.toLowerCase(),
  );

  if (baseRes) {
    return {
      id: `#RES-${baseRes.id.replace(/^res-/, '').padStart(4, '0')}`,
      status: baseRes.status,
      guestName: baseRes.guestName,
      phone: baseRes.phone || '+1 (555) 000-0000',
      visitHistory: '4 visits · Last visit Sep 12 2024',
      description: baseRes.notes || '—',
      smsStatus: 'Delivered 10:00 AM',
      date: 'Friday, October 12, 2024',
      time: `${baseRes.time} to 02:00 PM`,
      partySize: baseRes.guestCount,
      table: `${baseRes.tableNumber || 'Table 05'} (${baseRes.section}, Seats ${baseRes.guestCount})`,
      seatingPreference: baseRes.section,
      specialRequests: ['Standard dining setup'],
    };
  }

  // Default fallback matching design
  return MOCK_RESERVATION_DETAILS['RES-2024-0847'];
}
