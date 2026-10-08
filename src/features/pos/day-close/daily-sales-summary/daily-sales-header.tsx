import { dailySalesSummaryPageMeta } from '@/features/pos/day-close/config/daily-sales-summary';

import styles from '@/features/pos/day-close/shared/page-header.module.css';

export function DailySalesHeader() {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{dailySalesSummaryPageMeta.title}</h1>
      <p className={styles.subtitle}>{dailySalesSummaryPageMeta.subtitle}</p>
    </header>
  );
}
