'use client';

import type { ReactNode } from 'react';

import { AppThemeProvider } from '@/providers/app-theme-provider';

/** @deprecated Use `AppThemeProvider` — kept for auth layout imports. */
export function AuthThemeProvider({ children }: Readonly<{ children: ReactNode }>) {
  return <AppThemeProvider>{children}</AppThemeProvider>;
}
