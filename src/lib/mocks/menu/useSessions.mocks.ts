import type { SessionRecord, SessionStatus } from '@/lib/schemas/menu/sessions/sessionSchema';

export type SessionStatusFilter = 'all' | SessionStatus;

export const SESSION_STATUS_FILTER_OPTIONS: ReadonlyArray<{
  id: SessionStatusFilter;
  label: string;
}> = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
];

export const MOCK_SESSIONS: SessionRecord[] = [
  {
    id: 'session-1',
    name: 'Breakfast',
    startTime: '06:00 AM',
    endTime: '10:30 AM',
    status: 'active',
    updatedAt: 'Updated 2 hrs ago',
  },
  {
    id: 'session-2',
    name: 'Lunch',
    startTime: '12:00 PM',
    endTime: '03:00 PM',
    status: 'active',
    updatedAt: 'Updated 1 hr ago',
  },
  {
    id: 'session-3',
    name: 'Snacks',
    startTime: '03:30 PM',
    endTime: '06:00 PM',
    status: 'inactive',
    updatedAt: 'Updated 5 hrs ago',
  },
  {
    id: 'session-4',
    name: 'Dinner',
    startTime: '07:00 PM',
    endTime: '11:00 PM',
    status: 'active',
    updatedAt: 'Updated 30 min ago',
  },
];
