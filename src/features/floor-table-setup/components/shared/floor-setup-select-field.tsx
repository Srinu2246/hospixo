'use client';

import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import {
  floorSetupFieldSx,
  floorSetupToolbarSelectSx,
} from '@/features/floor-table-setup/components/shared/mui-field-styles';
import type { SxProps, Theme } from '@mui/material/styles';

type FloorSetupSelectFieldProps = Readonly<{
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: readonly Readonly<{ value: string | number; label: string }>[];
  required?: boolean;
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>;
}>;

export function FloorSetupSelectField({
  label,
  value,
  onChange,
  options,
  required = false,
  size = 'medium',
  sx,
}: FloorSetupSelectFieldProps) {
  const isCompact = size === 'small';
  return (
    <TextField
      select
      fullWidth={!isCompact}
      size={size}
      required={required}
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      sx={[isCompact ? floorSetupToolbarSelectSx : floorSetupFieldSx, ...(sx ? [sx] : [])]}
      slotProps={{
        inputLabel: { shrink: true },
        select: isCompact
          ? undefined
          : {
              MenuProps: {
                PaperProps: { sx: { maxHeight: 320 } },
              },
            },
      }}
    >
      {options.map((option) => (
        <MenuItem key={String(option.value)} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
