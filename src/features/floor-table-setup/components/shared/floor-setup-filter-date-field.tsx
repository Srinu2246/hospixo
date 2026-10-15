'use client';

import { useId } from 'react';
import TextField from '@mui/material/TextField';

import { FloorSetupFilterFieldLabel } from '@/features/floor-table-setup/components/shared/floor-setup-filter-field-label';
import styles from '@/features/floor-table-setup/components/shared/floor-setup-filter-fields.module.css';
import { floorSetupFilterFieldSx } from '@/features/floor-table-setup/components/shared/mui-field-styles';
import { cn } from '@/lib/utils';

type FloorSetupFilterDateFieldProps = Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
}>;

export function FloorSetupFilterDateField({
  label,
  value,
  onChange,
  className,
  required = true,
}: FloorSetupFilterDateFieldProps) {
  const inputId = useId();

  return (
    <div className={cn(styles.fieldStack, className)}>
      <FloorSetupFilterFieldLabel htmlFor={inputId} required={required}>
        {label}
      </FloorSetupFilterFieldLabel>
      <TextField
        id={inputId}
        type="date"
        fullWidth
        size="small"
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        sx={floorSetupFilterFieldSx}
        slotProps={{
          htmlInput: { 'aria-labelledby': `${inputId}-label` },
        }}
      />
    </div>
  );
}
