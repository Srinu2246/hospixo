'use client';

import { useId } from 'react';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { FloorSetupFilterFieldLabel } from '@/features/floor-table-setup/components/shared/floor-setup-filter-field-label';
import styles from '@/features/floor-table-setup/components/shared/floor-setup-filter-fields.module.css';
import { floorSetupFilterFieldSx } from '@/features/floor-table-setup/components/shared/mui-field-styles';
import { cn } from '@/lib/utils';

type FloorSetupFilterSelectFieldProps = Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly Readonly<{ value: string; label: string }>[];
  className?: string;
  required?: boolean;
}>;

export function FloorSetupFilterSelectField({
  label,
  value,
  onChange,
  options,
  className,
  required = true,
}: FloorSetupFilterSelectFieldProps) {
  const selectId = useId();

  return (
    <div className={cn(styles.fieldStack, className)}>
      <FloorSetupFilterFieldLabel htmlFor={selectId} required={required}>
        {label}
      </FloorSetupFilterFieldLabel>
      <TextField
        id={selectId}
        select
        fullWidth
        size="small"
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        sx={floorSetupFilterFieldSx}
        slotProps={{
          select: {
            MenuProps: {
              slotProps: {
                paper: { sx: { maxHeight: 320 } },
              },
            },
            inputProps: { 'aria-labelledby': `${selectId}-label` },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </div>
  );
}
