'use client';

import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
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
