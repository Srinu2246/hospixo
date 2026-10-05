import type { SxProps, Theme } from '@mui/material/styles';

import { colors } from '@/lib/theme/mui/colors';

export const authTextFieldSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    minHeight: '2.75rem',
    borderRadius: 1,
    fontSize: '0.9375rem',
    backgroundColor: colors.background.default,
    '& fieldset': {
      borderColor: colors.border.default,
    },
    '&:hover fieldset': {
      borderColor: colors.border.dark,
    },
    '&.Mui-focused fieldset': {
      borderColor: colors.auth.accent,
      borderWidth: 1,
    },
    '&.Mui-error fieldset': {
      borderColor: colors.danger.default,
    },
  },
  '& .MuiInputLabel-root': {
    display: 'none',
  },
  '& .MuiOutlinedInput-input': {
    py: 1.25,
    px: 1.5,
    '&::placeholder': {
      color: colors.text.secondary,
      opacity: 1,
    },
  },
};

export const authFieldLabelSx: SxProps<Theme> = {
  fontSize: '0.875rem',
  fontWeight: 600,
  color: colors.text.primary,
};

export const authPrimaryButtonSx: SxProps<Theme> = {
  width: '100%',
  minHeight: '2.85rem',
  mt: 0.5,
  borderRadius: 1,
  fontSize: '0.9375rem',
  fontWeight: 600,
  textTransform: 'none',
  backgroundColor: colors.auth.accent,
  color: colors.auth.accentForeground,
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: colors.auth.accent,
    filter: 'brightness(0.92)',
    boxShadow: 'none',
  },
  '&:focus-visible': {
    outline: `2px solid ${colors.auth.accentForeground}`,
    outlineOffset: 2,
  },
};

export const authLinkSx: SxProps<Theme> = {
  fontSize: '0.875rem',
  fontWeight: 600,
  color: colors.auth.accent,
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  },
  '&:focus-visible': {
    outline: `2px solid ${colors.auth.accent}`,
    outlineOffset: 2,
    borderRadius: 0.5,
  },
};
