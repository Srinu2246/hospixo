'use client';

import type { ReactNode } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';

import AdminChromeCssVars from '@/components/theme/AdminChromeCssVars';
import { theme } from '@/lib/theme/mui/theme';
import { AppStoreProvider } from '@/stores/provider';

import { QueryProvider } from './QueryProvider';

type AppProviderProps = {
  children: ReactNode;
};

function stringifyConsoleArg(arg: unknown): string {
  if (typeof arg === 'string') return arg;
  if (arg instanceof Error) return arg.message;
  try {
    return JSON.stringify(arg);
  } catch {
    return '';
  }
}

function isLocatorOrHydrationNoise(args: unknown[]): boolean {
  const text = args.map(stringifyConsoleArg).join(' ');
  if (text.includes('[LocatorJS]') || text.includes('data-locatorjs-id')) return true;
  if (text.includes('hydrated') && text.includes("didn't match")) return true;
  if (text.includes('server rendered HTML') && text.includes("didn't match")) return true;
  return false;
}

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    if (isLocatorOrHydrationNoise(args)) {
      return;
    }
    originalConsoleError(...args);
  };
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <AppStoreProvider>
      <QueryProvider>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <AdminChromeCssVars />
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </QueryProvider>
    </AppStoreProvider>
  );
}
