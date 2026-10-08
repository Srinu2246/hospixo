import { onlineOrdersFooter } from '@/features/pos/config/online-orders';

import styles from './online-orders-footer.module.css';

export function OnlineOrdersFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.left}>
        <span className={styles.statusItem}>
          <span className={styles.dot} aria-hidden />
          {onlineOrdersFooter.printerStatus}
        </span>
        <span className={styles.statusItem}>
          <span className={styles.dot} aria-hidden />
          {onlineOrdersFooter.syncStatus}
        </span>
      </div>
      <p className={styles.prepTime}>{onlineOrdersFooter.avgPrepTime}</p>
    </footer>
  );
}
