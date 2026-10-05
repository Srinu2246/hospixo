'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { syncCompanyOverviewBranchPresentation } from '@/features/dashboard/lib/sync-company-overview-outlets';
import type { DashboardBootstrap } from '@/features/dashboard/types/dashboard-bootstrap';
import type {
  DashboardCompany,
  DashboardOutlet,
  DashboardOverview,
} from '@/features/dashboard/types';

type DashboardDataContextValue = Readonly<{
  data: DashboardOverview | null;
  companies: readonly DashboardCompany[];
  source: 'fallback' | 'backend' | null;
  isLoading: boolean;
  error: string | null;
  hydrateOutlets: (outlets: readonly DashboardOutlet[]) => void;
  clearHydratedOutlets: () => void;
}>;

const DashboardDataContext = createContext<DashboardDataContextValue | null>(null);

function areOutletsEqual(
  left: readonly DashboardOutlet[],
  right: readonly DashboardOutlet[],
): boolean {
  if (left.length !== right.length) return false;

  return left.every((outlet, index) => {
    const other = right[index];
    return other?.id === outlet.id && other?.name === outlet.name;
  });
}

export function DashboardDataProvider({
  children,
  bootstrap = null,
}: Readonly<{
  children: React.ReactNode;
  bootstrap?: DashboardBootstrap | null;
}>) {
  const hasServerBootstrap = bootstrap != null;
  const [hydratedOutlets, setHydratedOutlets] = useState<readonly DashboardOutlet[] | null>(null);

  const hydrateOutlets = useCallback((outlets: readonly DashboardOutlet[]) => {
    setHydratedOutlets((current) => {
      if (current && areOutletsEqual(current, outlets)) {
        return current;
      }

      return outlets;
    });
  }, []);

  const clearHydratedOutlets = useCallback(() => {
    setHydratedOutlets(null);
  }, []);

  const data = useMemo(() => {
    const base = bootstrap?.data ?? null;
    if (!hydratedOutlets || hydratedOutlets.length === 0) {
      return base;
    }

    if (!base) {
      return { outlets: [...hydratedOutlets] } as DashboardOverview;
    }

    return syncCompanyOverviewBranchPresentation({
      ...base,
      outlets: [...hydratedOutlets],
    });
  }, [bootstrap?.data, hydratedOutlets]);

  const value = useMemo<DashboardDataContextValue>(
    () => ({
      data,
      companies: bootstrap?.companies ?? [],
      source: bootstrap?.source ?? null,
      isLoading: !hasServerBootstrap,
      error: bootstrap?.loadError ?? null,
      hydrateOutlets,
      clearHydratedOutlets,
    }),
    [bootstrap, clearHydratedOutlets, data, hasServerBootstrap, hydrateOutlets],
  );

  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>;
}

export function useOptionalDashboardData(): DashboardDataContextValue | null {
  return useContext(DashboardDataContext);
}

export function useDashboardData(): DashboardDataContextValue {
  const context = useContext(DashboardDataContext);

  if (!context) {
    throw new Error('useDashboardData must be used inside <DashboardDataProvider>');
  }

  return context;
}
