import type { SessionStatus } from '@/lib/schemas/menu/sessions/sessionSchema';

export type SessionStatusFilter = 'all' | SessionStatus;

export const SESSION_STATUS_FILTER_OPTIONS: ReadonlyArray<{
  id: SessionStatusFilter;
  label: string;
}> = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
];
