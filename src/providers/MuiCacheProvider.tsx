'use client';

import type { ReactNode } from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';

type MuiCacheProviderProps = {
  children: ReactNode;
};

/** Keeps Emotion/MUI style injection aligned between SSR and the client (avoids hydration mismatches). */
export function MuiCacheProvider({ children }: MuiCacheProviderProps) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>{children}</AppRouterCacheProvider>
  );
}
