import type { DineInTable, DineInTableStatus } from '@/features/pos/config/dine-in';
import { Clock3, Users } from 'lucide-react';

import styles from './dine-in-tables-panel.module.css';

const statusClass: Record<DineInTableStatus, string> = {
  available: styles.statusAvailable,
  occupied: styles.statusOccupied,
  reserved: styles.statusReserved,
};

interface DineInTablesPanelProps {
  tables: DineInTable[];
  legend: { status: DineInTableStatus; label: string }[];
  selectedTableId: string;
  onSelectTable: (tableId: string) => void;
}

export function DineInTablesPanel({
  tables,
  legend,
  selectedTableId,
  onSelectTable,
}: Readonly<DineInTablesPanelProps>) {
  return (
    <section className={styles.panel} aria-labelledby="dine-in-tables-heading">
      <header className={styles.panelHeader}>
        <h2 id="dine-in-tables-heading" className={styles.panelTitle}>
          Tables
        </h2>
        <ul className={styles.legend} aria-label="Table status legend">
          {legend.map((item) => (
            <li key={item.status}>
              <span className={`${styles.legendDot} ${statusClass[item.status]}`} aria-hidden />
              {item.label}
            </li>
          ))}
        </ul>
      </header>

      <div className={styles.grid}>
        {tables.map((table) => {
          const selected = table.id === selectedTableId;
          return (
            <button
              key={table.id}
              type="button"
              className={`${styles.tableCard} ${selected ? styles.tableCardSelected : ''}`}
              aria-pressed={selected}
              aria-label={`${table.label}, ${table.status}`}
              onClick={() => onSelectTable(table.id)}
            >
              <div className={styles.tableTop}>
                <span className={styles.tableLabel}>{table.label}</span>
                <span
                  className={`${styles.statusDot} ${statusClass[table.status]}`}
                  aria-label={table.status}
                />
              </div>
              <div className={styles.tableMeta}>
                <span className={styles.metaItem}>
                  <Users size={14} aria-hidden />
                  {String(table.capacity).padStart(2, '0')}
                </span>
                <span className={styles.metaItem}>
                  <Clock3 size={14} aria-hidden />
                  {table.duration}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
