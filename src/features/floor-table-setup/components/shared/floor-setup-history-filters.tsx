'use client';

import { FloorSetupFilterDateField } from '@/features/floor-table-setup/components/shared/floor-setup-filter-date-field';
import { FloorSetupFilterSelectField } from '@/features/floor-table-setup/components/shared/floor-setup-filter-select-field';
import { FloorSetupSearchField } from '@/features/floor-table-setup/components/shared/floor-setup-search-field';

type FloorSetupHistoryFiltersProps = Readonly<{
  query: string;
  onQueryChange: (value: string) => void;
  searchPlaceholder: string;
  date: string;
  onDateChange: (value: string) => void;
  dateLabel: string;
  action: string;
  onActionChange: (value: string) => void;
  actionLabel: string;
  actionOptions: readonly Readonly<{ value: string; label: string }>[];
  rowClassName?: string;
  searchClassName?: string;
  fieldClassName?: string;
}>;

export function FloorSetupHistoryFilters({
  query,
  onQueryChange,
  searchPlaceholder,
  date,
  onDateChange,
  dateLabel,
  action,
  onActionChange,
  actionLabel,
  actionOptions,
  rowClassName,
  searchClassName,
  fieldClassName,
}: FloorSetupHistoryFiltersProps) {
  return (
    <div className={rowClassName}>
      <FloorSetupSearchField
        className={searchClassName}
        value={query}
        placeholder={searchPlaceholder}
        onChange={onQueryChange}
      />
      <FloorSetupFilterDateField
        className={fieldClassName}
        label={dateLabel}
        value={date}
        required
        onChange={onDateChange}
      />
      <FloorSetupFilterSelectField
        className={fieldClassName}
        label={actionLabel}
        value={action}
        required
        options={actionOptions}
        onChange={onActionChange}
      />
    </div>
  );
}
