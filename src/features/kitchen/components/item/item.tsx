import { kitchenDisplayCopy } from '@/features/kitchen/config';
import type { KitchenOrderItem } from '@/features/kitchen/types';

import styles from './item.module.css';

type KitchenItemProps = Readonly<{
  item: KitchenOrderItem;
}>;

export function KitchenItem({ item }: KitchenItemProps) {
  return (
    <li className={styles.item}>
      <div className={styles.row}>
        <span className={styles.name}>
          {item.name} <span className={styles.qty}>×{item.quantity}</span>
        </span>
        <span className={styles.tag}>{kitchenDisplayCopy.category[item.category]}</span>
      </div>
      {item.notes ? <p className={styles.notes}>{item.notes}</p> : null}
    </li>
  );
}
