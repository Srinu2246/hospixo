import { closeBusinessDayPageMeta } from '@/features/pos/day-close/config/close-business-day';

import styles from '@/features/pos/day-close/shared/page-header.module.css';

export function CloseBusinessDayHeader() {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{closeBusinessDayPageMeta.title}</h1>
      <p className={styles.subtitle}>{closeBusinessDayPageMeta.subtitle}</p>
    </header>
  );
}
