import { DateRangeOption } from '@/features/dashboard/enums';
import { parseIsoDate } from '@/lib/helpers/reportsOverview';

export interface DashboardBusinessDateRange {
  startDate: string;
  endDate: string;
}

/** `YYYY-MM-DD` in local calendar (matches dashboard date pickers). */
export function toBusinessDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Maps header preset to inclusive API `start_date` / `end_date`. */
export function dateRangeFromOption(option: DateRangeOption): DashboardBusinessDateRange {
  const today = new Date();
  const todayValue = toBusinessDateInputValue(today);

  switch (option) {
    case DateRangeOption.YESTERDAY: {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const value = toBusinessDateInputValue(yesterday);
      return { startDate: value, endDate: value };
    }
    case DateRangeOption.THIS_WEEK: {
      const cursor = new Date(today);
      const weekday = cursor.getDay();
      const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
      cursor.setDate(cursor.getDate() + mondayOffset);
      return { startDate: toBusinessDateInputValue(cursor), endDate: todayValue };
    }
    case DateRangeOption.LAST_7_DAYS: {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      return { startDate: toBusinessDateInputValue(start), endDate: todayValue };
    }
    case DateRangeOption.THIS_MONTH: {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      return { startDate: toBusinessDateInputValue(monthStart), endDate: todayValue };
    }
    case DateRangeOption.LAST_MONTH: {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      return {
        startDate: toBusinessDateInputValue(monthStart),
        endDate: toBusinessDateInputValue(monthEnd),
      };
    }
    case DateRangeOption.CUSTOM_RANGE:
    case DateRangeOption.TODAY:
    default:
      return { startDate: todayValue, endDate: todayValue };
  }
}

function formatShortBusinessDate(iso: string, includeYear: boolean): string {
  const [year, month, day] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    ...(includeYear ? { year: 'numeric' } : {}),
  }).format(new Date(year, month - 1, day));
}

/** Date picker trigger label (e.g. `28 Jun - 4 Jul 2025`). */
export function dateRangeDatesFromOption(option: DateRangeOption): {
  dateFrom: Date;
  dateTo: Date;
} {
  const { startDate, endDate } = dateRangeFromOption(option);
  return {
    dateFrom: parseIsoDate(startDate),
    dateTo: parseIsoDate(endDate),
  };
}

export function formatDashboardDateRangeTriggerLabel(option: DateRangeOption): string {
  const { startDate, endDate } = dateRangeFromOption(option);
  if (startDate === endDate) {
    return formatShortBusinessDate(startDate, true);
  }
  return `${formatShortBusinessDate(startDate, false)} - ${formatShortBusinessDate(endDate, true)}`;
}
