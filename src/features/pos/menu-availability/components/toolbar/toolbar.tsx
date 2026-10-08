'use client';

import { Search } from 'lucide-react';

import { menuAvailabilityCopy } from '@/features/pos/menu-availability/config';

import styles from './toolbar.module.css';

type MenuToolbarProps = Readonly<{
  query: string;
  onQueryChange: (value: string) => void;
}>;

export function MenuToolbar({ query, onQueryChange }: MenuToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <label className={styles.search}>
        <Search className={styles.searchIcon} aria-hidden="true" />
        <input
          className={styles.input}
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={menuAvailabilityCopy.searchPlaceholder}
        />
      </label>
      <div className={styles.actions}>
        <button type="button" className={styles.btn}>
          {menuAvailabilityCopy.quickSection}
        </button>
        <button type="button" className={styles.btn}>
          {menuAvailabilityCopy.addonOn}
        </button>
        <button type="button" className={styles.btn}>
          {menuAvailabilityCopy.storeOn}
        </button>
      </div>
    </div>
  );
}
