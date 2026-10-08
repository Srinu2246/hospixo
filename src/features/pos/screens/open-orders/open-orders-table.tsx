import type { OpenOrder } from '@/features/pos/config/open-orders';
import {
  formatOpenOrderAmount,
  formatOpenOrderTime,
  getOpenOrderTypeLabel,
  openOrderActions,
  openOrdersPageMeta,
  resolveOpenOrderAmount,
} from '@/features/pos/config/open-orders';
import {
  KitchenStatusPill,
  PaymentStatusPill,
} from '@/features/pos/screens/open-orders/open-order-status-pill';

import styles from './open-orders-table.module.css';

interface OpenOrdersTableProps {
  orders: OpenOrder[];
  onAddItems: (orderId: string) => void;
  onSettleBill: (orderId: string) => void;
}

export function OpenOrdersTable({
  orders,
  onAddItems,
  onSettleBill,
}: Readonly<OpenOrdersTableProps>) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Order #</th>
            <th scope="col">Type</th>
            <th scope="col">Reference</th>
            <th scope="col">Kitchen Status</th>
            <th scope="col">Payment</th>
            <th scope="col">{openOrdersPageMeta.tableTimeLabel}</th>
            <th scope="col">Amount</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className={styles.orderNumber}>{order.orderNumber}</td>
              <td>{getOpenOrderTypeLabel(order.type)}</td>
              <td>{order.reference}</td>
              <td>
                <KitchenStatusPill status={order.kitchenStatus} />
              </td>
              <td>
                <PaymentStatusPill status={order.paymentStatus} />
              </td>
              <td>{formatOpenOrderTime(order.age)}</td>
              <td className={styles.amount}>
                {formatOpenOrderAmount(resolveOpenOrderAmount(order))}
              </td>
              <td>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.viewBtn}
                    onClick={() => onAddItems(order.id)}
                  >
                    {openOrderActions.addItems}
                  </button>
                  <button
                    type="button"
                    className={styles.settleBtn}
                    onClick={() => onSettleBill(order.id)}
                  >
                    {openOrderActions.settle}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
