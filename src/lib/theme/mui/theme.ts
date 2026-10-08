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
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 6,
            fontSize: '0.875rem',
            lineHeight: 1.5,
            transition: 'all 0.15s ease',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          contained: {
            backgroundColor: colors.primary.default,
            color: '#ffffff',
            '&:hover': {
              backgroundColor: colors.primary.dark,
            },
          },
          outlined: {
            borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#cbd5e1',
            color: isDark ? '#e2e8f0' : '#475569',
            backgroundColor: isDark ? 'transparent' : '#ffffff',
            '&:hover': {
              borderColor: isDark ? 'rgba(255, 255, 255, 0.4)' : '#94a3b8',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
            },
          },
          sizeSmall: {
            height: 32,
            padding: '4px 10px',
            fontSize: '0.8125rem',
          },
          sizeMedium: {
            height: 38,
            padding: '6px 14px',
          },
          sizeLarge: {
            height: 42,
            padding: '8px 18px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'}`,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.02)',
            backgroundColor: isDark ? colors.surface.dark : '#ffffff',
            backgroundImage: 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundImage: 'none',
            '&.MuiPaper-outlined': {
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontSize: '0.875rem',
            backgroundColor: isDark ? 'transparent' : '#ffffff',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : '#94a3b8',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary.default,
              borderWidth: '1px',
              boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.12)',
            },
            '&.Mui-error .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.danger.default,
              boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.1)',
            },
          },
          input: {
            fontSize: '0.875rem',
            color: isDark ? '#ededed' : '#0f172a',
            '&::placeholder': {
              color: '#94a3b8',
              opacity: 1,
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontSize: '0.875rem',
            color: isDark ? '#a3a3a3' : '#475569',
            '&.Mui-focused': {
              color: colors.primary.default,
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          select: {
            fontSize: '0.875rem',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            fontSize: '0.875rem',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
            padding: '10px 14px',
          },
          head: {
            fontWeight: 600,
            color: isDark ? '#a3a3a3' : '#475569',
            backgroundColor: isDark ? '#1a1a1a' : '#f8fafc',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontSize: '0.75rem',
            fontWeight: 500,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 10,
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'}`,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
  });
}

/** Default light theme (tests / legacy imports). */
export const theme = createAppTheme('light');
