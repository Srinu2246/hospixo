import type { FloorTable, FloorTableStatus } from '@/features/pos/config/dashboard';
import { getFloorStatusLabel } from '@/features/pos/config/dashboard';

import styles from './floor-status.module.css';

const statusDot: Record<FloorTableStatus, string> = {
  occupied: styles.dotOccupied,
  vacant: styles.dotVacant,
  reserved: styles.dotReserved,
  cleaning: styles.dotCleaning,
};

interface FloorStatusProps {
  tables: FloorTable[];
  legend: { status: FloorTableStatus; label: string }[];
}

export function FloorStatus({ tables, legend }: Readonly<FloorStatusProps>) {
  return (
    <section className={styles.panel} aria-labelledby="floor-status-title">
      <header className={styles.header}>
        <h2 id="floor-status-title" className={styles.title}>
          Restaurant Floor Status
        </h2>
      </header>

      <div className={styles.grid}>
        {tables.map((table) => (
          <article key={table.id} className={styles.tableCard}>
            <p className={styles.tableLabel}>{table.label}</p>
            <p className={styles.tableStatus}>
              <span className={`${styles.dot} ${statusDot[table.status]}`} aria-hidden />
              {getFloorStatusLabel(table.status)}
            </p>
          </article>
        ))}
      </div>

      <ul className={styles.legend} aria-label="Table status legend">
        {legend.map((item) => (
          <li key={item.status}>
            <span className={`${styles.dot} ${statusDot[item.status]}`} aria-hidden />
            {item.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
