import type { ReactNode } from 'react';

import { filterOrdersByStatus } from '@/features/kitchen/lib/kds/stats';
import type { KdsColumnCounts, KdsOrder, KdsOrderStatus } from '@/types/kds';

const STATUSES = ['new', 'preparing', 'ready'] as const;

type KdsBoardProps = Readonly<{
  styles: Readonly<Record<string, string>>;
  orders: readonly KdsOrder[];
  emptyBoardLabel: string;
  columnCounts?: KdsColumnCounts;
  renderColumn: (args: {
    status: KdsOrderStatus;
    orders: readonly KdsOrder[];
    count: number;
  }) => ReactNode;
}>;

export function KdsBoard({
  styles,
  orders,
  emptyBoardLabel,
  columnCounts,
  renderColumn,
}: KdsBoardProps) {
  return (
    <div className={styles.wrap}>
      {orders.length === 0 ? <p className={styles.emptyBoard}>{emptyBoardLabel}</p> : null}

      <div className={styles.grid}>
        {STATUSES.map((status) => {
          const columnOrders = filterOrdersByStatus(orders, status);
          return renderColumn({
            status,
            orders: columnOrders,
            count: columnCounts?.[status] ?? columnOrders.length,
          });
        })}
      </div>
    </div>
  );
}
