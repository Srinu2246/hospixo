'use client';

import { useState, type ChangeEvent, type MouseEvent } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import InputBase from '@mui/material/InputBase';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';

export interface CountryCodeOption {
  code: string; // Dialing prefix (e.g., '+91')
  label: string; // Country name
  flag: string; // Country flag emoji
}

export const DEFAULT_COUNTRY_CODES: CountryCodeOption[] = [
  { code: '+91', label: 'India', flag: '🇮🇳' },
  { code: '+1', label: 'United States', flag: '🇺🇸' },
  { code: '+44', label: 'United Kingdom', flag: '🇬🇧' },
  { code: '+971', label: 'United Arab Emirates', flag: '🇦🇪' },
  { code: '+65', label: 'Singapore', flag: '🇸🇬' },
  { code: '+61', label: 'Australia', flag: '🇦🇺' },
  { code: '+1', label: 'Canada', flag: '🇨🇦' },
  { code: '+49', label: 'Germany', flag: '🇩🇪' },
];

export interface MobileNumberInputProps {
  label?: string; // Optional field label text
  required?: boolean; // Displays red asterisk when true
  countryCode?: string; // Dialing code prefix (default: '+91')
  onCountryCodeChange?: (code: string) => void; // Country code change handler
  phoneNumber?: string; // Phone number value
  onPhoneNumberChange?: (value: string) => void; // Phone number change handler
  placeholder?: string; // Placeholder copy
  error?: boolean; // Visual error state
  helperText?: string; // Supplemental helper or error message
  disabled?: boolean; // Disabled interaction state
  countries?: CountryCodeOption[]; // List of available countries
  sx?: SxProps<Theme>; // Outer container style overrides
}

// Global mobile number input with country code selector and phone field
export function MobileNumberInput({
  label = 'Phone Number',
  required = false,
  countryCode = '+91',
  onCountryCodeChange,
  phoneNumber = '',
  onPhoneNumberChange,
  placeholder = '999 777 6767',
  error = false,
  helperText,
  disabled = false,
  countries = DEFAULT_COUNTRY_CODES,
  sx,
}: Readonly<MobileNumberInputProps>) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Active country details
  const activeCountry = countries.find((c) => c.code === countryCode) ||
    countries[0] || { code: '+91', flag: '🇮🇳', label: 'India' };

  // Open country menu
  const handleOpenMenu = (event: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    setAnchorEl(event.currentTarget);
  };

  // Close country menu
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Select country code
  const handleSelectCountry = (code: string) => {
    onCountryCodeChange?.(code);
    handleCloseMenu();
  };

  // Handle phone number input
  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    onPhoneNumberChange?.(e.target.value);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        ...((sx as object) || {}),
      }}
    >
      {/* Field Label */}
      {label ? (
        <Typography
          component="label"
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

      {/* Inputs Row: Country Code + Phone Number */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
        {/* Country Code Selector */}
        <ButtonBase
          onClick={handleOpenMenu}
          disabled={disabled}
          sx={{
            height: 44,
            px: 1.5,
            borderRadius: '10px',
            border: '1px solid',
            borderColor: error ? 'error.main' : 'divider',
            bgcolor: disabled ? 'action.disabledBackground' : 'background.paper',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            flexShrink: 0,
            transition: 'all 0.15s ease',
            '&:hover': {
              borderColor: error ? 'error.main' : 'text.secondary',
            },
          }}
        >
          <Typography component="span" sx={{ fontSize: '1rem', lineHeight: 1 }}>
            {activeCountry.flag}
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
            {activeCountry.code}
          </Typography>
        </ButtonBase>

        {/* Country Picker Popover Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          slotProps={{
            paper: {
              sx: {
                mt: 0.5,
                borderRadius: '12px',
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                    : '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                maxHeight: 280,
              },
            },
          }}
        >
          {countries.map((country) => (
            <MenuItem
              key={`${country.code}-${country.label}`}
              selected={country.code === activeCountry.code}
              onClick={() => handleSelectCountry(country.code)}
              sx={{
                fontSize: '0.875rem',
                gap: 1.5,
                py: 1,
                px: 2,
                '&.Mui-selected': {
                  bgcolor: 'action.selected',
                  fontWeight: 600,
                  color: 'primary.main',
                },
              }}
            >
              <Typography component="span" sx={{ fontSize: '1.1rem' }}>
                {country.flag}
              </Typography>
              <Typography
                sx={{ fontSize: '0.875rem', color: 'inherit', fontWeight: 'inherit', flex: 1 }}
              >
                {country.label}
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                {country.code}
              </Typography>
            </MenuItem>
          ))}
        </Menu>

        {/* Phone Number Field */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            height: 44,
            px: 1.75,
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
          <InputBase
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder={placeholder}
            disabled={disabled}
            fullWidth
            sx={{
              fontSize: '0.875rem',
              color: 'text.primary',
              '& input': {
                p: 0,
                '&::placeholder': {
                  color: 'text.disabled',
                  opacity: 1,
                },
              },
            }}
          />
        </Box>
      </Box>

      {/* Helper / Error Text */}
      {helperText ? (
        <Typography
          variant="caption"
          sx={{
            mt: 0.5,
            fontSize: '0.75rem',
            color: error ? '#EF4444' : 'text.secondary',
          }}
        >
          {helperText}
        </Typography>
      ) : null}
    </Box>
  );
}
