'use client';

import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import {
  floorSetupFilterFieldSx,
  floorSetupToolbarSelectSx,
} from '@/features/floor-table-setup/components/shared/mui-field-styles';
import type { SxProps, Theme } from '@mui/material/styles';

type FloorSetupToolbarSelectProps = Readonly<{
  value: string;
  onChange: (value: string) => void;
  options: readonly Readonly<{ value: string; label: string }>[];
  'aria-label': string;
  label?: string;
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
}>;

export function FloorSetupToolbarSelect({
  value,
  onChange,
  options,
  'aria-label': ariaLabel,
  label,
  fullWidth = false,
  sx,
}: FloorSetupToolbarSelectProps) {
  return (
    <TextField
      select
      fullWidth={fullWidth}
      size="small"
      value={value}
      label={label}
      aria-label={ariaLabel}
      onChange={(event) => onChange(event.target.value)}
      sx={[fullWidth ? floorSetupFilterFieldSx : floorSetupToolbarSelectSx, ...(sx ? [sx] : [])]}
      slotProps={{
        inputLabel: label ? { shrink: true } : undefined,
      }}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.875rem' }}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
