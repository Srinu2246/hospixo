import { FloorActionButtons } from '@/features/floor-table-setup/components/action-buttons';
import { FloorStatusBadge } from '@/features/floor-table-setup/components/status-badge';
import { formatFloorStats, formatUpdatedLabel } from '@/features/floor-table-setup/lib';
import type { Floor } from '@/features/floor-table-setup/types/floor-table-setup';

import styles from './floor-card.module.css';

type FloorCardProps = Readonly<{
  floor: Floor;
}>;

export function FloorCard({ floor }: FloorCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>{floor.name}</h2>
        <FloorStatusBadge status={floor.status} />
      </div>
      <div className={styles.meta}>
        <span className={styles.stats}>{formatFloorStats(floor.tableCount, floor.seatCount)}</span>
      </div>
      <div className={styles.footer}>
        <span className={styles.updated}>{formatUpdatedLabel(floor.updatedAt)}</span>
        <FloorActionButtons floorId={floor.id} />
      </div>
    </article>
  );
}
