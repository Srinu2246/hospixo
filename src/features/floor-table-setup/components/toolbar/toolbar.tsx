import { Plus, Search } from 'lucide-react';

import {
  floorSortOptions,
  floorStatusFilterOptions,
  floorTableSetupCopy,
} from '@/features/floor-table-setup/config';
import type {
  FloorSortId,
  FloorStatusFilter,
} from '@/features/floor-table-setup/types/floor-table-setup';

import styles from './toolbar.module.css';

type FloorToolbarProps = Readonly<{
  query: string;
  sort: FloorSortId;
  status: FloorStatusFilter;
  onQueryChange: (value: string) => void;
  onSortChange: (value: FloorSortId) => void;
  onStatusChange: (value: FloorStatusFilter) => void;
  onCreate: () => void;
  showStatus?: boolean;
}>;

export function FloorToolbar({
  query,
  sort,
  status,
  onQueryChange,
  onSortChange,
  onStatusChange,
  onCreate,
  showStatus = true,
}: FloorToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <label className={styles.search}>
        <Search className={styles.searchIcon} aria-hidden="true" />
        <input
          className={styles.input}
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={floorTableSetupCopy.searchPlaceholder}
        />
      </label>
      <div className={styles.filters}>
        <label className={styles.sort}>
          <span className={styles.sortLabel}>{floorTableSetupCopy.sortLabel}</span>
          <select
            className={styles.select}
            value={sort}
            aria-label={floorTableSetupCopy.sortLabel}
            onChange={(event) => onSortChange(event.target.value as FloorSortId)}
          >
            {floorSortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        {showStatus ? (
          <select
            className={styles.select}
            value={status}
            aria-label={floorTableSetupCopy.statusLabel}
            onChange={(event) => onStatusChange(event.target.value as FloorStatusFilter)}
          >
            {floorStatusFilterOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        ) : null}
        <button type="button" className={styles.create} onClick={onCreate}>
          <Plus className={styles.createIcon} aria-hidden="true" />
          {floorTableSetupCopy.createFloor}
        </button>
      </div>
    </div>
  );
}
