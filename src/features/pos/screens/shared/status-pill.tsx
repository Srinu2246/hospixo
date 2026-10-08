import type { TableStatus } from '@/features/pos/config/tables';

import styles from './status-pill.module.css';

const statusClass: Record<TableStatus, string> = {
  available: styles.available,
  occupied: styles.occupied,
  kotSent: styles.kotSent,
  preparing: styles.preparing,
  billing: styles.billing,
  ready: styles.ready,
  cleaning: styles.cleaning,
};

interface StatusPillProps {
  status: TableStatus;
  label: string;
  compact?: boolean;
}

export function StatusPill({ status, label, compact = false }: Readonly<StatusPillProps>) {
  return (
    <span className={`${styles.pill} ${statusClass[status]} ${compact ? styles.compact : ''}`}>
      <span className={styles.dot} aria-hidden />
      {label}
    </span>
  );
}

interface StatusLegendProps {
  items: { status: TableStatus; label: string }[];
}

export function StatusLegend({ items }: Readonly<StatusLegendProps>) {
  return (
    <ul className={styles.legend} aria-label="Table status legend">
      {items.map((item) => (
        <li key={item.status}>
          <StatusPill status={item.status} label={item.label} compact />
        </li>
      ))}
    </ul>
  );
}
