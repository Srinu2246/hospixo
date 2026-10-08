import type { LiveOrderRow, LiveOrderStatus } from '@/features/pos/config/dashboard';
import { getLiveOrderActionLabel, getLiveOrderStatusLabel } from '@/features/pos/config/dashboard';

import styles from './live-order-queue.module.css';

const statusClass: Record<LiveOrderStatus, string> = {
  preparing: styles.preparing,
  ready: styles.ready,
  billing: styles.billing,
};

interface LiveOrderQueueProps {
  orders: LiveOrderRow[];
}

export function LiveOrderQueue({ orders }: Readonly<LiveOrderQueueProps>) {
  return (
    <section className={styles.panel} aria-labelledby="live-order-queue-title">
      <header className={styles.header}>
        <h2 id="live-order-queue-title" className={styles.title}>
          Live Order Queue
        </h2>
      </header>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Order #</th>
              <th scope="col">Table</th>
              <th scope="col">Customer Name</th>
              <th scope="col">Status</th>
              <th scope="col">Time</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className={styles.orderNumber}>{order.orderNumber}</td>
                <td>{order.table}</td>
                <td>{order.customerName}</td>
                <td>
                  <span className={`${styles.statusPill} ${statusClass[order.status]}`}>
                    {getLiveOrderStatusLabel(order.status)}
                  </span>
                </td>
                <td className={styles.time}>{order.time}</td>
                <td>
                  <button type="button" className={styles.actionBtn}>
                    {getLiveOrderActionLabel(order.action)}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
