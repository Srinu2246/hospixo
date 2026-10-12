import { createTheme } from '@mui/material/styles';

import { breakpoints } from './breakpoints';
import { colors, lightPalette, darkPalette } from './colors';
import { shape } from './shape';
import { spacing } from './spacing';
import { typography } from './typography';

export const getTheme = (mode: 'light' | 'dark' = 'light') => {
  const isDark = mode === 'dark';
  const palette = isDark ? darkPalette : lightPalette;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: colors.primary.default,
        light: colors.primary.light,
        dark: colors.primary.dark,
        contrastText: '#FFFFFF',
      },

      secondary: {
        main: palette.secondary.default,
        light: palette.secondary.light,
        dark: palette.secondary.dark,
      },

      success: {
        main: palette.success.default,
        light: palette.success.light,
        dark: palette.success.dark,
      },

      info: {
        main: palette.info.default,
        light: palette.info.light,
        dark: palette.info.dark,
      },

      warning: {
        main: palette.warning.default,
        light: palette.warning.light,
        dark: palette.warning.dark,
      },

      error: {
        main: palette.danger.default,
        light: palette.danger.light,
        dark: palette.danger.dark,
      },

      background: {
        default: palette.background.default,
        paper: palette.surface.default,
      },

      text: {
        primary: palette.text.primary,
        secondary: palette.text.secondary,
        disabled: palette.text.disabled,
      },

      divider: palette.divider.default,
    },

    typography,

    spacing,

    shape,

    breakpoints: {
      values: breakpoints,
    },
  });
};

export const theme = getTheme('light');
export const darkTheme = getTheme('dark');
