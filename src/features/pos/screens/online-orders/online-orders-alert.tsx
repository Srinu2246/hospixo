import { onlineOrdersAlert } from '@/features/pos/config/online-orders';

import styles from './online-orders-alert.module.css';

export function OnlineOrdersAlert() {
  return (
    <output className={styles.banner}>
      <span className={styles.badge}>{onlineOrdersAlert.badge}</span>
      <p className={styles.message}>{onlineOrdersAlert.message}</p>
    </output>
  );
}
