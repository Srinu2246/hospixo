'use client';

import { CalendarRangePicker } from '@/components/shared/form-fields/CalendarRangePicker';

export interface ReportsOverviewDateRangeProps {
  dateFrom: Date;
  dateTo: Date;
  onDateFromChange: (date: Date) => void;
  onDateToChange: (date: Date) => void;
}

export function ReportsOverviewDateRange({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: Readonly<ReportsOverviewDateRangeProps>) {
  return (
    <CalendarRangePicker
      dateFrom={dateFrom}
      dateTo={dateTo}
      size="small"
      minWidth={260}
      placeholder="Date range"
      onRangeChange={({ dateFrom: nextFrom, dateTo: nextTo }) => {
        onDateFromChange(nextFrom);
        onDateToChange(nextTo);
      }}
    />
  );
}
