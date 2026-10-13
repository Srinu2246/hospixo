'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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

export interface UseKitchenDisplayOptions {
  initialOrders?: KitchenOrderItem[];
  initialStation?: KitchenStation;
}

export function useKitchenDisplay({
  initialOrders = MOCK_KITCHEN_ORDERS,
  initialStation = 'Main Kitchen',
}: UseKitchenDisplayOptions = {}) {
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
      pendingCount: pendingTotal || 8,
      preparingCount: preparingTotal || 5,
      readyCount: readyTotal || 3,
      avgPrepTime: INITIAL_KITCHEN_STATS.avgPrepTime,
    };
  }, [orders]);

  // Actions
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
    },
    [orders],
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
    },
    [orders],
  );

  const handleServe = useCallback(
    (orderId: string) => {
      const target = orders.find((o) => o.id === orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setToastMessage(`Order ${target?.orderNumber ?? orderId} served / picked up successfully!`);
    },
    [orders],
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
  };
}
