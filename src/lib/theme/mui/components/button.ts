import type { Components, Theme } from '@mui/material/styles';

import { colors } from '../colors';

/** Grey disabled treatment for all MUI buttons (light + dark). */
export function buttonDisabledSx(theme: Theme) {
  const greyBg = theme.palette.mode === 'dark' ? colors.surface.darkMuted : colors.border.light;

  return {
    opacity: 1,
    bgcolor: greyBg,
    color: theme.palette.text.disabled,
    borderColor: theme.palette.divider,
    boxShadow: 'none',
    '& .MuiButton-startIcon, & .MuiButton-endIcon, & .MuiCircularProgress-root': {
      color: theme.palette.text.disabled,
    },
  } as const;
}

export const muiIconButtonOverrides: Components<Theme>['MuiIconButton'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      '&.Mui-disabled': {
        opacity: 1,
        color: theme.palette.text.disabled,
        borderColor: theme.palette.divider,
      },
    }),
  },
};

export const muiButtonOverrides: Components<Theme>['MuiButton'] = {
  styleOverrides: {
    root: {
      '&.Mui-disabled': {
        opacity: 1,
      },
    },
    contained: ({ theme }) => ({
      '&.Mui-disabled': buttonDisabledSx(theme),
    }),
    outlined: ({ theme }) => ({
      '&.Mui-disabled': {
        ...buttonDisabledSx(theme),
        bgcolor: theme.palette.mode === 'dark' ? colors.surface.darkMuted : colors.surface.muted,
      },
    }),
    text: ({ theme }) => ({
      '&.Mui-disabled': {
        opacity: 1,
        color: theme.palette.text.disabled,
        bgcolor: 'transparent',
        boxShadow: 'none',
      },
    }),
  },
};
