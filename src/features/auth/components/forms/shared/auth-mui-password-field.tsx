'use client';

import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import { AuthMuiField } from '@/features/auth/components/forms/shared/auth-mui-field';
import { authTextFieldSx } from '@/features/auth/lib/auth-mui-form-styles';

type AuthMuiPasswordFieldProps = Readonly<{
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: 'new-password' | 'current-password';
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}>;

export function AuthMuiPasswordField({
  id,
  label,
  placeholder,
  value,
  onChange,
  autoComplete = 'new-password',
  required = false,
  disabled = false,
  error = false,
  helperText,
}: AuthMuiPasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <AuthMuiField id={id} label={label}>
      <TextField
        id={id}
        hiddenLabel
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        error={error}
        helperText={helperText}
        fullWidth
        size="small"
        sx={authTextFieldSx}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={visible ? 'Hide password' : 'Show password'}
                  onClick={() => setVisible((show) => !show)}
                  onMouseDown={(e) => e.preventDefault()}
                  edge="end"
                  size="small"
                  disabled={disabled}
                  sx={{ color: 'text.secondary' }}
                >
                  {visible ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
    </AuthMuiField>
  );
}
