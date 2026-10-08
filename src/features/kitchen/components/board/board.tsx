import { KitchenColumn } from '@/features/kitchen/components/column';
import { KdsBoard } from '@/features/kitchen/components/kds';
import { kitchenDisplayCopy } from '@/features/kitchen/config';
import type { KitchenOrder } from '@/features/kitchen/types';

import styles from './board.module.css';

type KitchenBoardProps = Readonly<{
  orders: readonly KitchenOrder[];
  onStartPreparing?: (orderId: string) => void;
  onRecall?: (orderId: string) => void;
  onMarkReady?: (orderId: string) => void;
  onServed?: (orderId: string) => void;
}>;

export function KitchenBoard({
  orders,
  onStartPreparing,
  onRecall,
  onMarkReady,
  onServed,
}: KitchenBoardProps) {
  return (
    <KdsBoard
      styles={styles}
      orders={orders}
      emptyBoardLabel={kitchenDisplayCopy.emptyBoard}
      renderColumn={({ status, orders: columnOrders }) => (
        <KitchenColumn
          key={status}
          status={status}
          orders={columnOrders}
          onStartPreparing={onStartPreparing}
          onRecall={onRecall}
          onMarkReady={onMarkReady}
          onServed={onServed}
        />
      )}
    />
  );
}
