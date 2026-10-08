import {
  closeBusinessDayCardTitles,
  closeBusinessDayCurrentDay,
  closeBusinessDayStatLabels,
} from '@/features/pos/day-close/config/close-business-day';

import styles from './current-day-info-card.module.css';

export function CurrentDayInfoCard() {
  return (
    <section className={styles.card} aria-labelledby="current-day-info-heading">
      <h2 id="current-day-info-heading" className={styles.cardTitle}>
        {closeBusinessDayCardTitles.currentDay}
      </h2>

      <dl className={styles.statsGrid}>
        <div className={styles.statItem}>
          <dt className={styles.statLabel}>{closeBusinessDayStatLabels.businessDate}</dt>
          <dd className={styles.statValue}>{closeBusinessDayCurrentDay.businessDate}</dd>
        </div>
        <div className={styles.statItem}>
          <dt className={styles.statLabel}>{closeBusinessDayStatLabels.totalShifts}</dt>
          <dd className={styles.statValue}>{closeBusinessDayCurrentDay.totalShifts}</dd>
        </div>
        <div className={styles.statItem}>
          <dt className={styles.statLabel}>{closeBusinessDayStatLabels.totalHours}</dt>
          <dd className={styles.statValue}>{closeBusinessDayCurrentDay.totalHours}</dd>
        </div>
      </dl>
    </section>
  );
}
