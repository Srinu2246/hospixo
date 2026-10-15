'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryProvider } from './QueryProvider';
import { theme, darkTheme } from '@/lib/theme/mui/theme';
import { useThemeStore } from '@/stores/themeStore';

type AppProviderProps = {
  children: ReactNode;
};

// Filter LocatorJS extension console.error in dev to prevent Next.js error overlay from popping up
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('[LocatorJS]')) {
      console.warn(...args);
      return;
    }
    originalConsoleError(...args);
  };
}

export function AppProvider({ children }: AppProviderProps) {
  const mode = useThemeStore((state) => state.mode);
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    if (useThemeStore.persist.hasHydrated()) {
      setThemeReady(true);
      return;
    }
    return useThemeStore.persist.onFinishHydration(() => {
      setThemeReady(true);
    });
  }, []);

  const activeMode = themeReady ? mode : 'light';
  const currentTheme = activeMode === 'dark' ? darkTheme : theme;

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      import('@locator/runtime')
        .then((locator) => {
          locator.setup();
        })
        .catch(() => {
          // ignore error if locator failed to load
        });
    }
  }, []);

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <QueryProvider>{children}</QueryProvider>
    </ThemeProvider>
  );
}
