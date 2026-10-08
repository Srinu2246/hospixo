'use client';

import { cn } from '@/lib/utils';
import type { KdsStation } from '@/features/kitchen/types/kds';

type KdsStationsProps = Readonly<{
  styles: Readonly<Record<string, string>>;
  stations: readonly KdsStation[];
  activeStationId: string;
  onChange: (stationId: string) => void;
  ariaLabel: string;
}>;

export function KdsStations({
  styles,
  stations,
  activeStationId,
  onChange,
  ariaLabel,
}: KdsStationsProps) {
  return (
    <div className={styles.tabs} role="tablist" aria-label={ariaLabel}>
      {stations.map((station) => {
        const active = station.id === activeStationId;
        return (
          <button
            key={station.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={cn(styles.tab, active && styles.tabActive)}
            onClick={() => onChange(station.id)}
          >
            {station.label}
          </button>
        );
      })}
    </div>
  );
}
