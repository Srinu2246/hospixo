'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { GstRatesPageConfig } from '../config/gst-rates-page-config';
import { fetchGstRateByIdClient } from '../api/gst-rates';
import { useCreateGstRateMutation, useGstRatesListQuery } from '../hooks/use-gst-rates-query';
import type { CreateGstRateInput, GstRate, GstRatesViewMode } from '../types/gst-rate';
import type { GstRateId } from '../types/gst-rate-api';

type GstRatesContextType = {
  pageConfig: GstRatesPageConfig;
  rates: GstRate[];
  selectedRate: GstRate | null;
  viewMode: GstRatesViewMode;
  codeFilter: string;
  activeOnlyFilter: boolean;
  isHydrated: boolean;
  ratesLoading: boolean;
  ratesError: string | null;
  detailLoading: boolean;
  detailError: string | null;

  setCodeFilter: (code: string) => void;
  setActiveOnlyFilter: (activeOnly: boolean) => void;
  openCreateRatePage: () => void;
  openViewRatePage: (rate: GstRate) => void;
  backToList: () => void;

  createRate: (input: CreateGstRateInput) => Promise<{ ok: boolean; message?: string }>;
  loadRateDetail: (gstRateId: GstRateId) => Promise<{ ok: boolean; message?: string }>;
};

const GstRatesContext = createContext<GstRatesContextType | null>(null);

export function GstRatesProvider({
  children,
  pageConfig,
}: Readonly<{
  children: ReactNode;
  pageConfig: GstRatesPageConfig;
}>) {
  const [selectedRate, setSelectedRate] = useState<GstRate | null>(null);
  const [viewMode, setViewMode] = useState<GstRatesViewMode>('list');
  const [codeFilter, setCodeFilter] = useState('');
  const [activeOnlyFilter, setActiveOnlyFilter] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const createRateMutation = useCreateGstRateMutation();

  const listQuery = useMemo(() => {
    const query: { code?: string; active_only?: boolean } = {};
    if (codeFilter.trim()) query.code = codeFilter.trim();
    if (activeOnlyFilter) query.active_only = true;
    return Object.keys(query).length > 0 ? query : undefined;
  }, [activeOnlyFilter, codeFilter]);

  const ratesQuery = useGstRatesListQuery(listQuery);

  const rates = ratesQuery.data ?? [];
  const ratesLoading = ratesQuery.isPending;
  const ratesError = ratesQuery.error instanceof Error ? ratesQuery.error.message : null;
  const isHydrated = ratesQuery.isFetched;

  const openCreateRatePage = useCallback(() => {
    setViewMode('create-rate');
  }, []);

  const openViewRatePage = useCallback((rate: GstRate) => {
    setSelectedRate(rate);
    setViewMode('view-rate');
    setDetailError(null);
  }, []);

  const backToList = useCallback(() => {
    setViewMode('list');
    setSelectedRate(null);
    setDetailError(null);
  }, []);

  const createRate = useCallback(
    async (input: CreateGstRateInput) => {
      try {
        await createRateMutation.mutateAsync(input);
        backToList();
        return { ok: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create GST rate';
        return { ok: false, message };
      }
    },
    [backToList, createRateMutation],
  );

  const loadRateDetail = useCallback(async (gstRateId: GstRateId) => {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const data = await fetchGstRateByIdClient(gstRateId);
      if (data) {
        setSelectedRate(data);
        return { ok: true };
      }
      return { ok: false, message: 'GST rate not found' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load GST rate detail';
      setDetailError(message);
      return { ok: false, message };
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const value = useMemo<GstRatesContextType>(
    () => ({
      pageConfig,
      rates,
      selectedRate,
      viewMode,
      codeFilter,
      activeOnlyFilter,
      isHydrated,
      ratesLoading,
      ratesError,
      detailLoading,
      detailError,
      setCodeFilter,
      setActiveOnlyFilter,
      openCreateRatePage,
      openViewRatePage,
      backToList,
      createRate,
      loadRateDetail,
    }),
    [
      pageConfig,
      rates,
      selectedRate,
      viewMode,
      codeFilter,
      activeOnlyFilter,
      isHydrated,
      ratesLoading,
      ratesError,
      detailLoading,
      detailError,
      setCodeFilter,
      setActiveOnlyFilter,
      openCreateRatePage,
      openViewRatePage,
      backToList,
      createRate,
      loadRateDetail,
    ],
  );

  return <GstRatesContext.Provider value={value}>{children}</GstRatesContext.Provider>;
}

export function useGstRates() {
  const context = useContext(GstRatesContext);
  if (!context) {
    throw new Error('useGstRates must be used within a GstRatesProvider');
  }
  return context;
}
