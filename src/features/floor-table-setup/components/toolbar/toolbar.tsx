'use client';

import { Plus, Search } from 'lucide-react';

import { FloorSetupToolbarSelect } from '@/features/floor-table-setup/components/shared/floor-setup-toolbar-select';
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
  const sortOptions = floorSortOptions.map((option) => ({
    value: option.id,
    label: option.label,
  }));

  const statusOptions = floorStatusFilterOptions.map((option) => ({
    value: option.id,
    label: option.label,
  }));

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
        <div className={styles.sort}>
          <span className={styles.sortLabel}>{floorTableSetupCopy.sortLabel}</span>
          <FloorSetupToolbarSelect
            value={sort}
            aria-label={floorTableSetupCopy.sortLabel}
            onChange={(value) => onSortChange(value as FloorSortId)}
            options={sortOptions}
          />
        </div>
        {showStatus ? (
          <FloorSetupToolbarSelect
            value={status}
            aria-label={floorTableSetupCopy.statusLabel}
            onChange={(value) => onStatusChange(value as FloorStatusFilter)}
            options={statusOptions}
          />
        ) : null}
        <button type="button" className={styles.create} onClick={onCreate}>
          <Plus className={styles.createIcon} aria-hidden="true" />
          {floorTableSetupCopy.createFloor}
        </button>
      </div>
    </div>
  );
}
