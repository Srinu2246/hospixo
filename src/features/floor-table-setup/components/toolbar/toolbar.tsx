'use client';

import { Plus } from 'lucide-react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { FloorSetupSearchField } from '@/features/floor-table-setup/components/shared/floor-setup-search-field';
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
  /** Mobile/tablet layout — search and filters stack full width. */
  compact?: boolean;
  /** Hide create CTA (shown in page header instead). */
  hideCreateButton?: boolean;
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
  compact = false,
  hideCreateButton = false,
}: FloorToolbarProps) {
  const sortOptions = floorSortOptions.map((option) => ({
    value: option.id,
    label: option.label,
  }));

  const statusOptions = floorStatusFilterOptions.map((option) => ({
    value: option.id,
    label: option.label,
  }));

  if (compact) {
    return (
      <Stack spacing={2} sx={{ width: '100%' }}>
        <Box sx={{ width: '100%' }}>
          <FloorSetupSearchField
            value={query}
            onChange={onQueryChange}
            placeholder={floorTableSetupCopy.searchPlaceholder}
            className={styles.search}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
            width: '100%',
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            {floorTableSetupCopy.sortLabel}
          </Typography>
          <FloorSetupToolbarSelect
            fullWidth
            value={sort}
            aria-label={floorTableSetupCopy.sortLabel}
            onChange={(value) => onSortChange(value as FloorSortId)}
            options={sortOptions}
            sx={{ flex: 1, minWidth: 0 }}
          />
          {showStatus ? (
            <FloorSetupToolbarSelect
              fullWidth
              value={status}
              aria-label={floorTableSetupCopy.statusLabel}
              onChange={(value) => onStatusChange(value as FloorStatusFilter)}
              options={statusOptions}
              sx={{ flex: 1, minWidth: 0 }}
            />
          ) : null}
        </Box>
        {!hideCreateButton ? (
          <Button
            variant="contained"
            fullWidth
            startIcon={<Plus size={18} aria-hidden />}
            onClick={onCreate}
            sx={{ minHeight: 44 }}
          >
            {floorTableSetupCopy.createFloor}
          </Button>
        ) : null}
      </Stack>
    );
  }

  return (
    <div className={styles.toolbar}>
      <FloorSetupSearchField
        className={styles.search}
        value={query}
        onChange={onQueryChange}
        placeholder={floorTableSetupCopy.searchPlaceholder}
      />
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
