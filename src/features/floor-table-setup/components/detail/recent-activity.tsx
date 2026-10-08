import { floorTableSetupCopy } from '@/features/floor-table-setup/config';
import { formatRelativeUpdated } from '@/features/floor-table-setup/lib';
import type { FloorActivity } from '@/features/floor-table-setup/types/floor-table-setup';

import styles from './floor-detail-page.module.css';

type RecentActivityProps = Readonly<{
  items: readonly FloorActivity[];
  onViewAll?: () => void;
}>;

export function RecentActivity({ items, onViewAll }: RecentActivityProps) {
  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>{floorTableSetupCopy.recentActivity}</h2>
        {onViewAll ? (
          <button type="button" className={styles.viewAll} onClick={onViewAll}>
            {floorTableSetupCopy.viewAll}
          </button>
        ) : null}
      </div>
      <div className={styles.activity}>
        {items.map((item) => (
          <div key={item.id} className={styles.activityItem}>
            <p className={styles.activityMessage}>{item.message}</p>
            <span className={styles.activityTime}>{formatRelativeUpdated(item.occurredAt)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
