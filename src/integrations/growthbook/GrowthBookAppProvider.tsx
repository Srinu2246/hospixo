'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { GrowthBookProvider } from '@growthbook/growthbook-react';

import { useSidebarStore } from '@/stores/sidebarStore';

import {
  buildGrowthBookAttributes,
  getGrowthBook,
  initGrowthBook,
  refreshGrowthBook,
} from './growthbookClient';

export type GrowthBookAppProviderProps = {
  children: ReactNode;
};

/**
 * App-level GrowthBook setup.
 * Loads features once; on login / context change only updates targeting attributes.
 * Components read flags via useFeatureFlag / FeatureGate (SDK hooks).
 */
export function GrowthBookAppProvider({ children }: GrowthBookAppProviderProps) {
  const role = useSidebarStore((state) => state.role);
  const context = useSidebarStore((state) => state.context);
  const user = useSidebarStore((state) => state.user);
  const account = useSidebarStore((state) => state.account);

  const [gb] = useState(() => getGrowthBook());

  useEffect(() => {
    void initGrowthBook(gb);

    const handleFocusOrReconnect = () => {
      void refreshGrowthBook(gb);
    };

    window.addEventListener('focus', handleFocusOrReconnect);
    window.addEventListener('online', handleFocusOrReconnect);

    return () => {
      window.removeEventListener('focus', handleFocusOrReconnect);
      window.removeEventListener('online', handleFocusOrReconnect);
    };
  }, [gb]);

  // Login / role / branch changes → retarget only (no Zustand flag cache)
  useEffect(() => {
    gb.setAttributes(
      buildGrowthBookAttributes({
        role,
        context,
        user,
        account: account ?? undefined,
      }),
    );
  }, [gb, role, context, user, account]);

  return <GrowthBookProvider growthbook={gb}>{children}</GrowthBookProvider>;
}
