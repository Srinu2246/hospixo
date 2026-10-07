'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  buildBranchDashboardQueryString,
  fetchBranchDashboard,
} from '@/features/dashboard/api/branch-dashboard';
import { getDefaultBranchCustomRange } from '@/features/dashboard/config/branch/dashboard';
import { buildBranchDashboardData } from '@/features/dashboard/lib/build-branch-dashboard-data';
import {
  parseIsoDate,
  parseRange,
  syncDashboardSearchParams,
} from '@/features/dashboard/lib/dashboard-date-params';
import type {
  BranchDashboardOverview,
  BranchDashboardPeriod,
} from '@/features/dashboard/types/branch-dashboard';
import type { OrganisationDateRangeId } from '@/features/dashboard/types/organisation-dashboard';

export const branchDashboardQueryKey = (queryString: string) =>
  ['dashboard', 'branch', queryString] as const;

export type BranchDashboardQueryResult = Readonly<{
  data: BranchDashboardOverview;
  source: 'backend' | 'fallback';
  loadError: string | null;
}>;

type UseBranchDashboardQueryOptions = Readonly<{
  initialQueryString?: string;
  initialPayload?: BranchDashboardQueryResult;
}>;

export function useBranchDashboardQuery(options?: UseBranchDashboardQueryOptions) {
  const searchParams = useSearchParams();
  const queryString = buildBranchDashboardQueryString(Object.fromEntries(searchParams.entries()));
  const serverQueryString = options?.initialQueryString ?? '';
  const useServerPayload = Boolean(options?.initialPayload) && serverQueryString === queryString;

  return useQuery({
    queryKey: branchDashboardQueryKey(queryString),
    queryFn: async (): Promise<BranchDashboardQueryResult> => {
      const response = await fetchBranchDashboard(queryString);
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Unable to load branch dashboard.');
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

function parsePeriod(value: string | null, fallback: BranchDashboardPeriod): BranchDashboardPeriod {
  if (value === 'today' || value === 'yesterday' || value === 'week') {
    return value;
  }
  return fallback;
}

export function useBranchDashboardControls(initialData: BranchDashboardOverview) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const defaultCustomRange = getDefaultBranchCustomRange();

  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [salesDateMenuOpen, setSalesDateMenuOpen] = useState(false);
  const [activeRange, setActiveRange] = useState<OrganisationDateRangeId>(() =>
    parseRange(searchParams.get('range')),
  );
  const [customFrom, setCustomFrom] = useState(() =>
    parseIsoDate(searchParams.get('from'), defaultCustomRange.from),
  );
  const [customTo, setCustomTo] = useState(() =>
    parseIsoDate(searchParams.get('to'), defaultCustomRange.to),
  );
  const [salesPeriod, setSalesPeriod] = useState<BranchDashboardPeriod>(() =>
    parsePeriod(searchParams.get('salesPeriod'), 'today'),
  );
  const [expensesPeriod, setExpensesPeriod] = useState<BranchDashboardPeriod>(() =>
    parsePeriod(searchParams.get('expensesPeriod'), 'today'),
  );
  const [onlineOrdersPeriod, setOnlineOrdersPeriod] = useState<BranchDashboardPeriod>(() =>
    parsePeriod(searchParams.get('onlinePeriod'), 'today'),
  );
  const [isSalesRefreshing, setIsSalesRefreshing] = useState(false);

  const headerDateMenuRef = useRef<HTMLDivElement>(null);
  const salesDateMenuRef = useRef<HTMLDivElement>(null);

  const displayData = useMemo(
    () =>
      buildBranchDashboardData(initialData, {
        range: activeRange,
        from: activeRange === 'custom' ? customFrom : undefined,
        to: activeRange === 'custom' ? customTo : undefined,
        salesPeriod,
        expensesPeriod,
        onlineOrdersPeriod,
      }),
    [
      initialData,
      activeRange,
      customFrom,
      customTo,
      salesPeriod,
      expensesPeriod,
      onlineOrdersPeriod,
    ],
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const inHeaderDate = headerDateMenuRef.current && headerDateMenuRef.current.contains(target);
      const inSalesDate = salesDateMenuRef.current && salesDateMenuRef.current.contains(target);

      if (!inHeaderDate && !inSalesDate) {
        setDateMenuOpen(false);
        setSalesDateMenuOpen(false);
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
    setSalesDateMenuOpen(false);
    setActiveRange(range);
    syncUrl({ range, from: undefined, to: undefined });
  }

  function handleCustomRangeApply(from: string, to: string) {
    setDateMenuOpen(false);
    setSalesDateMenuOpen(false);
    setActiveRange('custom');
    setCustomFrom(from);
    setCustomTo(to);
    syncUrl({ range: 'custom', from, to });
  }

  function toggleHeaderDateMenu() {
    setDateMenuOpen((open) => !open);
    setSalesDateMenuOpen(false);
  }

  function toggleSalesDateMenu() {
    setSalesDateMenuOpen((open) => !open);
    setDateMenuOpen(false);
  }

  function handleSalesPeriodChange(period: BranchDashboardPeriod) {
    setSalesPeriod(period);
    syncUrl({ salesPeriod: period });
  }

  function handleExpensesPeriodChange(period: BranchDashboardPeriod) {
    setExpensesPeriod(period);
    syncUrl({ expensesPeriod: period });
  }

  function handleOnlineOrdersPeriodChange(period: BranchDashboardPeriod) {
    setOnlineOrdersPeriod(period);
    syncUrl({ onlinePeriod: period });
  }

  function handleRefreshSalesStatistics() {
    setIsSalesRefreshing(true);
    setTimeout(() => {
      setIsSalesRefreshing(false);
    }, 450);
  }

  return {
    displayData,
    activeRange,
    customFrom,
    customTo,
    salesPeriod,
    expensesPeriod,
    onlineOrdersPeriod,
    dateMenuOpen,
    salesDateMenuOpen,
    isSalesRefreshing,
    headerDateMenuRef,
    salesDateMenuRef,
    toggleHeaderDateMenu,
    toggleSalesDateMenu,
    handlePresetRangeChange,
    handleCustomRangeApply,
    handleSalesPeriodChange,
    handleExpensesPeriodChange,
    handleOnlineOrdersPeriodChange,
    handleRefreshSalesStatistics,
  };
}
