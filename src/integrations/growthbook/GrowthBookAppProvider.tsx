'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { GrowthBookProvider } from '@growthbook/growthbook-react';
import {
  buildGrowthBookAttributes,
  getGrowthBook,
  initGrowthBook,
  refreshGrowthBook,
  syncGrowthBookToStore,
} from './growthbookClient';
import { useSidebarStore } from '@/stores/sidebarStore';

export type GrowthBookAppProviderProps = {
  children: ReactNode;
};

/**
 * Centrally manages GrowthBook feature flags at the application level.
 * Synchronizes targeting attributes with user, role, company, and branch context,
 * and maintains the global Zustand feature flag store.
 */
export function GrowthBookAppProvider({ children }: GrowthBookAppProviderProps) {
  const role = useSidebarStore((state) => state.role);
  const context = useSidebarStore((state) => state.context);
  const user = useSidebarStore((state) => state.user);
  const account = useSidebarStore((state) => state.account);

  const [gb] = useState(() => getGrowthBook());

  // Initialize GrowthBook once on mount with streaming support and refresh on window focus
  useEffect(() => {
    void initGrowthBook(gb);

    // Listen for real-time SSE streaming changes
    gb.setRenderer(() => {
      syncGrowthBookToStore(gb);
    });

    const handleFocusOrReconnect = () => {
      void refreshGrowthBook(gb);
    };

    window.addEventListener('focus', handleFocusOrReconnect);
    window.addEventListener('online', handleFocusOrReconnect);

    return () => {
      window.removeEventListener('focus', handleFocusOrReconnect);
      window.removeEventListener('online', handleFocusOrReconnect);
      gb.setRenderer(() => {});
    };
  }, [gb]);

  // Keep targeting attributes in sync when authentication, role, or branch changes
  useEffect(() => {
    const updatedAttrs = buildGrowthBookAttributes({
      role,
      context,
      user,
      account: account ?? undefined,
    });
    gb.setAttributes(updatedAttrs);
    syncGrowthBookToStore(gb);
  }, [gb, role, context, user, account]);

  return <GrowthBookProvider growthbook={gb}>{children}</GrowthBookProvider>;
}
