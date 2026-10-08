import { cashShiftCopy } from '@/features/pos/cash-shift/config';
import { formatInrPlain } from '@/features/pos/cash-shift/lib';
import type { CashShiftMetrics } from '@/features/pos/types/cash-shift';

import styles from './metrics.module.css';

type CashShiftMetricsProps = Readonly<{
  metrics: CashShiftMetrics;
}>;

export function CashShiftMetricsCards({ metrics }: CashShiftMetricsProps) {
  const labels = cashShiftCopy.metrics;
  const isActive = metrics.status === 'active';

  return (
    <div className={styles.grid}>
      <article className={styles.card}>
        <p className={styles.label}>{labels.currentShift}</p>
        <p className={styles.valueRow}>
          <span className={isActive ? styles.dotActive : styles.dotOff} aria-hidden="true" />
          <span className={styles.value}>{isActive ? labels.active : labels.closed}</span>
        </p>
      </article>
      <article className={styles.card}>
        <p className={styles.label}>{labels.cashInDrawer}</p>
        <p className={styles.value}>{formatInrPlain(metrics.cashInDrawer)}</p>
      </article>
      <article className={styles.card}>
        <p className={styles.label}>{labels.totalSales}</p>
        <p className={styles.value}>{formatInrPlain(metrics.totalSales)}</p>
      </article>
      <article className={styles.card}>
        <p className={styles.label}>{labels.transactions}</p>
        <p className={styles.value}>{metrics.transactions}</p>
      </article>
    </div>
  );
}
