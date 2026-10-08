import { cashReconciliationPageMeta } from '@/features/pos/day-close/config/cash-reconciliation';

import styles from '@/features/pos/day-close/shared/page-header.module.css';

export function CashReconciliationHeader() {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{cashReconciliationPageMeta.title}</h1>
      <p className={styles.subtitle}>{cashReconciliationPageMeta.subtitle}</p>
    </header>
  );
}
