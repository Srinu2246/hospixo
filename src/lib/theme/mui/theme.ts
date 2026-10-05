import { createTheme } from '@mui/material/styles';

import { breakpoints } from './breakpoints';
import { colors } from './colors';
import { shape } from './shape';
import { spacing } from './spacing';
import { typography } from './typography';

export const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary.default,
      light: colors.primary.light,
      dark: colors.primary.dark,
    },

    secondary: {
      main: colors.secondary.default,
      light: colors.secondary.light,
      dark: colors.secondary.dark,
    },

    success: {
      main: colors.success.default,
      light: colors.success.light,
      dark: colors.success.dark,
    },

    info: {
      main: colors.info.default,
      light: colors.info.light,
      dark: colors.info.dark,
    },

    warning: {
      main: colors.warning.default,
      light: colors.warning.light,
      dark: colors.warning.dark,
    },

    error: {
      main: colors.danger.default,
      light: colors.danger.light,
      dark: colors.danger.dark,
    },

    background: {
      default: colors.background.default,
      paper: colors.surface.default,
    },

    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
      disabled: colors.text.disabled,
    },

    divider: colors.divider.default,
  },

  typography,

  spacing,

  shape,

  breakpoints: {
    values: breakpoints,
  },
});
