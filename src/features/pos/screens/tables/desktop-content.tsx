'use client';

import Alert from '@mui/material/Alert';
import { Search } from 'lucide-react';

import { normalizeTableId, posTableStatusLegend } from '@/features/pos/config/tables';
import { PosOperationsShell } from '@/features/pos/screens/layout/pos-operations-shell';
import { StatusLegend } from '@/features/pos/screens/shared/status-pill';
import { SelectedTableBar } from '@/features/pos/screens/tables/selected-table-bar';
import { TableCard } from '@/features/pos/screens/tables/table-card';
import { TableFilters } from '@/features/pos/screens/tables/table-filters';
import { TableFloorTabs } from '@/features/pos/screens/tables/table-floor-tabs';
import type { TablesPageViewModel } from './use-tables-page';
import styles from './tables-page.module.css';

export function TablesDesktopContent({
  activeFloorId,
  setActiveFloorId,
  activeFilter,
  setActiveFilter,
  searchQuery,
  setSearchQuery,
  visibleTables,
  posFloors,
  selectedTable,
  selectedTableId,
  handleDesktopTableSelect,
  isError,
  loadError,
  isFetching,
  hasAnyTables,
}: Readonly<TablesPageViewModel>) {
  const emptyMessage = loadError
    ? loadError
    : !hasAnyTables
      ? 'No tables configured for this branch. Add tables in Floor & Table Setup.'
      : 'No tables match your filters.';

  return (
    <PosOperationsShell withPageBg>
      <div className={`${styles.page} ${selectedTable ? styles.pageWithBar : ''}`}>
        {isError || loadError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {loadError ?? 'Unable to load tables.'}
          </Alert>
        ) : null}
        <header className={styles.pageHeader}>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>Tables</h1>
            <TableFloorTabs
              floors={posFloors}
              activeFloorId={activeFloorId}
              onChange={setActiveFloorId}
            />
          </div>

          <label className={styles.search}>
            <Search size={18} className={styles.searchIcon} aria-hidden />
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Find a table..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </label>
        </header>

        <div className={styles.toolbar}>
          <TableFilters activeFilter={activeFilter} onChange={setActiveFilter} />
          <StatusLegend items={posTableStatusLegend} />
        </div>

        <section className={styles.grid} aria-label="Restaurant tables">
          {visibleTables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              selected={normalizeTableId(table.id) === normalizeTableId(selectedTableId)}
              onSelect={handleDesktopTableSelect}
            />
          ))}
        </section>

        {!isFetching && visibleTables.length === 0 ? (
          <p className={styles.emptyState}>{emptyMessage}</p>
        ) : null}

        <SelectedTableBar table={selectedTable} />
      </div>
    </PosOperationsShell>
  );
}
