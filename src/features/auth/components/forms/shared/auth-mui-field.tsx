'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { authFieldLabelSx } from '@/features/auth/lib/auth-mui-form-styles';

type AuthMuiFieldProps = Readonly<{
  id: string;
  label: string;
  children: React.ReactNode;
}>;

export function AuthMuiField({ id, label, children }: AuthMuiFieldProps) {
  return (
    <Box>
      <Typography component="label" htmlFor={id} sx={authFieldLabelSx}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}
