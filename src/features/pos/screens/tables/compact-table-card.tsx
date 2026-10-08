import type { PosTable } from '@/features/pos/config/tables';
import { getCompactTableStatus } from '@/features/pos/lib/pos-table-status';
import { Clock3, Users } from 'lucide-react';

import styles from './compact-table-card.module.css';

interface CompactTableCardProps {
  table: PosTable;
  selected?: boolean;
  capacity?: number;
  onSelect: (tableId: string) => void;
}

export function CompactTableCard({
  table,
  selected = false,
  capacity = 4,
  onSelect,
}: Readonly<CompactTableCardProps>) {
  const { label, tone } = getCompactTableStatus(table.status);

  return (
    <button
      type="button"
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      aria-pressed={selected}
      aria-label={`${table.label}, ${label}`}
      onClick={() => onSelect(table.id)}
    >
      <div className={styles.topRow}>
        <span className={styles.tableId}>{table.label}</span>
        <span className={`${styles.badge} ${styles[tone]}`}>{label}</span>
      </div>

      {table.guests != null ? (
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <Users size={14} aria-hidden />
            {table.guests}/{capacity} Guests
          </span>
          {table.elapsedMinutes != null ? (
            <span className={styles.metaItem}>
              <Clock3 size={14} aria-hidden />
              {table.elapsedMinutes} min
            </span>
          ) : null}
        </div>
      ) : null}
    </button>
  );
}
