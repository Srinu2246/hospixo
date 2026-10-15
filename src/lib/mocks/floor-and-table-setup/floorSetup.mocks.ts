import type { FloorActivity } from '@/features/management/floor-and-table-setup/types/floorSetup';

/** Placeholder history until a floor activity API exists. */
export const MOCK_FLOOR_ACTIVITY: FloorActivity[] = [
  { id: 'a1', message: 'Table T12 moved to Terrace', timeLabel: '2 hours ago' },
  { id: 'a2', message: 'Bar Area capacity updated to 24', timeLabel: '5 hours ago' },
  { id: 'a3', message: 'VIP Room set to Maintenance', timeLabel: '1 day ago' },
  { id: 'a4', message: 'New section Lounge added', timeLabel: '2 days ago' },
  { id: 'a5', message: 'Floor published by Admin', timeLabel: '3 days ago' },
];
