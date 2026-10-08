'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  buildCompanyDashboardQueryString,
  fetchCompanyDashboard,
} from '@/features/dashboard/api/company-dashboard';
import {
  buildCompanyDashboardData,
  getDefaultCompanyCustomRange,
} from '@/features/dashboard/lib/build-company-dashboard-data';
import {
  parseIsoDate,
  parseRange,
  syncDashboardSearchParams,
} from '@/features/dashboard/lib/dashboard-date-params';
import type { DashboardOverview } from '@/features/dashboard/types';
import type { OrganisationDateRangeId } from '@/features/dashboard/types/organisation-dashboard';

export const companyDashboardQueryKey = (queryString: string) =>
  ['dashboard', 'company', queryString] as const;

export type CompanyDashboardQueryResult = Readonly<{
  data: DashboardOverview;
  source: 'backend' | 'fallback';
  loadError: string | null;
}>;

type UseCompanyDashboardQueryOptions = Readonly<{
  initialQueryString?: string;
  initialPayload?: CompanyDashboardQueryResult;
}>;

export function useCompanyDashboardQuery(options?: UseCompanyDashboardQueryOptions) {
  const searchParams = useSearchParams();
  const queryString = buildCompanyDashboardQueryString(Object.fromEntries(searchParams.entries()));
  const serverQueryString = options?.initialQueryString ?? '';
  const useServerPayload = Boolean(options?.initialPayload) && serverQueryString === queryString;

  return useQuery({
    queryKey: companyDashboardQueryKey(queryString),
    queryFn: async (): Promise<CompanyDashboardQueryResult> => {
      const response = await fetchCompanyDashboard(queryString);
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Unable to load company dashboard.');
      }
      return {
        data: response.data,
        source: response.source ?? 'backend',
        loadError: response.loadError ?? null,
      };
    },
    initialData: useServerPayload ? options?.initialPayload : undefined,
    staleTime: 30_000,
  });
}

type PresetRangeId = Exclude<OrganisationDateRangeId, 'custom'>;

export function useCompanyDashboardControls(initialData: DashboardOverview) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const defaultCustomRange = getDefaultCompanyCustomRange();

  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [activeRange, setActiveRange] = useState<OrganisationDateRangeId>(() =>
    parseRange(searchParams.get('range')),
  );
  const [customFrom, setCustomFrom] = useState(() =>
    parseIsoDate(searchParams.get('from'), defaultCustomRange.from),
  );
  const [customTo, setCustomTo] = useState(() =>
    parseIsoDate(searchParams.get('to'), defaultCustomRange.to),
  );
  const dateMenuRef = useRef<HTMLDivElement>(null);

  const displayData = useMemo(
    () =>
      buildCompanyDashboardData(initialData, {
        range: activeRange,
        from: activeRange === 'custom' ? customFrom : undefined,
        to: activeRange === 'custom' ? customTo : undefined,
      }),
    [initialData, activeRange, customFrom, customTo],
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (dateMenuRef.current && !dateMenuRef.current.contains(target)) {
        setDateMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function syncUrl(updates: Record<string, string | undefined>) {
    syncDashboardSearchParams(pathname, searchParams, updates);
  }

  function handlePresetRangeChange(range: PresetRangeId) {
    setDateMenuOpen(false);
    setActiveRange(range);
    syncUrl({ range, from: undefined, to: undefined });
  }

  function handleCustomRangeApply(from: string, to: string) {
    setDateMenuOpen(false);
    setActiveRange('custom');
    setCustomFrom(from);
    setCustomTo(to);
    syncUrl({ range: 'custom', from, to });
  }

  function toggleDateMenu() {
    setDateMenuOpen((open) => !open);
  }

  return {
    displayData,
    activeRange,
    customFrom,
    customTo,
    dateMenuOpen,
    dateMenuRef,
    toggleDateMenu,
    handlePresetRangeChange,
    handleCustomRangeApply,
  };
}
