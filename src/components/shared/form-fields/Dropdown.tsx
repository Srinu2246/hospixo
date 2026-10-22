'use client';

import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { SxProps, Theme } from '@mui/material/styles';
import { ChevronDown } from 'lucide-react';

export interface DropdownOption<T extends string | number = string> {
  id: T; // Unique option identifier
  label: string; // Option display text
  disabled?: boolean; // Option disabled state
  icon?: ReactNode; // Optional leading icon
}

export interface DropdownProps<T extends string | number = string> {
  options: readonly (DropdownOption<T> | string)[]; // Dropdown items (objects or plain strings)
  value?: T; // Currently selected value
  onChange: (value: T, option?: DropdownOption<T>) => void; // Selection change callback
  placeholder?: string; // Optional placeholder text
  size?: 'small' | 'medium' | 'large'; // Size preset (default: medium)
  minWidth?: number | string; // Minimum control width (default: 125)
  disabled?: boolean; // Disabled state flag
  prefix?: ReactNode; // Optional prefix label (e.g. 'Status:')
  variant?: 'default' | 'outlet' | 'header'; // Visual variant (default, or header/outlet with subtitle)
  label?: string; // Header subtitle/label (e.g. 'Outlets')
  startIcon?: ReactNode; // Leading icon for outlet/header
  maxMenuHeight?: number; // Maximum popup menu height (default: 260)
  sx?: SxProps<Theme>; // Root Select style overrides
}

const SIZE_STYLES = {
  small: { height: 32, fontSize: '0.8125rem', borderRadius: '8px' },
  medium: { height: 38, fontSize: '0.875rem', borderRadius: '10px' },
  large: { height: 44, fontSize: '0.9375rem', borderRadius: '12px' },
} as const;

export function Dropdown<T extends string | number = string>({
  options,
  value,
  onChange,
  placeholder,
  size = 'medium',
  minWidth = 125,
  disabled = false,
  prefix,
  variant = 'default',
  label,
  startIcon,
  maxMenuHeight = 260,
  sx,
}: Readonly<DropdownProps<T>>) {
  // Normalize options into DropdownOption objects
  const normalizedOptions: DropdownOption<T>[] = options.map((opt) =>
    typeof opt === 'string' ? ({ id: opt as unknown as T, label: opt } as DropdownOption<T>) : opt,
  );

  const selectedValue = value ?? normalizedOptions[0]?.id ?? ('' as T);
  const hasEmptyOption = normalizedOptions.some((option) => option.id === ('' as T));
  const sizeConfig = SIZE_STYLES[size];

  const renderPlaceholder = () => (
    <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>
      {placeholder}
    </Box>
  );

  const handleChange = (event: SelectChangeEvent<T>) => {
    const nextValue = event.target.value as T;
    const foundOption = normalizedOptions.find((opt) => opt.id === nextValue);
    onChange(nextValue, foundOption);
  };

  const isOutletVariant = variant === 'outlet' || variant === 'header';

  return (
    <FormControl
      size="small"
      sx={{
        minWidth: isOutletVariant ? undefined : minWidth,
        display: 'inline-flex',
      }}
    >
      <Select
        value={selectedValue}
        onChange={handleChange}
        disabled={disabled}
        displayEmpty={
          Boolean(placeholder) || selectedValue === ('' as T) || selectedValue === undefined
        }
        IconComponent={ChevronDown}
        MenuProps={{
          slotProps: {
            paper: {
              sx: {
                mt: 0.5,
                maxHeight: maxMenuHeight,
                overflowY: 'auto',
                borderRadius: '10px',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: (theme: Theme) =>
                  theme.palette.mode === 'dark'
                    ? '0 10px 25px -5px rgba(0, 0, 0, 0.6)'
                    : '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: (theme: Theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: (theme: Theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.35)'
                      : 'rgba(0, 0, 0, 0.35)',
                },
                '& .MuiMenuItem-root': {
                  fontSize: sizeConfig.fontSize,
                  py: 1,
                  px: 1.5,
                  color: 'text.primary',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                  '&.Mui-selected': {
                    bgcolor: 'action.selected',
                    color: 'primary.main',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: 'action.selected',
                    },
                  },
                },
              },
            },
          },
        }}
        renderValue={(val) => {
          const isEmptyValue = val === '' || val === undefined || val === null;
          const opt = normalizedOptions.find((o) => o.id === val);
          const displayLabel =
            opt?.label ?? (isEmptyValue && placeholder ? placeholder : String(val ?? ''));

          if (isEmptyValue && placeholder && !isOutletVariant && !prefix) {
            return renderPlaceholder();
          }

          if (isOutletVariant) {
            return (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  lineHeight: 1.15,
                }}
              >
                {label && (
                  <Typography
                    variant="caption"
                    component="span"
                    sx={{
                      fontSize: '0.6875rem',
                      color: 'text.secondary',
                      fontWeight: 500,
                      mb: 0.2,
                      letterSpacing: '0.01em',
                    }}
                  >
                    {label}
                  </Typography>
                )}
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    maxWidth: '100%',
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: 0,
                      flexShrink: 0,
                      transform: 'translateY(-1px)',
                    }}
                  >
                    {startIcon ?? opt?.icon}
                  </Box>
                  <Typography
                    component="span"
                    sx={{
                      color: 'text.primary',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      lineHeight: 1.25,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: { xs: 150, sm: 220, md: 280 },
                    }}
                  >
                    {displayLabel}
                  </Typography>
                </Box>
              </Box>
            );
          }

          if (prefix) {
            return (
              <Box
                component="span"
                sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}
              >
                <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  {prefix}
                </Box>
                <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>
                  {displayLabel}
                </Box>
              </Box>
            );
          }

          return (
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                color: 'text.primary',
              }}
            >
              {opt?.icon}
              {displayLabel}
            </Box>
          );
        }}
        sx={{
          height: isOutletVariant ? 'auto' : sizeConfig.height,
          minHeight: isOutletVariant ? 40 : undefined,
          borderRadius: sizeConfig.borderRadius,
          bgcolor: isOutletVariant ? 'transparent' : 'background.paper',
          fontSize: sizeConfig.fontSize,
          fontWeight: 600,
          color: 'text.primary',
          boxShadow: isOutletVariant ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.15s ease',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: isOutletVariant ? 'transparent' : 'divider',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: isOutletVariant ? 'divider' : 'text.secondary',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'primary.main',
            borderWidth: 1.5,
          },
          '& .MuiSelect-select': {
            py: isOutletVariant ? 0.5 : 0.75,
            px: isOutletVariant ? 1 : 1.5,
            pr: '32px !important',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'text.primary',
          },
          '& .MuiSelect-icon': {
            right: 8,
            fontSize: 18,
            color: 'text.secondary',
            transition: 'transform 0.2s ease',
            ...(isOutletVariant && {
              top: 'auto',
              bottom: 6,
            }),
          },
          '&:hover': isOutletVariant
            ? {
                bgcolor: 'action.hover',
              }
            : undefined,
          ...sx,
        }}
      >
        {placeholder && !hasEmptyOption ? (
          <MenuItem
            value=""
            disabled
            sx={{ color: 'text.secondary', fontSize: sizeConfig.fontSize }}
          >
            {placeholder}
          </MenuItem>
        ) : null}

        {normalizedOptions.map((opt) => (
          <MenuItem
            key={String(opt.id)}
            value={opt.id}
            disabled={opt.disabled}
            sx={{
              fontSize: sizeConfig.fontSize,
              fontWeight: opt.id === selectedValue ? 700 : 500,
              gap: 1,
            }}
          >
            {opt.icon}
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
