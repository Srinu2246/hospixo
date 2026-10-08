import { floorDetailTabs } from '@/features/floor-table-setup/config';
import type { FloorDetailTabId } from '@/features/floor-table-setup/types/floor-table-setup';
import { cn } from '@/lib/utils';

import styles from './floor-detail-page.module.css';

type FloorDetailTabsProps = Readonly<{
  value: FloorDetailTabId;
  onChange: (tab: FloorDetailTabId) => void;
}>;

export function FloorDetailTabs({ value, onChange }: FloorDetailTabsProps) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="Floor details">
      {floorDetailTabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          className={cn(styles.tab, value === tab.id && styles.tabActive)}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
