import { Utensils } from 'lucide-react';

import type { ReadyOrder } from '@/features/pos/config/ready-list';

import styles from './ready-order-card.module.css';

interface ReadyOrderCardProps {
  order: ReadyOrder;
  onServe: (orderId: string) => void;
}

export function ReadyOrderCard({ order, onServe }: Readonly<ReadyOrderCardProps>) {
  return (
    <article className={styles.card}>
      <div className={styles.headingRow}>
        <h2 className={styles.table}>
          <Utensils size={15} aria-hidden />
          {order.table}
        </h2>
        <span className={styles.readyTime}>Ready {order.readyAgo}</span>
      </div>

      <div className={styles.metaRow}>
        <span>Token {order.token}</span>
        <span className={`${styles.priority} ${styles[order.priority]}`}>
          {order.priority.toUpperCase()}
        </span>
      </div>

      <div className={styles.statusRow}>
        <strong>{order.itemCount} Items</strong>
        <span className={styles.readyStatus}>
          <i aria-hidden="true" />
          {'Ready'}
        </span>
      </div>

      <div className={styles.summaryRow}>
        <q>{order.itemSummary}</q>
        <span className={`${styles.payment} ${styles[order.payment]}`}>
          {order.payment.toUpperCase()}
        </span>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.secondaryButton}>
          View Order
        </button>
        <button type="button" className={styles.primaryButton} onClick={() => onServe(order.id)}>
          Serve
        </button>
      </div>
    </article>
  );
}
