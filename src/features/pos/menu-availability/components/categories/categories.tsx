'use client';

import { cn } from '@/lib/utils';
import type { MenuCategory } from '@/features/pos/types/menu-availability';

import styles from './categories.module.css';

type MenuCategoriesProps = Readonly<{
  categories: readonly MenuCategory[];
  activeCategoryId: string | null;
  itemCounts: Record<string, number>;
  enabledByCategory: Record<string, boolean>;
  onSelect: (categoryId: string) => void;
  onToggle: (categoryId: string, enabled: boolean) => void;
}>;

export function MenuCategories({
  categories,
  activeCategoryId,
  itemCounts,
  enabledByCategory,
  onSelect,
  onToggle,
}: MenuCategoriesProps) {
  return (
    <aside className={styles.panel} aria-label="Menu categories">
      <ul className={styles.list}>
        {categories.map((category) => {
          const active = category.id === activeCategoryId;
          const enabled = enabledByCategory[category.id] ?? category.enabled;
          const count = itemCounts[category.id] ?? 0;

          return (
            <li key={category.id}>
              <div className={cn(styles.row, active && styles.rowActive)}>
                <button
                  type="button"
                  className={styles.labelBtn}
                  onClick={() => onSelect(category.id)}
                >
                  <span className={styles.label}>{category.label}</span>
                  <span className={styles.count}>[{count}]</span>
                </button>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  aria-label={`${category.label} category ${enabled ? 'on' : 'off'}`}
                  className={cn(styles.switch, enabled ? styles.switchOn : styles.switchOff)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle(category.id, !enabled);
                  }}
                >
                  <span className={styles.knob} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
