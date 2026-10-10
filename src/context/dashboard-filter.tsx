'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type DashboardFilterContextValue = Readonly<{
  outletId: string;
  activeBranchId: string | null;
  setOutletId: (outletId: string) => void;
  hasHydrated: boolean;
}>;

const DashboardFilterContext = createContext<DashboardFilterContextValue | null>(null);

export function DashboardFilterProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [outletId, setOutletId] = useState('all');
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlOutletId = params.get('outlet');
      if (urlOutletId) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- browser storage/URL hydration
        setOutletId(urlOutletId);
      } else {
        const storedOutletId = window.sessionStorage.getItem('hospixo.dashboard.outlet');
        if (storedOutletId) {
          setOutletId(storedOutletId);
        }
      }
    } catch {
      // Ignore errors in environments where window/storage is restricted
    }

    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    window.sessionStorage.setItem('hospixo.dashboard.outlet', outletId);
  }, [hasHydrated, outletId]);

  const value = useMemo(
    () => ({
      outletId,
      activeBranchId: outletId === 'all' ? null : outletId,
      setOutletId,
      hasHydrated,
    }),
    [hasHydrated, outletId],
  );

  return (
    <DashboardFilterContext.Provider value={value}>{children}</DashboardFilterContext.Provider>
  );
}

export function useOptionalDashboardFilter(): DashboardFilterContextValue | null {
  return useContext(DashboardFilterContext);
}

export function useDashboardFilter(): DashboardFilterContextValue {
  const context = useContext(DashboardFilterContext);

  if (!context) {
    throw new Error('useDashboardFilter must be used inside <DashboardFilterProvider>');
  }

  return context;
}
