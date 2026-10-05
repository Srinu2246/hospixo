'use client';

import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { useState } from 'react';
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

import { authTextFieldSx } from '@/features/auth/styles/authFieldStyles';

type PasswordFieldProps = Readonly<{
  id: string;
  placeholder?: string;
  autoComplete?: string;
  error?: FieldError;
  registration: UseFormRegisterReturn;
}>;

export function PasswordField({
  id,
  placeholder,
  autoComplete = 'current-password',
  error,
  registration,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      id={id}
      fullWidth
      type={visible ? 'text' : 'password'}
      placeholder={placeholder}
      autoComplete={autoComplete}
      error={Boolean(error)}
      slotProps={{
        input: {
          'aria-invalid': Boolean(error),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                type="button"
                edge="end"
                aria-label={visible ? 'Hide password' : 'Show password'}
                aria-pressed={visible}
                onClick={() => setVisible((show) => !show)}
                sx={{ color: 'text.secondary' }}
              >
                {visible ? (
                  <VisibilityOffOutlinedIcon fontSize="small" />
                ) : (
                  <VisibilityOutlinedIcon fontSize="small" />
                )}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      sx={authTextFieldSx}
      {...registration}
    />
  );
}
