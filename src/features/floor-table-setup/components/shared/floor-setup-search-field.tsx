'use client';

import { Search } from 'lucide-react';

import wizardStyles from '@/features/floor-table-setup/components/wizard/wizard.module.css';
import { cn } from '@/lib/utils';

type FloorSetupSearchFieldProps = Readonly<{
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  'aria-label'?: string;
}>;

export function FloorSetupSearchField({
  value,
  onChange,
  placeholder,
  className,
  'aria-label': ariaLabel,
}: FloorSetupSearchFieldProps) {
  return (
    <label className={cn(wizardStyles.search, className)}>
      <Search className={wizardStyles.icon} aria-hidden="true" />
      <input
        className={wizardStyles.searchInput}
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
