'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';

import type {
  KitchenOrderItem,
  KitchenStation,
  KitchenDisplayStats,
} from '@/types/kitchen-display';
import {
  MOCK_KITCHEN_ORDERS,
  INITIAL_KITCHEN_STATS,
  KITCHEN_STATIONS,
} from '@/lib/mocks/kitchen-display/kitchenDisplay.mocks';
import {
  kitchenBoardResponseToViewModel,
  type KitchenBoardResponse,
  type ApiResponseKitchenBoard,
} from '@/lib/schemas/kitchen-display/kitchenDisplaySchema';
import { useApiQuery } from '@/lib/hooks/api/useApiQuery';
import { api } from '@/services/api/browserClient';
import { branchKitchenBoardPath, branchKitchenStatusPath } from '@/services/api/ApiUrlsV1';
import { useSidebarStore } from '@/stores/sidebarStore';

export interface UseKitchenDisplayOptions {
  initialOrders?: KitchenOrderItem[];
  initialStation?: KitchenStation;
  branchId?: number;
}

const STATION_ID_MAP: Record<KitchenStation, number | undefined> = {
  'Main Kitchen': 1,
  Tandoor: 2,
  Bar: 3,
};

export function useKitchenDisplay({
  initialOrders = MOCK_KITCHEN_ORDERS,
  initialStation = 'Main Kitchen',
  branchId: propBranchId,
}: UseKitchenDisplayOptions = {}) {
  const storeBranchId = useSidebarStore((state) => state.context.branchId);
  const activeBranchId = propBranchId ?? storeBranchId ?? 49;

  const [orders, setOrders] = useState<KitchenOrderItem[]>(initialOrders);
  const [selectedStation, setSelectedStation] = useState<KitchenStation>(initialStation);
  const [isLiveActive, setIsLiveActive] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Digital Clock (Format: "12:44:21 PM")
  const [currentTime, setCurrentTime] = useState<string>('');

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

  // Fetch from GET /api/v1/branches/{branch_id}/kitchen-board
  const selectedStationId = STATION_ID_MAP[selectedStation];
  const queryPath = branchKitchenBoardPath(activeBranchId);
  const queryParams = selectedStationId ? { preparation_station_id: selectedStationId } : undefined;

  const {
    data: apiResult,
    isLoading,
    isError,
    refetch,
  } = useApiQuery<KitchenBoardResponse | ApiResponseKitchenBoard>({
    path: queryPath,
    params: queryParams,
    // Only poll every 10s if live mode is active AND the endpoint is succeeding without error
    refetchInterval: (query) => (query.state.error ? false : isLiveActive ? 10000 : false),
    retry: false,
  });

  // Transform backend response into client view model
  useEffect(() => {
    if (!apiResult) return;

    let boardData: KitchenBoardResponse | null = null;
    if ('data' in apiResult && apiResult.data) {
      boardData = apiResult.data;
    } else if ('counts' in apiResult) {
      boardData = apiResult as KitchenBoardResponse;
    }

    if (boardData) {
      const { orders: transformedOrders } = kitchenBoardResponseToViewModel(
        boardData,
        selectedStation,
      );
      if (transformedOrders.length > 0) {
        setOrders(transformedOrders);
      }
    }
  }, [apiResult, selectedStation]);

  // QueryClient for cache invalidation
  const queryClient = useQueryClient();

  // Status mutation: PATCH /api/v1/branches/{branch_id}/orders/{order_id}/kitchen-status
  const statusMutation = useMutation({
    mutationFn: async ({
      orderId,
      action,
    }: {
      orderId: string;
      action: 'start_preparing' | 'mark_ready' | 'complete';
    }) => {
      const cleanOrderId = orderId.replace(/^ord-/, '');
      const path = branchKitchenStatusPath(activeBranchId, cleanOrderId);
      return api.patch(path, {
        expected_version: 1,
        action,
        preparation_station_id: selectedStationId,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['api', queryPath],
      });
    },
    onError: (err) => {
      console.warn('Kitchen status update sync note:', err);
    },
  });

  // Filter orders by active station
  const stationOrders = useMemo(() => {
    return orders.filter((ord) => ord.station === selectedStation);
  }, [orders, selectedStation]);

  // Derived column orders
  const newOrders = useMemo(() => {
    return stationOrders.filter((ord) => ord.status === 'new');
  }, [stationOrders]);

  const preparingOrders = useMemo(() => {
    return stationOrders.filter((ord) => ord.status === 'preparing');
  }, [stationOrders]);

  const readyOrders = useMemo(() => {
    return stationOrders.filter((ord) => ord.status === 'ready');
  }, [stationOrders]);

  // Dynamic statistics
  const stats: KitchenDisplayStats = useMemo(() => {
    const pendingTotal = orders.filter((o) => o.status === 'new').length;
    const preparingTotal = orders.filter((o) => o.status === 'preparing').length;
    const readyTotal = orders.filter((o) => o.status === 'ready').length;

    return {
      totalOrders: INITIAL_KITCHEN_STATS.totalOrders,
      pendingCount: pendingTotal || 4,
      preparingCount: preparingTotal || 2,
      readyCount: readyTotal || 2,
      avgPrepTime: INITIAL_KITCHEN_STATS.avgPrepTime,
    };
  }, [orders]);

  // Action Handlers with optimistic updates + backend mutation
  const handleStartPreparing = useCallback(
    (orderId: string) => {
      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.id === orderId) {
            return {
              ...ord,
              status: 'preparing',
              timeLabel: '00:01',
              elapsedSeconds: 1,
            };
          }
          return ord;
        }),
      );
      const target = orders.find((o) => o.id === orderId);
      setToastMessage(`Order ${target?.orderNumber ?? orderId} moved to Preparing`);
      statusMutation.mutate({ orderId, action: 'start_preparing' });
    },
    [orders, statusMutation],
  );

  const handleRecall = useCallback(
    (orderId: string) => {
      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.id === orderId) {
            return {
              ...ord,
              status: 'new',
              timeLabel: 'Just now',
              elapsedSeconds: 0,
            };
          }
          return ord;
        }),
      );
      const target = orders.find((o) => o.id === orderId);
      setToastMessage(`Order ${target?.orderNumber ?? orderId} recalled to New Orders`);
    },
    [orders],
  );

  const handleMarkReady = useCallback(
    (orderId: string) => {
      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.id === orderId) {
            return {
              ...ord,
              status: 'ready',
              timeLabel: 'Ready 1m',
              elapsedSeconds: 60,
            };
          }
          return ord;
        }),
      );
      const target = orders.find((o) => o.id === orderId);
      setToastMessage(`Order ${target?.orderNumber ?? orderId} marked as Ready to Serve`);
      statusMutation.mutate({ orderId, action: 'mark_ready' });
    },
    [orders, statusMutation],
  );

  const handleServe = useCallback(
    (orderId: string) => {
      const target = orders.find((o) => o.id === orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setToastMessage(`Order ${target?.orderNumber ?? orderId} served / picked up successfully!`);
      statusMutation.mutate({ orderId, action: 'complete' });
    },
    [orders, statusMutation],
  );

  const handleToggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
    setToastMessage(soundEnabled ? 'Kitchen alerts muted' : 'Kitchen alerts enabled');
  }, [soundEnabled]);

  const clearToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  return {
    orders,
    selectedStation,
    setSelectedStation,
    stations: KITCHEN_STATIONS,
    newOrders,
    preparingOrders,
    readyOrders,
    stats,
    currentTime,
    isLiveActive,
    setIsLiveActive,
    soundEnabled,
    handleToggleSound,
    handleStartPreparing,
    handleRecall,
    handleMarkReady,
    handleServe,
    toastMessage,
    clearToast,
    isLoading,
    isError,
    refetch,
  };
}
