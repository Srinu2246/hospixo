'use client';

import type { ReactNode } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryProvider } from './QueryProvider';
import { theme } from '@/lib/theme/mui/theme';

type AppProviderProps = {
  children: ReactNode;
};

// Filter LocatorJS extension console.error in dev to prevent Next.js error overlay from popping up
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    const first = args[0];
    if (typeof first === 'string') {
      if (first.includes('[LocatorJS]')) {
        console.warn(...args);
        return;
      }
      // LocatorJS path attributes can differ between SSR and client under React Compiler.
      if (first.includes('hydration') && first.includes('data-locatorjs')) {
        console.warn(...args);
        return;
      }
    }
    originalConsoleError(...args);
  };
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryProvider>{children}</QueryProvider>
    </ThemeProvider>
  );
}
