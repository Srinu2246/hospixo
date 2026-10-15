'use client';

import { useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import type { SxProps, Theme } from '@mui/material/styles';
import { Search, X } from 'lucide-react';

export interface SearchBarProps {
  value?: string; // Current search input value
  onChange?: ((value: string) => void) | ((event: ChangeEvent<HTMLInputElement>) => void); // Value change handler
  onClear?: () => void; // Clear search callback
  placeholder?: string; // Placeholder text (default: 'Search...')
  width?: number | string | Record<string, number | string>; // Control width (default: 300)
  fullWidth?: boolean; // Stretch across container width (default: false)
  disabled?: boolean; // Disabled input state (default: false)
  autoFocus?: boolean; // Auto-focus input on mount (default: false)
  startIcon?: ReactNode; // Leading icon override (default: Search icon)
  endIcon?: ReactNode; // Trailing icon or element
  showClear?: boolean; // Show clear button when input has value (default: false)
  ariaLabel?: string; // Accessible aria-label (default: 'Search')
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void; // Key down event handler
  sx?: SxProps<Theme>; // Outer container style overrides
  inputSx?: SxProps<Theme>; // Inner input base style overrides
}

// Global SearchBar component with width 300, height 38, radius 10, padding 10/16/10/16, gap 12
export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  width = 300,
  fullWidth = false,
  disabled = false,
  autoFocus = false,
  startIcon,
  endIcon,
  showClear = false,
  ariaLabel = 'Search',
  onKeyDown,
  sx,
  inputSx,
}: Readonly<SearchBarProps>) {
  // Support both controlled and uncontrolled usage
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState('');
  const searchValue = isControlled ? value : internalValue;

  // Handle input change and support both value string and event callbacks
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    if (!isControlled) {
      setInternalValue(nextVal);
    }
    if (onChange) {
      try {
        (onChange as (val: string, ev: ChangeEvent<HTMLInputElement>) => void)(nextVal, e);
      } catch {
        (onChange as (ev: ChangeEvent<HTMLInputElement>) => void)(e);
      }
    }
  };

  // Handle clear action
  const handleClear = () => {
    if (!isControlled) {
      setInternalValue('');
    }
    onClear?.();
    if (onChange) {
      try {
        (onChange as (val: string) => void)('');
      } catch {
        // Ignored
      }
    }
  };

  return (
    <Box
      component="label"
      sx={{
        display: fullWidth ? 'flex' : 'inline-flex', // Layout display mode
        alignItems: 'center', // Vertical centering
        width: fullWidth ? '100%' : width, // Default width 300
        height: 38, // Fixed height 38px
        minHeight: 38, // Minimum height 38px
        maxHeight: 38, // Maximum height 38px
        borderRadius: '10px',
        border: '1px solid',
        borderColor: 'divider',
        gap: '12px',
        pt: '10px',
        pr: '16px',
        pb: '10px',
        pl: '16px',
        bgcolor: 'background.paper',
        boxSizing: 'border-box',
        cursor: disabled ? 'not-allowed' : 'text',
        opacity: disabled ? 0.6 : 1,
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        '&:hover': {
          borderColor: disabled ? 'divider' : 'text.secondary',
        },
        '&:focus-within': {
          borderColor: 'primary.main',
          boxShadow: (theme) => `0 0 0 1px ${theme.palette.primary.main}`,
        },
        ...sx,
      }}
    >
      {startIcon ?? (
        <Box sx={{ display: 'inline-flex', color: 'text.secondary', flexShrink: 0 }}>
          <Search size={16} strokeWidth={2} aria-hidden="true" color="currentColor" />
        </Box>
      )}

      <InputBase
        value={searchValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        onKeyDown={onKeyDown}
        inputProps={{
          'aria-label': ariaLabel,
        }}
        sx={{
          flex: 1,
          minWidth: 0,
          height: '100%',
          fontSize: '0.875rem',
          color: 'text.primary',
          '& input': {
            p: 0,
            height: '100%',
            lineHeight: 1,
            '&::placeholder': {
              color: 'text.disabled',
              opacity: 1,
            },
          },
          ...inputSx,
        }}
      />

      {showClear && Boolean(searchValue) ? (
        <Box
          component="button"
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 0,
            m: 0,
            border: 'none',
            bgcolor: 'transparent',
            color: 'text.secondary',
            cursor: 'pointer',
            flexShrink: 0,
            '&:hover': { color: 'text.primary' },
          }}
        >
          <X size={14} strokeWidth={2.5} />
        </Box>
      ) : endIcon ? (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>{endIcon}</Box>
      ) : null}
    </Box>
  );
}
