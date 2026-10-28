'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

import type {
  KitchenOrderItem,
  KitchenStation,
  KitchenDisplayStats,
} from '@/types/kitchen-display';
import { resolveBranchId } from '@/lib/helpers/resolveBranchId';
import {
  playKitchenAlertSound,
  readKitchenLiveEnabled,
  readKitchenSoundEnabled,
  writeKitchenLiveEnabled,
  writeKitchenSoundEnabled,
} from '@/lib/helpers/kitchenAlertSound';
import { EMPTY_KITCHEN_DISPLAY_STATS } from '@/lib/hooks/kitchen-display/kitchenDisplayDefaults';
import { useBranchOrderEventsStream } from '@/lib/hooks/pos/point-of-sale/order-events/useBranchOrderEventsStream';
import {
  isKitchenOrderVersionConflict,
  kitchenStatusErrorMessage,
  useUpdateKitchenOrderStatus,
} from '@/lib/hooks/kitchen-display/useUpdateKitchenOrderStatus';
import type { KitchenStatusAction } from '@/lib/schemas/kitchen-display/kitchenStatusSchema';
import {
  kitchenBoardResponseToViewModel,
  type KitchenBoardResponse,
  type ApiResponseKitchenBoard,
} from '@/lib/schemas/kitchen-display/kitchenDisplaySchema';
import { useApiQuery } from '@/lib/hooks/api/useApiQuery';
import ApiUrlsV1, { branchKitchenBoardPath } from '@/services/api/ApiUrlsV1';
import { useSidebarStore } from '@/stores/sidebarStore';
import type { BranchOrderEventsStreamStatus } from '@/lib/hooks/pos/point-of-sale/order-events/branchOrderEventsConnection';

export interface UseKitchenDisplayOptions {
  initialStation?: KitchenStation;
  branchId?: number;
}

type PreparationStationRow = { id: number; name: string };

type PreparationStationListResponse = {
  data?: { items?: PreparationStationRow[] };
  items?: PreparationStationRow[];
};

export function kitchenPosSyncStatus(
  streamStatus: BranchOrderEventsStreamStatus,
  isLiveActive = true,
): 'Active' | 'Syncing' | 'Offline' {
  if (!isLiveActive) return 'Offline';
  if (streamStatus === 'connected' || streamStatus === 'idle') return 'Active';
  if (streamStatus === 'connecting' || streamStatus === 'reconnecting') return 'Syncing';
  return 'Offline';
}

export function kitchenLiveLabel(
  streamStatus: BranchOrderEventsStreamStatus,
  isLiveActive = true,
): string {
  if (!isLiveActive) return 'Paused';
  if (streamStatus === 'denied') return 'No access';
  if (streamStatus === 'unavailable') return 'Offline';
  if (streamStatus === 'reconnecting') return 'Reconnecting';
  if (streamStatus === 'connecting') return 'Connecting';
  if (streamStatus === 'error') return 'Error';
  return 'Live';
}

