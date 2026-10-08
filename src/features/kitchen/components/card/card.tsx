'use client';

import { KitchenItem } from '@/features/kitchen/components/item';
import { KdsOrderActions } from '@/features/kitchen/components/kds';
import { kitchenDisplayCopy } from '@/features/kitchen/config';
import { cn } from '@/lib/utils';
import type { KitchenOrder, KitchenOrderStatus } from '@/features/kitchen/types';

import styles from './card.module.css';

type KitchenCardProps = Readonly<{
  order: KitchenOrder;
  onStartPreparing?: (orderId: string) => void;
  onRecall?: (orderId: string) => void;
  onMarkReady?: (orderId: string) => void;
  onServed?: (orderId: string) => void;
}>;

function destinationLabel(order: KitchenOrder) {
  if (order.channel === 'dine_in' && order.tableLabel) return order.tableLabel;
  return kitchenDisplayCopy.channel[order.channel];
}

function accentClass(status: KitchenOrderStatus) {
  if (status === 'new') return styles.accentNew;
  if (status === 'preparing') return styles.accentPreparing;
  return styles.accentReady;
}

export function KitchenCard({
  order,
  onStartPreparing,
  onRecall,
  onMarkReady,
  onServed,
}: KitchenCardProps) {
  const { actions, priority } = kitchenDisplayCopy;

  return (
    <article className={cn(styles.card, accentClass(order.status))} data-status={order.status}>
      <header className={styles.header}>
        <div className={styles.meta}>
          <h3 className={styles.number}>#{order.number}</h3>
          <span className={styles.destination}>{destinationLabel(order)}</span>
        </div>
        <span
          className={cn(
            styles.priority,
            order.priority === 'high' ? styles.priorityHigh : styles.priorityNormal,
          )}
        >
          {priority[order.priority]}
        </span>
      </header>

      {order.elapsedLabel ? <p className={styles.elapsed}>{order.elapsedLabel}</p> : null}

      <ul className={styles.items}>
        {order.items.map((item) => (
          <KitchenItem key={item.id} item={item} />
        ))}
      </ul>

      <footer className={styles.actions}>
        <KdsOrderActions
          styles={styles}
          copy={actions}
          status={order.status}
          orderId={order.id}
          onStartPreparing={onStartPreparing}
          onRecall={onRecall}
          onMarkReady={onMarkReady}
          onServed={onServed}
        />
      </footer>
    </article>
  );
}
