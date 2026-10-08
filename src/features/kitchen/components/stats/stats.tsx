import { kitchenDisplayCopy } from '@/features/kitchen/config';
import { cn } from '@/lib/utils';
import type { KitchenStats } from '@/features/kitchen/types';

import styles from './stats.module.css';

type KitchenStatsBarProps = Readonly<{
  stats: KitchenStats;
  isLive?: boolean;
}>;

export function KitchenStatsBar({ stats, isLive = true }: KitchenStatsBarProps) {
  const { stats: labels, live } = kitchenDisplayCopy;

  return (
    <div className={styles.bar} role="status" aria-live="polite">
      <div className={styles.metrics}>
        <Metric label={labels.total} value={stats.total} tone={styles.total} />
        <Metric label={labels.pending} value={stats.pending} tone={styles.pending} />
        <Metric label={labels.preparing} value={stats.preparing} tone={styles.preparing} />
        <Metric label={labels.ready} value={stats.ready} tone={styles.ready} />
      </div>

      {isLive ? (
        <span className={styles.live}>
          <span className={styles.liveDot} aria-hidden="true" />
          {live}
        </span>
      ) : null}
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: Readonly<{
  label: string;
  value: number;
  tone: string;
}>) {
  return (
    <div className={styles.metric}>
      <span className={styles.metricLabel}>{label}:</span>
      <span className={cn(styles.metricValue, tone)}>{value}</span>
    </div>
  );
}
