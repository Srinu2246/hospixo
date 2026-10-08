'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { PreparationStationsPageConfig } from '../config/preparation-stations-page-config';
import { fetchPreparationStationByIdClient } from '../api/preparation-stations';
import {
  useCreatePreparationStationMutation,
  usePreparationStationsListQuery,
  useUpdatePreparationStationMutation,
} from '../hooks/use-preparation-stations-query';
import type {
  CreatePreparationStationInput,
  PreparationStation,
  PreparationStationsViewMode,
  UpdatePreparationStationInput,
} from '../types/preparation-station';
import type {
  PreparationStationId,
  PreparationStationStatus,
} from '../types/preparation-station-api';

type PreparationStationsContextType = {
  pageConfig: PreparationStationsPageConfig;
  stations: PreparationStation[];
  selectedStation: PreparationStation | null;
  viewMode: PreparationStationsViewMode;
  statusFilter: PreparationStationStatus | 'all';
  isHydrated: boolean;
  stationsLoading: boolean;
  stationsError: string | null;
  detailLoading: boolean;
  detailError: string | null;

  setStatusFilter: (status: PreparationStationStatus | 'all') => void;
  openCreateStationPage: () => void;
  openViewStationPage: (station: PreparationStation) => void;
  openEditStationPage: (station?: PreparationStation) => void;
  backToList: () => void;

  createStation: (
    input: CreatePreparationStationInput,
  ) => Promise<{ ok: boolean; message?: string }>;
  updateStation: (
    stationId: PreparationStationId,
    input: UpdatePreparationStationInput,
  ) => Promise<{ ok: boolean; message?: string }>;
  loadStationDetail: (
    stationId: PreparationStationId,
  ) => Promise<{ ok: boolean; message?: string }>;
};

const PreparationStationsContext = createContext<PreparationStationsContextType | null>(null);

export function PreparationStationsProvider({
  children,
  pageConfig,
}: {
  children: ReactNode;
  pageConfig: PreparationStationsPageConfig;
}) {
  const [selectedStation, setSelectedStation] = useState<PreparationStation | null>(null);
  const [viewMode, setViewMode] = useState<PreparationStationsViewMode>('list');
  const [statusFilter, setStatusFilter] = useState<PreparationStationStatus | 'all'>('all');
  const createStationMutation = useCreatePreparationStationMutation();
  const updateStationMutation = useUpdatePreparationStationMutation();
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const listQuery = useMemo(() => {
    if (statusFilter === 'all') return undefined;
    return { status: statusFilter };
  }, [statusFilter]);

  const stationsQuery = usePreparationStationsListQuery(listQuery);
  const stations = stationsQuery.data ?? [];
  const stationsLoading = stationsQuery.isPending;
  const stationsError = stationsQuery.error instanceof Error ? stationsQuery.error.message : null;
  const isHydrated = stationsQuery.isFetched;

  const openCreateStationPage = useCallback(() => {
    setViewMode('create-station');
  }, []);

  const openViewStationPage = useCallback((station: PreparationStation) => {
    setSelectedStation(station);
    setViewMode('view-station');
    setDetailLoading(false);
    setDetailError(null);
  }, []);

  const openEditStationPage = useCallback((station?: PreparationStation) => {
    if (station) setSelectedStation(station);
    setViewMode('edit-station');
  }, []);

  const backToList = useCallback(() => {
    setViewMode('list');
    setSelectedStation(null);
    setDetailError(null);
    setDetailLoading(false);
  }, []);

  const createStation = useCallback(
    async (input: CreatePreparationStationInput) => {
      try {
        await createStationMutation.mutateAsync(input);
        backToList();
        return { ok: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create station';
        return { ok: false, message };
      }
    },
    [backToList, createStationMutation],
  );

  const updateStation = useCallback(
    async (stationId: PreparationStationId, input: UpdatePreparationStationInput) => {
      try {
        const updated = await updateStationMutation.mutateAsync({ stationId, input });
        setSelectedStation((prev) => (prev?.id === stationId ? updated : prev));
        backToList();
        return { ok: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update station';
        return { ok: false, message };
      }
    },
    [backToList, updateStationMutation],
  );

  const loadStationDetail = useCallback(async (stationId: PreparationStationId) => {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const data = await fetchPreparationStationByIdClient(stationId);
      if (data) {
        setSelectedStation(data);
        return { ok: true };
      }
      return { ok: false, message: 'Station not found' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load details';
      setDetailError(message);
      return { ok: false, message };
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const value: PreparationStationsContextType = {
    pageConfig,
    stations,
    selectedStation,
    viewMode,
    statusFilter,
    isHydrated,
    stationsLoading,
    stationsError,
    detailLoading,
    detailError,
    setStatusFilter,
    openCreateStationPage,
    openViewStationPage,
    openEditStationPage,
    backToList,
    createStation,
    updateStation,
    loadStationDetail,
  };

  return (
    <PreparationStationsContext.Provider value={value}>
      {children}
    </PreparationStationsContext.Provider>
  );
}

export function usePreparationStations() {
  const context = useContext(PreparationStationsContext);
  if (!context) {
    throw new Error('usePreparationStations must be used within PreparationStationsProvider');
  }
  return context;
}
