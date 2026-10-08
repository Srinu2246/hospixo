'use client';

import { KdsStations } from '@/features/kitchen/components/kds';
import type { KitchenStation } from '@/features/kitchen/types';

import styles from './stations.module.css';

type KitchenStationsProps = Readonly<{
  stations: readonly KitchenStation[];
  activeStationId: string;
  onChange: (stationId: string) => void;
}>;

export function KitchenStations({ stations, activeStationId, onChange }: KitchenStationsProps) {
  return (
    <KdsStations
      styles={styles}
      stations={stations}
      activeStationId={activeStationId}
      onChange={onChange}
      ariaLabel="Kitchen stations"
    />
  );
}
