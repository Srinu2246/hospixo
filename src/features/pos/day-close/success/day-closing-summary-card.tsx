import { Printer } from 'lucide-react';

import {
  dayClosingSummaryLabels,
  dayClosingSummaryMeta,
  dayClosingSummaryStats,
} from '@/features/pos/day-close/config/success';

import styles from './day-closing-summary-card.module.css';

export function DayClosingSummaryCard() {
  return (
    <section className={styles.card} aria-labelledby="day-closing-summary-heading">
      <div className={styles.cardHeader}>
        <h2 id="day-closing-summary-heading" className={styles.title}>
          {dayClosingSummaryMeta.title}
        </h2>
        <span className={styles.balancedTag}>{dayClosingSummaryMeta.balancedLabel}</span>
      </div>

      <dl className={styles.statsGrid}>
        <div className={styles.statItem}>
          <dt className={styles.statLabel}>{dayClosingSummaryLabels.closedBy}</dt>
          <dd className={styles.statValue}>{dayClosingSummaryStats.closedBy}</dd>
        </div>
        <div className={styles.statItem}>
          <dt className={styles.statLabel}>{dayClosingSummaryLabels.totalRevenue}</dt>
          <dd className={styles.statValue}>{dayClosingSummaryStats.totalRevenue}</dd>
        </div>
        <div className={styles.statItem}>
          <dt className={styles.statLabel}>{dayClosingSummaryLabels.orders}</dt>
          <dd className={styles.statValue}>{dayClosingSummaryStats.orders}</dd>
        </div>
        <div className={styles.statItem}>
          <dt className={styles.statLabel}>{dayClosingSummaryLabels.shiftsOperated}</dt>
          <dd className={styles.statValue}>{dayClosingSummaryStats.shiftsOperated}</dd>
        </div>
        <div className={styles.statItem}>
          <dt className={styles.statLabel}>{dayClosingSummaryLabels.cashDifference}</dt>
          <dd className={styles.statValue}>{dayClosingSummaryStats.cashDifference}</dd>
        </div>
        <div className={styles.statItem}>
          <dt className={styles.statLabel}>{dayClosingSummaryLabels.upiDigital}</dt>
          <dd className={styles.statValue}>{dayClosingSummaryStats.upiDigital}</dd>
        </div>
      </dl>

      <div className={styles.archiveBanner}>
        <Printer size={16} aria-hidden />
        <span>{dayClosingSummaryMeta.archiveNote}</span>
      </div>
    </section>
  );
}
