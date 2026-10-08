'use client';

import { menuAvailabilityCopy } from '@/features/pos/menu-availability/config';
import { cn } from '@/lib/utils';
import type { MenuSurfaceTab } from '@/features/pos/types/menu-availability';

import styles from './tabs.module.css';

type MenuSurfaceTabsProps = Readonly<{
  value: MenuSurfaceTab;
  onChange: (tab: MenuSurfaceTab) => void;
}>;

const TABS: MenuSurfaceTab[] = ['all', 'online', 'dinein_qr'];

export function MenuSurfaceTabs({ value, onChange }: MenuSurfaceTabsProps) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="Menu surfaces">
      {TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={value === tab}
          className={cn(styles.tab, value === tab && styles.tabActive)}
          onClick={() => onChange(tab)}
        >
          {menuAvailabilityCopy.tabs[tab]}
        </button>
      ))}
    </div>
  );
}
