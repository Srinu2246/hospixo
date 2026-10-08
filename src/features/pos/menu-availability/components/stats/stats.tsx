'use client';

import { menuAvailabilityCopy } from '@/features/pos/menu-availability/config';
import { cn } from '@/lib/utils';
import type {
  MenuAvailabilityStats,
  MenuStatusFilter,
} from '@/features/pos/types/menu-availability';

import styles from './stats.module.css';

type MenuStatsProps = Readonly<{
  stats: MenuAvailabilityStats;
  activeFilter: MenuStatusFilter;
  onFilterChange: (filter: MenuStatusFilter) => void;
}>;

export function MenuStats({ stats, activeFilter, onFilterChange }: MenuStatsProps) {
  const labels = menuAvailabilityCopy.stats;

  return (
    <div className={styles.grid} role="toolbar" aria-label="Filter by availability">
      <StatCard
        filter="total"
        label={labels.total}
        value={stats.total}
        tone={styles.total}
        active={activeFilter === 'total'}
        onSelect={onFilterChange}
      />
      <StatCard
        filter="available"
        label={labels.available}
        value={stats.available}
        tone={styles.available}
        active={activeFilter === 'available'}
        onSelect={onFilterChange}
      />
      <StatCard
        filter="86d"
        label={labels.eightySixed}
        value={stats.eightySixed}
        tone={styles.eightySixed}
        active={activeFilter === '86d'}
        onSelect={onFilterChange}
      />
      <StatCard
        filter="hidden"
        label={labels.hidden}
        value={stats.hidden}
        tone={styles.hidden}
        active={activeFilter === 'hidden'}
        onSelect={onFilterChange}
      />
    </div>
  );
}

function StatCard({
  filter,
  label,
  value,
  tone,
  active,
  onSelect,
}: Readonly<{
  filter: MenuStatusFilter;
  label: string;
  value: number;
  tone: string;
  active: boolean;
  onSelect: (filter: MenuStatusFilter) => void;
}>) {
  return (
    <button
      type="button"
      className={cn(styles.card, active && styles.cardActive)}
      aria-pressed={active}
      onClick={() => onSelect(filter)}
    >
      <span className={styles.label}>
        <span className={`${styles.dot} ${tone}`} aria-hidden="true" />
        {label}
      </span>
      <span className={styles.value}>{value}</span>
    </button>
  );
}
