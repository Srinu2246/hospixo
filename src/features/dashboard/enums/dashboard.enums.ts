/**
 * Dashboard filter and period enums.
 */

export enum DateRangeOption {
  TODAY = 'Today',
  YESTERDAY = 'Yesterday',
  THIS_WEEK = 'This Week (Mon - Sun)',
  LAST_7_DAYS = 'Last 7 Days (28 Jun - 4 Jul 2025)',
  THIS_MONTH = 'This Month',
  LAST_MONTH = 'Last Month',
  CUSTOM_RANGE = 'Custom Range...',
}

export enum PeriodOption {
  TODAY = 'Today',
  YESTERDAY = 'Yesterday',
  LAST_7_DAYS = 'Last 7 Days',
  THIS_MONTH = 'This Month',
}

/** Ordered options for dashboard header date menu. */
export const DASHBOARD_DATE_RANGE_OPTIONS: readonly DateRangeOption[] = [
  DateRangeOption.TODAY,
  DateRangeOption.YESTERDAY,
  DateRangeOption.THIS_WEEK,
  DateRangeOption.LAST_7_DAYS,
  DateRangeOption.THIS_MONTH,
  DateRangeOption.LAST_MONTH,
  DateRangeOption.CUSTOM_RANGE,
];

/** Compact label for the date picker trigger (omits parenthetical hints). */
export function dateRangeButtonLabel(option: DateRangeOption): string {
  return option.replace(/\s*\([^)]*\)/g, '').trim();
}
