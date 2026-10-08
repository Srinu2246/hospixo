import type { OnlineOrder } from '@/features/pos/config/online-orders';
import {
  formatOnlineOrderAmount,
  getOnlineOrderChannelLabel,
  getOnlineOrderPriorityLabel,
} from '@/features/pos/config/online-orders';
import { Check } from 'lucide-react';

import styles from './online-order-card.module.css';

const channelClass = {
  swiggy: styles.channelSwiggy,
  zomato: styles.channelZomato,
  website: styles.channelWebsite,
} as const;

const priorityClass = {
  new: styles.priorityNew,
  normal: styles.priorityNormal,
  high: styles.priorityHigh,
  ready: styles.priorityReady,
} as const;

interface OnlineOrderCardProps {
  order: OnlineOrder;
  onAccept?: (orderId: string) => void;
  onReject?: (orderId: string) => void;
  onMarkReady?: (orderId: string) => void;
}

export function OnlineOrderCard({
  order,
  onAccept,
  onReject,
  onMarkReady,
}: Readonly<OnlineOrderCardProps>) {
  return (
    <article className={styles.card}>
      <header className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <span className={`${styles.channel} ${channelClass[order.channel]}`}>
            {getOnlineOrderChannelLabel(order.channel)}
          </span>
          <span className={styles.orderMeta}>
            {order.orderNumber} · {order.timeLabel}
          </span>
        </div>
        <span className={`${styles.priority} ${priorityClass[order.priority]}`}>
          {getOnlineOrderPriorityLabel(order.priority)}
        </span>
      </header>

      <div className={styles.body}>
        <p className={styles.items}>{order.itemsSummary}</p>
        <div className={styles.priceRow}>
          {order.prepaid ? <span className={styles.prepaid}>Prepaid</span> : null}
          <strong className={styles.amount}>{formatOnlineOrderAmount(order.amount)}</strong>
        </div>
      </div>

      <footer className={styles.actions}>
        {order.actionState === 'pendingAccept' ? (
          <>
            <button type="button" className={styles.rejectBtn} onClick={() => onReject?.(order.id)}>
              Reject
            </button>
            <button type="button" className={styles.acceptBtn} onClick={() => onAccept?.(order.id)}>
              <Check size={16} aria-hidden />
              Accept
            </button>
          </>
        ) : null}

        {order.actionState === 'readyForPickup' ? (
          <button type="button" className={styles.readyBtn} onClick={() => onMarkReady?.(order.id)}>
            Ready for pickup
          </button>
        ) : null}

        {order.actionState === 'readyForPickupDone' ? (
          <button type="button" className={styles.readyBtnDone} disabled>
            Ready for pickup
          </button>
        ) : null}

        {order.actionState === 'pickedUp' ? (
          <p className={styles.pickedUp}>Picked up by partner</p>
        ) : null}
      </footer>
    </article>
  );
}
