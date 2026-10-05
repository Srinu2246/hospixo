'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { fetchOrganisationDashboard } from '@/features/dashboard/api/organisation-dashboard';
import { buildOrganisationDashboardData } from '@/features/dashboard/lib/build-organisation-dashboard-data';
import { getDefaultOrganisationCustomRange } from '@/features/dashboard/lib/organisation-dashboard-format';
import type {
  OrganisationDashboardOverview,
  OrganisationDashboardViewMode,
  OrganisationDateRangeId,
  OrganisationPerformanceMetricId,
} from '@/features/dashboard/types/organisation-dashboard';

export const organisationDashboardQueryKey = (queryString: string) =>
  ['dashboard', 'organisation', queryString] as const;

export function useOrganisationDashboardQuery() {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  return useQuery({
    queryKey: organisationDashboardQueryKey(queryString),
    queryFn: async () => {
      const response = await fetchOrganisationDashboard(queryString);
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Unable to load organisation dashboard.');
      }
      return {
        data: response.data,
        source: response.source ?? 'backend',
        loadError: response.loadError ?? null,
      };
    },
  });
}

type PresetRangeId = Exclude<OrganisationDateRangeId, 'custom'>;

function parseRange(value: string | null): OrganisationDateRangeId {
  if (
    value === 'today' ||
    value === 'last-7-days' ||
    value === 'last-30-days' ||
    value === 'custom'
  ) {
    return value;
  }

  return 'last-7-days';
}

function parseIsoDate(value: string | null, fallback: string): string {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : fallback;
}

function parseMetric(
  value: string | null,
  fallback: OrganisationPerformanceMetricId,
): OrganisationPerformanceMetricId {
  if (value === 'revenue' || value === 'orders' || value === 'profit' || value === 'total-sales') {
    return value;
  }

  return fallback;
}

function parseViewMode(value: string | null): OrganisationDashboardViewMode {
  if (value === 'chart') return 'chart';
  return 'list';
}

