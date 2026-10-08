'use client';

import { menuAvailabilityCopy } from '@/features/pos/menu-availability/config';
import { cn } from '@/lib/utils';
import type { MenuItem } from '@/features/pos/types/menu-availability';

import styles from './items.module.css';

type MenuItemsTableProps = Readonly<{
  items: readonly MenuItem[];
  onToggleItem: (itemId: string, available: boolean) => void;
}>;

export function MenuItemsTable({ items, onToggleItem }: MenuItemsTableProps) {
  const { columns, status, visibilityPrefix, emptyCategory } = menuAvailabilityCopy;

  return (
    <div className={styles.panel}>
      <div className={styles.head}>
        <span>{columns.name}</span>
        <span className={styles.markCol}>{columns.markAs}</span>
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>{emptyCategory}</p>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => {
            const available = item.status === 'available';
            return (
              <li key={item.id} className={styles.row}>
                <div className={styles.meta}>
                  <span
                    className={cn(styles.diet, item.diet === 'veg' ? styles.veg : styles.nonVeg)}
                    aria-hidden="true"
                  />
                  <div className={styles.info}>
                    <div className={styles.nameRow}>
                      <span className={styles.name}>{item.name}</span>
                      {item.tags.map((tag) => (
                        <span key={tag} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className={styles.visibility}>
                      {visibilityPrefix} {item.visibility}
                    </p>
                  </div>
                </div>

                <div className={styles.mark}>
                  <span
                    className={cn(
                      styles.status,
                      available ? styles.statusAvailable : styles.statusEightySixed,
                    )}
                  >
                    {available ? status.available : status.eightySixed}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={available}
                    aria-label={`Mark ${item.name} as ${available ? "86'd" : 'available'}`}
                    className={cn(styles.switch, available ? styles.switchOn : styles.switchOff)}
                    onClick={() => onToggleItem(item.id, !available)}
                  >
                    <span className={styles.knob} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
