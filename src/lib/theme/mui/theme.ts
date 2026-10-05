import { createTheme, type Theme } from '@mui/material/styles';

import { breakpoints } from './breakpoints';
import { colors } from './colors';
import { shape } from './shape';
import { spacing } from './spacing';
import { typography } from './typography';

export type AppColorScheme = 'light' | 'dark';

export function createAppTheme(mode: AppColorScheme): Theme {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
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
        default: isDark ? colors.background.dark : colors.background.default,
        paper: isDark ? colors.surface.dark : colors.surface.default,
      },
      text: {
        primary: isDark ? '#ededed' : colors.text.primary,
        secondary: isDark ? '#a3a3a3' : colors.text.secondary,
        disabled: isDark ? '#737373' : colors.text.disabled,
      },
      divider: isDark ? colors.divider.dark : colors.divider.default,
    },
    typography,
    spacing,
    shape,
    breakpoints: {
      values: breakpoints,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            backgroundColor: 'var(--background)',
          },
          body: {
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)',
          },
        },
      },
    },
  });
}

/** Default light theme (tests / legacy imports). */
export const theme = createAppTheme('light');
