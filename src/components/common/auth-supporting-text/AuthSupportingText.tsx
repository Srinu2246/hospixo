'use client';

import { Typography } from '@mui/material';

type AuthSupportingTextProps = Readonly<{
  children: string;
}>;

export default function AuthSupportingText({ children }: AuthSupportingTextProps) {
  return (
    <Typography variant="body2" color="text.secondary" sx={{ m: 0 }}>
      {children}
    </Typography>
  );
}
