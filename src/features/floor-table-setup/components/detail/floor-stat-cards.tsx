import { floorTableSetupCopy } from '@/features/floor-table-setup/config';
import type { FloorStats } from '@/features/floor-table-setup/types/floor-table-setup';

import styles from './floor-detail-page.module.css';

const statEntries = [
  { id: 'totalTables', key: 'totalTables' },
  { id: 'totalSeats', key: 'totalSeats' },
  { id: 'activeTables', key: 'activeTables' },
  { id: 'inactiveTables', key: 'inactiveTables' },
] as const;

type FloorStatCardsProps = Readonly<{
  stats: FloorStats;
}>;

export function FloorStatCards({ stats }: FloorStatCardsProps) {
  return (
    <div className={styles.stats}>
      {statEntries.map((entry) => (
        <article key={entry.id} className={styles.statCard}>
          <span className={styles.statLabel}>{floorTableSetupCopy.stats[entry.key]}</span>
          <span className={styles.statValue}>{stats[entry.key]}</span>
        </article>
      ))}
    </div>
  );
}
