'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

import type {
  KitchenDishItem,
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
import {
  readBranchOrderVersion,
  rememberBranchOrderVersion,
} from '@/lib/hooks/pos/point-of-sale/order-events/branchOrderEventsConnection';
import { useBranchOrderEventsStream } from '@/lib/hooks/pos/point-of-sale/order-events/useBranchOrderEventsStream';
import {
  isKitchenOrderVersionConflict,
  kitchenConflictExpectedVersion,
  kitchenStatusErrorMessage,
  useUpdateKitchenOrderStatus,
} from '@/lib/hooks/kitchen-display/useUpdateKitchenOrderStatus';
import {
  kitchenActionForItemStatus,
  kitchenLineStatusAfterAction,
  type KitchenStatusAction,
} from '@/lib/schemas/kitchen-display/kitchenStatusSchema';
import {
  collapseKitchenOrders,
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

function sourceStatusForAction(action: KitchenStatusAction): KitchenOrderItem['status'] {
  if (action === 'start_preparing') return 'new';
  if (action === 'mark_ready') return 'preparing';
  return 'ready';
}

function nextStatusForAction(action: KitchenStatusAction): 'preparing' | 'ready' | 'remove' {
  if (action === 'start_preparing') return 'preparing';
  if (action === 'mark_ready') return 'ready';
  return 'remove';
}

function withKitchenLineStatus(
  item: KitchenDishItem,
  action: KitchenStatusAction,
): KitchenDishItem {
  return { ...item, itemStatus: kitchenLineStatusAfterAction(action) };
}

function knownOrderVersion(
  order: KitchenOrderItem,
  previous: readonly KitchenOrderItem[],
  branchId: number | undefined,
): number {
  const fromCard = previous.find((row) => row.id === order.id)?.version ?? 0;
  const numericId = Number(order.id);
  const fromStream =
    branchId != null && Number.isInteger(numericId)
      ? (readBranchOrderVersion(branchId, numericId) ?? 0)
      : 0;
  return Math.max(order.version, fromCard, fromStream);
}

/** Move one line, or the whole card, to the next kitchen column. */

function applyKitchenActionToOrders(
  orders: KitchenOrderItem[],
  orderId: string,
  action: KitchenStatusAction,
  itemId?: string,
): KitchenOrderItem[] {
  const sourceStatus = sourceStatusForAction(action);
  const lineId = itemId?.trim() || undefined;
  const target = lineId
    ? orders.find((order) => order.id === orderId && order.items.some((item) => item.id === lineId))
    : orders.find((order) => order.id === orderId && order.status === sourceStatus);
  if (!target) return orders;

  const cardStatus = target.status;
  const movingOneLine = lineId != null && target.items.some((item) => item.id === lineId);
  const moved = movingOneLine ? target.items.find((item) => item.id === lineId) : undefined;
  const affectsWholeCard = !movingOneLine || target.items.length <= 1;

  if (affectsWholeCard) {
    if (action === 'served' || action === 'complete') {
      return orders.filter((order) => !(order.id === orderId && order.status === cardStatus));
    }
    const status = nextStatusForAction(action);
    if (status === 'remove') return orders;
    const movedCard: KitchenOrderItem = {
      ...target,
      status,
      items: target.items.map((item) => withKitchenLineStatus(item, action)),
      timeLabel: action === 'start_preparing' ? '00:01' : 'Ready 1m',
      elapsedSeconds: action === 'start_preparing' ? 1 : 60,
    };
    const withoutSource = orders.filter(
      (order) => !(order.id === orderId && order.status === cardStatus),
    );
    return [...withoutSource, movedCard];
  }

  if (!moved) return orders;
  const movedLine = withKitchenLineStatus(moved, action);

  const withoutLine = orders
    .map((order) => {
      if (order.id !== orderId || order.status !== cardStatus) return order;
      return { ...order, items: order.items.filter((item) => item.id !== lineId) };
    })
    .filter((order) => order.items.length > 0);

  const nextStatus = nextStatusForAction(action);
  if (nextStatus === 'remove') return withoutLine;

  const sibling = withoutLine.find((order) => order.id === orderId && order.status === nextStatus);
  if (sibling) {
    return withoutLine.map((order) =>
      order.id === orderId && order.status === nextStatus
        ? { ...order, items: [...order.items, movedLine] }
        : order,
    );
  }

  return [
    ...withoutLine,
    {
      ...target,
      status: nextStatus,
      items: [movedLine],
      timeLabel: action === 'start_preparing' ? '00:01' : 'Ready 1m',
      elapsedSeconds: action === 'start_preparing' ? 1 : 60,
    },
  ];
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

    setOrders((prev) =>
      collapseKitchenOrders(
        remoteViewModel.orders.map((order) => {
          const version = knownOrderVersion(order, prev, activeBranchId);
          return version === order.version ? order : { ...order, version };
        }),
      ),
    );
    setStats(remoteViewModel.stats);
  }, [activeBranchId, remoteViewModel, soundEnabled]);

  const updateKitchenStatus = useUpdateKitchenOrderStatus();

  const applyOptimisticKitchenAction = useCallback(
    (orderId: string, action: KitchenStatusAction, itemId?: string) => {
      setOrders((prev) =>
        collapseKitchenOrders(applyKitchenActionToOrders(prev, orderId, action, itemId)),
      );
    },
    [setOrders],
  );

  const submitKitchenStatusAction = useCallback(
    (orderId: string, action: KitchenStatusAction, successToast: string, itemId?: string) => {
      if (activeBranchId == null) {
        setToastMessage('Select a branch before updating kitchen status.');
        return;
      }

      const sourceStatus = sourceStatusForAction(action);
      const lineId = itemId?.trim() || undefined;
      const target = lineId
        ? orders.find(
            (order) => order.id === orderId && order.items.some((item) => item.id === lineId),
          )
        : orders.find((order) => order.id === orderId && order.status === sourceStatus);
      if (!target) return;

      if (updateKitchenStatus.isPending) return;

      let numericItemId: number | undefined;
      if (lineId != null) {
        const parsed = Number(lineId);
        if (!Number.isInteger(parsed) || parsed < 1) {
          setToastMessage(
            'This kitchen line is missing an item id. Refresh the board and try again.',
          );
          return;
        }
        numericItemId = parsed;
      }

      const snapshotOrders = orders;
      const snapshotStats = stats;

      const numericOrderId = Number(orderId.replace(/^ord-/, ''));
      const streamedVersion = Number.isInteger(numericOrderId)
        ? readBranchOrderVersion(activeBranchId, numericOrderId)
        : undefined;
      const expectedVersion = Math.max(target.version, streamedVersion ?? 0);

      applyOptimisticKitchenAction(orderId, action, lineId);
      setToastMessage(successToast);

      updateKitchenStatus.mutate(
        {
          branchId: activeBranchId,
          orderId,
          expectedVersion,
          action,
          itemId: numericItemId,
          preparationStationId: selectedStationId,
          boardQueryPath: queryPath,
          boardQueryParams: queryParams,
        },
        {
          onSuccess: (result) => {
            const nextVersion = result.nextVersion;
            if (nextVersion == null) return;
            if (Number.isInteger(numericOrderId)) {
              rememberBranchOrderVersion(activeBranchId, numericOrderId, nextVersion);
            }
            setOrders((prev) =>
              prev.map((ord) => (ord.id === orderId ? { ...ord, version: nextVersion } : ord)),
            );
          },
          onError: (error) => {
            const serverVersion = kitchenConflictExpectedVersion(error);
            if (serverVersion != null && Number.isInteger(numericOrderId)) {
              rememberBranchOrderVersion(activeBranchId, numericOrderId, serverVersion);
            }
            setOrders(
              serverVersion == null
                ? snapshotOrders
                : snapshotOrders.map((ord) =>
                    ord.id === orderId ? { ...ord, version: serverVersion } : ord,
                  ),
            );
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

  const submitItemKitchenAction = useCallback(
    (orderId: string, itemId: string) => {
      const target = orders.find(
        (order) => order.id === orderId && order.items.some((item) => item.id === itemId),
      );
      const line = target?.items.find((item) => item.id === itemId);
      const action = kitchenActionForItemStatus(line?.itemStatus);
      if (!line || !action) {
        setToastMessage('This item cannot move to the next kitchen step.');
        return;
      }
      const toast =
        action === 'start_preparing'
          ? `${line.name} moved to Preparing`
          : action === 'mark_ready'
            ? `${line.name} marked as Ready to Serve`
            : `${line.name} served / picked up`;
      submitKitchenStatusAction(orderId, action, toast, itemId);
    },
    [orders, submitKitchenStatusAction],
  );

  const handleStartPreparing = useCallback(
    (orderId: string, itemId?: string) => {
      if (itemId) {
        submitItemKitchenAction(orderId, itemId);
        return;
      }
      const target = orders.find((order) => order.id === orderId && order.status === 'new');
      submitKitchenStatusAction(
        orderId,
        'start_preparing',
        `Order ${target?.orderNumber ?? orderId} moved to Preparing`,
      );
    },
    [orders, submitItemKitchenAction, submitKitchenStatusAction],
  );

  const handleRecall = useCallback(() => {
    setToastMessage('Recall is not available for kitchen status updates.');
  }, [setToastMessage]);

  const handleMarkReady = useCallback(
    (orderId: string, itemId?: string) => {
      if (itemId) {
        submitItemKitchenAction(orderId, itemId);
        return;
      }
      const target = orders.find((order) => order.id === orderId && order.status === 'preparing');
      submitKitchenStatusAction(
        orderId,
        'mark_ready',
        `Order ${target?.orderNumber ?? orderId} marked as Ready to Serve`,
      );
    },
    [orders, submitItemKitchenAction, submitKitchenStatusAction],
  );

  const handleServe = useCallback(
    (orderId: string, itemId?: string) => {
      if (itemId) {
        submitItemKitchenAction(orderId, itemId);
        return;
      }
      const target = orders.find((order) => order.id === orderId && order.status === 'ready');
      submitKitchenStatusAction(
        orderId,
        'complete',
        `Order ${target?.orderNumber ?? orderId} served / picked up successfully!`,
      );
    },
    [orders, submitItemKitchenAction, submitKitchenStatusAction],
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
