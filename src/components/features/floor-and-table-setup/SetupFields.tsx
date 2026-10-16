'use client';

import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import { Dropdown, type DropdownProps } from '@/components/shared/form-fields/Dropdown';
import { screen } from '@/lib/theme/mui/breakpoints';

export function SetupCard({
  children,
  sx,
}: Readonly<{ children: ReactNode; sx?: SxProps<Theme> }>) {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: { [screen.mobile]: '12px', [screen.desktop]: '16px' },
        p: { [screen.mobile]: 2, [screen.desktop]: 3 },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

export function LabeledDropdown<T extends string | number>({
  label,
  ...props
}: Readonly<DropdownProps<T> & { label: string }>) {
  return (
    <Stack spacing={0.75} sx={{ width: '100%', minWidth: 0 }}>
      <Typography component="span" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
        {label}
      </Typography>
      <Box sx={{ width: '100%', '& > .MuiFormControl-root': { width: '100%', minWidth: 0 } }}>
        <Dropdown {...props} minWidth="100%" size={props.size ?? 'large'} sx={{ width: '100%' }} />
      </Box>
    </Stack>
  );
}

export function StatusRow({
  title,
  hint,
  checked,
  onChange,
}: Readonly<{
  title: string;
  hint: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}>) {
  return (
    <Stack
      direction={{ [screen.mobile]: 'column', [screen.tablet]: 'row' }}
      sx={{
        alignItems: { [screen.tablet]: 'center' },
        justifyContent: 'space-between',
        gap: 1.5,
      }}
    >
      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>{title}</Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.8125rem', mt: 0.25 }}>
          {hint}
        </Typography>
      </Box>
      <Switch checked={checked} onChange={(_event, next) => onChange(next)} color="primary" />
    </Stack>
  );
}
