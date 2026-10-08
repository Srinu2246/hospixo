import { routes } from '@/config/routes';

export const closeBusinessDayPageMeta = {
  title: 'Close Business Day',
  subtitle: 'Perform end-of-day operations to finalize sales and reconcile accounts',
  cancelLabel: 'Cancel',
  initiateLabel: 'Initiate Day Close',
  cancelHref: routes.platform.pos.cashShift,
  initiateHref: routes.platform.pos.cashReconciliation,
};

export const closeBusinessDayCurrentDay = {
  businessDate: 'May 17, 2026',
  totalShifts: '2 Active',
  totalHours: '16h 45m',
};

export interface CloseBusinessDayChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export const closeBusinessDayChecklist: CloseBusinessDayChecklistItem[] = [
  { id: 'shifts', label: 'All shifts closed and balanced', done: true },
  { id: 'tables', label: 'All table orders settled', done: true },
  { id: 'aggregators', label: 'Online aggregators synced', done: true },
  { id: 'transfers', label: 'Pending stock transfers approved', done: true },
  { id: 'cash', label: 'Cash reconciliation completed', done: false },
];

export const closeBusinessDayCardTitles = {
  currentDay: 'Current Day Info',
  checklist: 'Pre-Close Checklist',
};

export const closeBusinessDayStatLabels = {
  businessDate: 'Business Date',
  totalShifts: 'Total Shifts',
  totalHours: 'Total Hours',
} as const;
