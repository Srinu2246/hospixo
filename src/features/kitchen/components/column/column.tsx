import { KitchenCard } from '@/features/kitchen/components/card';
import { KdsColumn } from '@/features/kitchen/components/kds';
import { kitchenDisplayCopy } from '@/features/kitchen/config';
import type { KitchenOrder, KitchenOrderStatus } from '@/features/kitchen/types';

import styles from './column.module.css';

type KitchenColumnProps = Readonly<{
  status: KitchenOrderStatus;
  orders: readonly KitchenOrder[];
  onStartPreparing?: (orderId: string) => void;
  onRecall?: (orderId: string) => void;
  onMarkReady?: (orderId: string) => void;
  onServed?: (orderId: string) => void;
}>;

export function KitchenColumn({
  status,
  orders,
  onStartPreparing,
  onRecall,
  onMarkReady,
  onServed,
}: KitchenColumnProps) {
  return (
    <KdsColumn
      styles={styles}
      status={status}
      title={kitchenDisplayCopy.columns[status]}
      emptyLabel={kitchenDisplayCopy.emptyColumn}
      orders={orders}
      idPrefix="kds-col"
      renderCard={(order) => (
        <KitchenCard
          key={order.id}
          order={order}
          onStartPreparing={onStartPreparing}
          onRecall={onRecall}
          onMarkReady={onMarkReady}
          onServed={onServed}
        />
      )}
    />
  );
}
