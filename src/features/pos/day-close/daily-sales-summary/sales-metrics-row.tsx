import { dailySalesMetrics } from '@/features/pos/day-close/config/daily-sales-summary';

import styles from './sales-metrics-row.module.css';

export function SalesMetricsRow() {
  return (
    <div className={styles.grid}>
      {dailySalesMetrics.map((metric) => (
        <div key={metric.id} className={styles.card}>
          <p className={styles.label}>{metric.label}</p>
          <p className={styles.value}>{metric.value}</p>
        </div>
      ))}
    </div>
  );
}
