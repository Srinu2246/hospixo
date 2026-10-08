import type { PosTable } from '@/features/pos/config/tables';
import { formatRupee, getTableStatusLabel } from '@/features/pos/config/tables';
import { StatusPill } from '@/features/pos/screens/shared/status-pill';
import { Clock3, User, Users } from 'lucide-react';

import styles from './table-card.module.css';

interface TableCardProps {
  table: PosTable;
  selected?: boolean;
  onSelect: (tableId: string) => void;
}

export function TableCard({ table, selected = false, onSelect }: Readonly<TableCardProps>) {
  const statusLabel = getTableStatusLabel(table.status);

  return (
    <button
      type="button"
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      aria-pressed={selected}
      aria-label={`${table.label}, ${statusLabel}`}
      onClick={() => onSelect(table.id)}
    >
      <div className={styles.topRow}>
        <span className={styles.tableId}>{table.label}</span>
        <StatusPill status={table.status} label={statusLabel} />
      </div>

      <p className={styles.amount}>
        {table.amount != null ? formatRupee(table.amount) : table.placeholder}
      </p>

      {table.guests != null ? (
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <Users size={14} aria-hidden />
            {table.guests}
          </span>
          {table.waiter ? (
            <span className={styles.metaItem}>
              <User size={14} aria-hidden />
              {table.waiter}
            </span>
          ) : null}
          {table.elapsedMinutes != null ? (
            <span className={styles.metaItem}>
              <Clock3 size={14} aria-hidden />
              {table.elapsedMinutes}m
            </span>
          ) : null}
        </div>
      ) : (
        <div className={styles.metaPlaceholder} aria-hidden />
      )}
    </button>
  );
}
