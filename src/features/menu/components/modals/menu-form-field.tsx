'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { menuFormFieldLabelSx } from './menu-form-dialog-styles';

type MenuFormFieldProps = Readonly<{
  id: string;
  label: string;
  children: React.ReactNode;
}>;

export function MenuFormField({ id, label, children }: MenuFormFieldProps) {
  return (
    <Box>
      <Typography component="label" htmlFor={id} sx={menuFormFieldLabelSx}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}