export function useKitchenDisplay({
  initialStation,
  branchId: propBranchId,
}: UseKitchenDisplayOptions = {}) {
  const storeBranchId = useSidebarStore((state) => state.context.branchId);
  const activeBranchId = resolveBranchId(propBranchId, storeBranchId);

  const [orders, setOrders] = useState<KitchenOrderItem[]>([]);
  const [stats, setStats] = useState<KitchenDisplayStats>(EMPTY_KITCHEN_DISPLAY_STATS);
  const [selectedStation, setSelectedStation] = useState<KitchenStation>(initialStation ?? '');
  const [isLiveActive, setIsLiveActive] = useState<boolean>(() => readKitchenLiveEnabled());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => readKitchenSoundEnabled());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const knownNewOrderIdsRef = useRef<Set<string> | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [streamReadyReceived, setStreamReadyReceived] = useState(false);
  const hasStreamReadyRef = useRef(false);
  const refetchKitchenBoardRef = useRef<(() => void) | null>(null);
  const [streamBranchId, setStreamBranchId] = useState(activeBranchId);
  const [appliedRemoteOrders, setAppliedRemoteOrders] = useState<KitchenOrderItem[] | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const preparationStationsQuery = useApiQuery<PreparationStationListResponse>({
    path: ApiUrlsV1.restaurant.preparationStations,
    params: { status: 'active', page_size: 50 },
    enabled: activeBranchId != null,
    retry: false,
  });

  const preparationStations = useMemo(() => {
    const payload = preparationStationsQuery.data;
    const items = payload?.data?.items ?? payload?.items ?? [];
    return items.filter((row) => row.name.trim().length > 0);
  }, [preparationStationsQuery.data]);

  const stations = useMemo(
    () => preparationStations.map((row) => row.name.trim()),
    [preparationStations],
  );

  const stationIdByName = useMemo(() => {
    const map: Record<string, number> = {};
    for (const row of preparationStations) {
      map[row.name.trim()] = row.id;
    }
    return map;
  }, [preparationStations]);

  const nextStation =
    stations.length === 0
      ? selectedStation
      : selectedStation && stations.includes(selectedStation)
        ? selectedStation
        : initialStation && stations.includes(initialStation)
          ? initialStation
          : (stations[0] ?? selectedStation);
  if (nextStation !== selectedStation) {
    setSelectedStation(nextStation);
  }

  if (streamBranchId !== activeBranchId) {
    setStreamBranchId(activeBranchId);
    setStreamReadyReceived(false);
  }

  useEffect(() => {
    hasStreamReadyRef.current = false;
  }, [activeBranchId]);

  const selectedStationId = selectedStation ? stationIdByName[selectedStation] : undefined;

  const queryPath =
    activeBranchId != null
      ? branchKitchenBoardPath(activeBranchId)
      : '/v1/branches/0/kitchen-board';
  const queryParams = useMemo(
    () => (selectedStationId != null ? { preparation_station_id: selectedStationId } : undefined),
    [selectedStationId],
  );

  const stationsSettled = preparationStationsQuery.isFetched;
  const stationFilterReady =
    stationsSettled &&
    (preparationStations.length === 0 ||
      (selectedStation.trim().length > 0 && selectedStationId != null));

  const handleNewOrderAlert = useCallback(() => {
    if (soundEnabled) {
      playKitchenAlertSound();
    }
  }, [soundEnabled]);

  const handleStreamReady = useCallback(() => {
    if (hasStreamReadyRef.current) {
      refetchKitchenBoardRef.current?.();
      return;
    }
    hasStreamReadyRef.current = true;
    setStreamReadyReceived(true);
  }, [setStreamReadyReceived]);

  const handleStreamResync = useCallback(() => {
    refetchKitchenBoardRef.current?.();
  }, []);

  const handleKitchenEventBatch = useCallback(() => {
    refetchKitchenBoardRef.current?.();
  }, []);

  const { status: orderEventsSocketStatus, isConnected: isOrderEventsConnected } =
    useBranchOrderEventsStream({
      branchId: activeBranchId,
      enabled: isLiveActive && activeBranchId != null,
      onStreamReady: handleStreamReady,
      onStreamResync: handleStreamResync,
      onKitchenEventBatch: handleKitchenEventBatch,
      onKitchenAlert: handleNewOrderAlert,
    });

  const streamFallback =
    orderEventsSocketStatus === 'unavailable' || orderEventsSocketStatus === 'denied';
  const streamGateOpen = !isLiveActive || streamReadyReceived || streamFallback;

  const boardQueryEnabled = activeBranchId != null && stationFilterReady && streamGateOpen;

  const {
    data: apiResult,
    isLoading: isBoardLoading,
    isError,
    error: boardError,
    refetch,
  } = useApiQuery<KitchenBoardResponse | ApiResponseKitchenBoard>({
    path: queryPath,
    params: queryParams,
    enabled: boardQueryEnabled,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchInterval: (query) => {
      if (query.state.error || !isLiveActive) return false;
      if (isOrderEventsConnected) return false;
      if (orderEventsSocketStatus === 'connected' || streamFallback) return 15_000;
      return false;
    },
    retry: false,
  });

  useEffect(() => {
    refetchKitchenBoardRef.current = () => {
      if (!boardQueryEnabled) return;
      void refetch();
    };
  }, [boardQueryEnabled, refetch]);

  const remoteViewModel = useMemo(() => {
    if (!apiResult) return null;

    let boardData: KitchenBoardResponse | null = null;
    if ('data' in apiResult && apiResult.data) {
      boardData = apiResult.data;
    } else if ('counts' in apiResult) {
      boardData = apiResult as KitchenBoardResponse;
    }
    if (!boardData) return null;

    const stationLabel =
      boardData.preparation_station?.name?.trim() || selectedStation || stations[0] || 'Kitchen';
    return kitchenBoardResponseToViewModel(boardData, stationLabel);
  }, [apiResult, selectedStation, stations]);

  if (remoteViewModel && appliedRemoteOrders !== remoteViewModel.orders) {
    setAppliedRemoteOrders(remoteViewModel.orders);
    setOrders(remoteViewModel.orders);
    setStats(remoteViewModel.stats);
  }

  useEffect(() => {
    knownNewOrderIdsRef.current = null;
  }, [activeBranchId, queryPath, queryParams]);

  useEffect(() => {
    if (!remoteViewModel) return;

    const newOrderIds = remoteViewModel.orders
      .filter((order) => order.status === 'new')
      .map((order) => order.id);
    const known = knownNewOrderIdsRef.current;
    if (known != null && soundEnabled) {
      const fresh = newOrderIds.filter((id) => !known.has(id));
      if (fresh.length > 0) {
        playKitchenAlertSound();
      }
    }
    knownNewOrderIdsRef.current = new Set(newOrderIds);
  }, [remoteViewModel, soundEnabled]);

  const updateKitchenStatus = useUpdateKitchenOrderStatus();

  const applyOptimisticKitchenAction = useCallback(
    (orderId: string, action: KitchenStatusAction) => {
      setOrders((prev) => {
        if (action === 'complete') {
          return prev.filter((ord) => ord.id !== orderId);
        }
        return prev.map((ord) => {
          if (ord.id !== orderId) return ord;
          if (action === 'start_preparing') {
            return { ...ord, status: 'preparing', timeLabel: '00:01', elapsedSeconds: 1 };
          }
          if (action === 'mark_ready') {
            return { ...ord, status: 'ready', timeLabel: 'Ready 1m', elapsedSeconds: 60 };
          }
          return ord;
        });
      });
    },
    [setOrders],
  );

  const submitKitchenStatusAction = useCallback(
    (orderId: string, action: KitchenStatusAction, successToast: string) => {
      if (activeBranchId == null) {
        setToastMessage('Select a branch before updating kitchen status.');
        return;
      }

      const target = orders.find((o) => o.id === orderId);
      if (!target) return;

      if (updateKitchenStatus.isPending) return;

      const snapshotOrders = orders;
      const snapshotStats = stats;

      applyOptimisticKitchenAction(orderId, action);
      setToastMessage(successToast);

      updateKitchenStatus.mutate(
        {
          branchId: activeBranchId,
          orderId,
          expectedVersion: target.version,
          action,
          preparationStationId: selectedStationId,
          boardQueryPath: queryPath,
          boardQueryParams: queryParams,
        },
        {
          onSuccess: (result) => {
            const nextVersion = result.nextVersion;
            if (nextVersion == null) return;
            setOrders((prev) =>
              prev.map((ord) => (ord.id === orderId ? { ...ord, version: nextVersion } : ord)),
            );
          },
          onError: (error) => {
            setOrders(snapshotOrders);
            setStats(snapshotStats);
            if (isKitchenOrderVersionConflict(error)) {
              void refetch();
              setToastMessage(
                'This order was updated elsewhere. The board has been refreshed — try again.',
              );
              return;
            }
            setToastMessage(kitchenStatusErrorMessage(error));
          },
        },
      );
    },
    [
      activeBranchId,
      applyOptimisticKitchenAction,
      orders,
      queryParams,
      queryPath,
      refetch,
      selectedStationId,
      setOrders,
      setStats,
      setToastMessage,
      stats,
      updateKitchenStatus,
    ],
  );

  const stationOrders = useMemo(() => {
    if (!selectedStation || stations.length === 0) return orders;
    return orders.filter((ord) => ord.station === selectedStation);
  }, [orders, selectedStation, stations.length]);

  const newOrders = useMemo(
    () => stationOrders.filter((ord) => ord.status === 'new'),
    [stationOrders],
  );
  const preparingOrders = useMemo(
    () => stationOrders.filter((ord) => ord.status === 'preparing'),
    [stationOrders],
  );
  const readyOrders = useMemo(
    () => stationOrders.filter((ord) => ord.status === 'ready'),
    [stationOrders],
  );

  const handleStartPreparing = useCallback(
    (orderId: string) => {
      const target = orders.find((o) => o.id === orderId);
      submitKitchenStatusAction(
        orderId,
        'start_preparing',
        `Order ${target?.orderNumber ?? orderId} moved to Preparing`,
      );
    },
    [orders, submitKitchenStatusAction],
  );

  const handleRecall = useCallback(() => {
    setToastMessage('Recall is not available for kitchen status updates.');
  }, [setToastMessage]);

  const handleMarkReady = useCallback(
    (orderId: string) => {
      const target = orders.find((o) => o.id === orderId);
      submitKitchenStatusAction(
        orderId,
        'mark_ready',
        `Order ${target?.orderNumber ?? orderId} marked as Ready to Serve`,
      );
    },
    [orders, submitKitchenStatusAction],
  );

  const handleServe = useCallback(
    (orderId: string) => {
      const target = orders.find((o) => o.id === orderId);
      submitKitchenStatusAction(
        orderId,
        'complete',
        `Order ${target?.orderNumber ?? orderId} served / picked up successfully!`,
      );
    },
    [orders, submitKitchenStatusAction],
  );

  const handleToggleLive = useCallback(() => {
    setIsLiveActive((prev) => {
      const next = !prev;
      writeKitchenLiveEnabled(next);
      setToastMessage(next ? 'Kitchen display is live' : 'Kitchen display paused');
      return next;
    });
  }, [setIsLiveActive, setToastMessage]);

  const handleToggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      writeKitchenSoundEnabled(next);
      setToastMessage(next ? 'Kitchen alerts enabled' : 'Kitchen alerts muted');
      return next;
    });
  }, [setSoundEnabled, setToastMessage]);

  const clearToast = useCallback(() => {
    setToastMessage(null);
  }, [setToastMessage]);

  const liveLabel = kitchenLiveLabel(orderEventsSocketStatus, isLiveActive);
  const posSyncStatus = kitchenPosSyncStatus(orderEventsSocketStatus, isLiveActive);
  const isWaitingForStream =
    isLiveActive && activeBranchId != null && !streamReadyReceived && !streamFallback;

  return {
    orders,
    selectedStation,
    setSelectedStation,
    stations,
    newOrders,
    preparingOrders,
    readyOrders,
    stats,
    currentTime,
    isLiveActive,
    setIsLiveActive,
    handleToggleLive,
    soundEnabled,
    handleToggleSound,
    handleStartPreparing,
    handleRecall,
    handleMarkReady,
    handleServe,
    toastMessage,
    clearToast,
    isLoading: isBoardLoading || isWaitingForStream,
    isError,
    boardError,
    refetch,
    orderEventsSocketStatus,
    isOrderEventsConnected,
    liveLabel,
    posSyncStatus,
  };
}
