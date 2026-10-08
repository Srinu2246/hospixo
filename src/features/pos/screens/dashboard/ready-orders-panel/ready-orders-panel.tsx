import type { ReadyOrderItem, ReadyOrderStatus } from '@/features/pos/config/dashboard';
import { getReadyOrderStatusLabel } from '@/features/pos/config/dashboard';

import styles from './ready-orders-panel.module.css';

const statusClass: Record<ReadyOrderStatus, string> = {
  readyToServe: styles.readyToServe,
  waitingPickup: styles.waitingPickup,
  waitingDriver: styles.waitingDriver,
};

interface ReadyOrdersPanelProps {
  orders: ReadyOrderItem[];
}

export function ReadyOrdersPanel({ orders }: Readonly<ReadyOrdersPanelProps>) {
  return (
    <section className={styles.panel} aria-labelledby="ready-orders-title">
      <header className={styles.header}>
        <h2 id="ready-orders-title" className={styles.title}>
          Ready Orders
        </h2>
      </header>

      <ul className={styles.list}>
        {orders.map((order) => (
          <li key={order.id} className={styles.row}>
            <span className={styles.label}>{order.label}</span>
            <span className={`${styles.badge} ${statusClass[order.status]}`}>
              {getReadyOrderStatusLabel(order.status)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