export function useOrganisationDashboardControls(initialData: OrganisationDashboardOverview) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const defaultCustomRange = getDefaultOrganisationCustomRange();

  const [viewMode, setViewMode] = useState<OrganisationDashboardViewMode>(() =>
    parseViewMode(searchParams.get('view')),
  );
  const [metricMenuOpen, setMetricMenuOpen] = useState(false);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [dateMenuSource, setDateMenuSource] = useState<'header' | 'performance' | null>(null);
  const [activeRange, setActiveRange] = useState<OrganisationDateRangeId>(() =>
    parseRange(searchParams.get('range')),
  );
  const [customFrom, setCustomFrom] = useState(() =>
    parseIsoDate(searchParams.get('from'), defaultCustomRange.from),
  );
  const [customTo, setCustomTo] = useState(() =>
    parseIsoDate(searchParams.get('to'), defaultCustomRange.to),
  );
  const [activeMetric, setActiveMetric] = useState<OrganisationPerformanceMetricId>(() =>
    parseMetric(searchParams.get('metric'), initialData.performanceMetric),
  );
  const [currentPage, setCurrentPage] = useState(() => {
    const page = Number(searchParams.get('page') ?? initialData.performancePage);
    return Number.isFinite(page) && page > 0 ? page : 1;
  });
  const [expandedInsightId, setExpandedInsightId] = useState<string | null>(null);
  const [selectedKpiId, setSelectedKpiId] = useState<string | null>(null);
  const metricMenuRef = useRef<HTMLDivElement>(null);
  const headerDateMenuRef = useRef<HTMLDivElement>(null);
  const performanceDateMenuRef = useRef<HTMLDivElement>(null);

  const displayData = useMemo(
    () =>
      buildOrganisationDashboardData(initialData, {
        range: activeRange,
        from: activeRange === 'custom' ? customFrom : undefined,
        to: activeRange === 'custom' ? customTo : undefined,
        metric: activeMetric,
        page: currentPage,
        pageSize: initialData.performancePageSize,
      }),
    [initialData, activeRange, customFrom, customTo, activeMetric, currentPage],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(displayData.performanceTotal / displayData.performancePageSize),
  );

  const maxChartValue = useMemo(
    () => Math.max(...displayData.companySeries.map((point) => point.value), 1),
    [displayData.companySeries],
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (metricMenuRef.current && !metricMenuRef.current.contains(target)) {
        setMetricMenuOpen(false);
      }

      const clickedHeaderDate =
        headerDateMenuRef.current && headerDateMenuRef.current.contains(target);
      const clickedPerformanceDate =
        performanceDateMenuRef.current && performanceDateMenuRef.current.contains(target);

      if (!clickedHeaderDate && !clickedPerformanceDate) {
        setDateMenuOpen(false);
        setDateMenuSource(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function syncUrl(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    const query = params.toString();
    const nextUrl = query ? `${pathname}?${query}` : pathname;
    window.history.replaceState(window.history.state, '', nextUrl);
  }

  function handleMetricChange(metric: OrganisationPerformanceMetricId) {
    setMetricMenuOpen(false);
    setActiveMetric(metric);
    setCurrentPage(1);
    syncUrl({
      metric,
      page: '1',
      range: activeRange,
      from: activeRange === 'custom' ? customFrom : undefined,
      to: activeRange === 'custom' ? customTo : undefined,
    });
  }

  function handlePresetRangeChange(range: PresetRangeId) {
    setDateMenuOpen(false);
    setDateMenuSource(null);
    setActiveRange(range);
    setCurrentPage(1);
    syncUrl({ range, page: '1', metric: activeMetric, from: undefined, to: undefined });
  }

  function handleCustomRangeApply(from: string, to: string) {
    setDateMenuOpen(false);
    setDateMenuSource(null);
    setActiveRange('custom');
    setCustomFrom(from);
    setCustomTo(to);
    setCurrentPage(1);
    syncUrl({ range: 'custom', from, to, page: '1', metric: activeMetric });
  }

  function toggleDateMenu(source: 'header' | 'performance') {
    setDateMenuOpen((open) => {
      if (open && dateMenuSource === source) {
        setDateMenuSource(null);
        return false;
      }

      setDateMenuSource(source);
      return true;
    });
  }

  function handleViewChange(view: OrganisationDashboardViewMode) {
    setViewMode(view);
    syncUrl({
      view: view === 'chart' ? undefined : view,
      range: activeRange,
      metric: activeMetric,
      page: String(currentPage),
      from: activeRange === 'custom' ? customFrom : undefined,
      to: activeRange === 'custom' ? customTo : undefined,
    });
  }

  function handlePageChange(page: number) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    syncUrl({
      page: String(page),
      range: activeRange,
      metric: activeMetric,
      from: activeRange === 'custom' ? customFrom : undefined,
      to: activeRange === 'custom' ? customTo : undefined,
    });
  }

  function handleKpiSelect(kpiId: string) {
    setSelectedKpiId(kpiId);
    const nextMetric =
      kpiId === 'total-sales'
        ? 'total-sales'
        : kpiId === 'net-sales'
          ? 'revenue'
          : kpiId === 'orders'
            ? 'orders'
            : kpiId === 'profit'
              ? 'profit'
              : activeMetric;

    if (nextMetric !== activeMetric) {
      handleMetricChange(nextMetric);
    }

    handleViewChange('list');
    requestAnimationFrame(() => {
      document.getElementById('company-performance')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }

  function handleCompareCompanies() {
    handleViewChange('list');
    requestAnimationFrame(() => {
      document.getElementById('company-performance')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }

  return {
    displayData,
    viewMode,
    metricMenuOpen,
    setMetricMenuOpen,
    dateMenuOpen,
    dateMenuSource,
    toggleDateMenu,
    customFrom,
    customTo,
    expandedInsightId,
    setExpandedInsightId,
    selectedKpiId,
    handleKpiSelect,
    metricMenuRef,
    headerDateMenuRef,
    performanceDateMenuRef,
    activeMetric,
    activeRange,
    currentPage,
    totalPages,
    maxChartValue,
    handleMetricChange,
    handlePresetRangeChange,
    handleCustomRangeApply,
    handleViewChange,
    handlePageChange,
    handleCompareCompanies,
  };
}
