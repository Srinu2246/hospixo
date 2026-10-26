'use client';

import { forwardRef, type ChangeEvent, type FocusEvent, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';

export interface InputProps {
  label?: string; // Optional field label text
  required?: boolean; // Displays red asterisk when true
  value?: string; // Input controlled value
  defaultValue?: string; // Input initial uncontrolled value
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; // Change event handler
  onBlur?: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void; // Blur event handler
  placeholder?: string; // Placeholder copy
  type?: string; // Input type (e.g., text, email, number)
  autoComplete?: string;
  autoFocus?: boolean; // Auto-focus input on mount
  error?: boolean; // Visual error state
  helperText?: string; // Supplemental helper or error message
  /** Reserve one helper line (defaults to true when `required`). Prevents layout shift on error. */
  reserveHelperSpace?: boolean;
  disabled?: boolean; // Disabled interaction state
  fullWidth?: boolean; // Expands input to 100% width
  startIcon?: ReactNode; // Leading icon or adornment
  endIcon?: ReactNode; // Trailing icon or adornment
  multiline?: boolean; // Multiline textarea mode
  rows?: number; // Number of rows for multiline mode
  id?: string; // HTML input ID
  name?: string; // Form input name
  sx?: SxProps<Theme>; // Outer container style overrides
  inputSx?: SxProps<Theme>; // Input field style overrides
}

// Global form text input field with label and validation support
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    required = false,
    value,
    defaultValue,
    onChange,
    onBlur,
    placeholder,
    type = 'text',
    autoComplete,
    autoFocus = false,
    error = false,
    helperText,
    reserveHelperSpace,
    disabled = false,
    fullWidth = true,
    startIcon,
    endIcon,
    multiline = false,
    rows,
    id,
    name,
    sx,
    inputSx,
  },
  ref,
) {
  const holdHelperSpace = reserveHelperSpace ?? required;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: fullWidth ? '100%' : 'auto',
        ...((sx as object) || {}),
      }}
    >
      {/* Field Label */}
      {label ? (
        <Typography
          component="label"
          htmlFor={id}
          sx={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'text.primary',
            mb: 0.75,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          {label}
          {required ? (
            <Box component="span" sx={{ color: 'error.main', fontWeight: 600 }}>
              *
            </Box>
          ) : null}
        </Typography>
      ) : null}

      {/* Input Container */}
      <Box
        sx={{
          display: 'flex',
          alignItems: multiline ? 'flex-start' : 'center',
          gap: 1,
          px: 1.75,
          py: multiline ? 1.25 : 0,
          minHeight: multiline ? undefined : 44,
          height: multiline ? undefined : 44,
          borderRadius: '10px',
          border: '1px solid',
          borderColor: error ? 'error.main' : 'divider',
          bgcolor: disabled ? 'action.disabledBackground' : 'background.paper',
          transition: 'all 0.15s ease',
          '&:focus-within': {
            borderColor: error ? 'error.main' : 'primary.main',
            boxShadow: (theme) =>
              error
                ? '0 0 0 2px rgba(239, 68, 68, 0.2)'
                : `0 0 0 2px ${theme.palette.mode === 'dark' ? 'rgba(51, 84, 244, 0.35)' : 'rgba(51, 84, 244, 0.15)'}`,
          },
          '&:hover': {
            borderColor: error ? 'error.main' : 'text.secondary',
          },
        }}
      >
        {startIcon ? (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              color: 'text.secondary',
              flexShrink: 0,
            }}
          >
            {startIcon}
          </Box>
        ) : null}

        <InputBase
          inputRef={ref}
          autoFocus={autoFocus}
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          multiline={multiline}
          rows={rows}
          fullWidth
          sx={{
            fontSize: '0.875rem',
            color: 'text.primary',
            // Keep value text readable when disabled (MUI fades disabled inputs).
            '&.Mui-disabled': {
              opacity: 1,
              color: 'text.primary',
              WebkitTextFillColor: (theme) => theme.palette.text.primary,
            },
            '& input': {
              p: 0,
              '&::placeholder': {
                color: 'text.disabled',
                opacity: 1,
              },
              '&.Mui-disabled': {
                opacity: 1,
                WebkitTextFillColor: (theme) => theme.palette.text.primary,
              },
            },
            '& textarea': {
              p: 0,
              '&::placeholder': {
                color: '#9CA3AF',
                opacity: 1,
              },
              '&.Mui-disabled': {
                opacity: 1,
                WebkitTextFillColor: (theme) => theme.palette.text.primary,
              },
            },
            ...((inputSx as object) || {}),
          }}
        />

        {endIcon ? (
          <Box
            sx={{ display: 'inline-flex', alignItems: 'center', color: '#9CA3AF', flexShrink: 0 }}
          >
            {endIcon}
          </Box>
        ) : null}
      </Box>

      {helperText || holdHelperSpace ? (
        <Box sx={{ mt: 0.5, minHeight: '1.125rem', lineHeight: '1.125rem' }}>
          {helperText ? (
            <Typography
              variant="caption"
              component="span"
              sx={{
                fontSize: '0.75rem',
                color: error ? 'error.main' : 'text.secondary',
                display: 'block',
              }}
            >
              {helperText}
            </Typography>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
});
