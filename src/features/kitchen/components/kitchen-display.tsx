'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bell } from 'lucide-react';

import { KitchenBoard } from '@/features/kitchen/components/board';
import { KitchenFooter } from '@/features/kitchen/components/footer';
import { KitchenHeader } from '@/features/kitchen/components/header';
import { KitchenStations } from '@/features/kitchen/components/stations';
import { KitchenStatsBar } from '@/features/kitchen/components/stats';
import { defaultKitchenStations } from '@/features/kitchen/config';
import {
  filterOrdersByStation,
  getKitchenStats,
  removeOrder,
  setOrderStatus,
} from '@/features/kitchen/lib/stats';
import type {
  KitchenConnectionStatus,
  KitchenOrder,
  KitchenStation,
  KitchenStats,
} from '@/features/kitchen/types';

import styles from './kitchen-display.module.css';

type KitchenDisplayProps = Readonly<{
  orders?: readonly KitchenOrder[];
  stations?: readonly KitchenStation[];
  /** When omitted, stats are derived live from the active station's orders. */
  stats?: KitchenStats;
  connectionStatus?: KitchenConnectionStatus;
  /** Override screen title — e.g. "Chef Display" on `/chef`. */
  title?: string;
  onStartPreparing?: (orderId: string) => void;
  onRecall?: (orderId: string) => void;
  onMarkReady?: (orderId: string) => void;
  onServed?: (orderId: string) => void;
}>;

const DEFAULT_CONNECTION: KitchenConnectionStatus = {
  printerConnected: false,
  posSyncActive: false,
};

export function KitchenDisplay({
  orders: initialOrders = [],
  stations = defaultKitchenStations,
  stats: statsProp,
  connectionStatus = DEFAULT_CONNECTION,
  title,
  onStartPreparing,
  onRecall,
  onMarkReady,
  onServed,
}: KitchenDisplayProps) {
  const [orders, setOrders] = useState<KitchenOrder[]>(() => [...initialOrders]);
  const [activeStationId, setActiveStationId] = useState(() => stations[0]?.id ?? 'main-kitchen');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync external order feed into local board state
    setOrders([...initialOrders]);
  }, [initialOrders]);

  const activeStation = useMemo(
    () => stations.find((station) => station.id === activeStationId) ?? stations[0],
    [stations, activeStationId],
  );

  const stationOrders = useMemo(
    () => filterOrdersByStation(orders, activeStationId),
    [orders, activeStationId],
  );

  const stats = statsProp ?? getKitchenStats(stationOrders);

  function handleStartPreparing(orderId: string) {
    setOrders((prev) => setOrderStatus(prev, orderId, 'preparing'));
    onStartPreparing?.(orderId);
  }

  function handleRecall(orderId: string) {
    setOrders((prev) => setOrderStatus(prev, orderId, 'new'));
    onRecall?.(orderId);
  }

  function handleMarkReady(orderId: string) {
    setOrders((prev) => setOrderStatus(prev, orderId, 'ready'));
    onMarkReady?.(orderId);
  }

  function handleServed(orderId: string) {
    setOrders((prev) => removeOrder(prev, orderId));
    onServed?.(orderId);
  }

  return (
    <div className={styles.display}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <KitchenHeader station={activeStation} title={title} />
          {stations.length > 0 ? (
            <KitchenStations
              stations={stations}
              activeStationId={activeStationId}
              onChange={setActiveStationId}
            />
          ) : null}
        </div>

        <div className={styles.toolbarRight}>
          <KitchenStatsBar stats={stats} />
          <button type="button" className={styles.bell} aria-label="Kitchen alerts">
            <Bell className={styles.bellIcon} />
          </button>
        </div>
      </div>

      <KitchenBoard
        orders={stationOrders}
        onStartPreparing={handleStartPreparing}
        onRecall={handleRecall}
        onMarkReady={handleMarkReady}
        onServed={handleServed}
      />

      <KitchenFooter status={connectionStatus} />
    </div>
  );
}
