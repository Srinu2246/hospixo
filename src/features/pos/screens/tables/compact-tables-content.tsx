'use client';

import { Plus } from 'lucide-react';

import { normalizeTableId } from '@/features/pos/config/tables';
import { posMobileOutlet } from '@/features/pos/config/nav-mobile';
import {
  PosCompactBody,
  PosCompactHeader,
  PosCompactHeaderChrome,
  PosCompactPage,
  PosCompactSearch,
} from '@/features/pos/screens/layout/pos-compact-page';
import compactPageStyles from '@/features/pos/screens/layout/pos-compact-page.module.css';
import { PosMobileHeader } from '@/features/pos/screens/layout/pos-mobile-header';
import { PosMobileShell } from '@/features/pos/screens/layout/pos-mobile-shell';
import { CompactTableCard } from '@/features/pos/screens/tables/compact-table-card';

import type { TablesPageViewModel } from './use-tables-page';
import styles from './compact-tables-content.module.css';

interface CompactTablesContentProps extends TablesPageViewModel {
  layout: 'mobile' | 'tablet';
}

export function CompactTablesContent({
  layout,
  activeFloorId,
  setActiveFloorId,
  searchQuery,
  setSearchQuery,
  visibleTables,
  posFloors,
  selectedTable,
  selectedTableId,
  handleCompactTableSelect,
  handleOrderMenu,
}: Readonly<CompactTablesContentProps>) {
  return (
    <PosMobileShell activeNavId="tables" hasStickyBar={Boolean(selectedTable)} withPageBg>
      <PosCompactPage>
        <PosCompactHeader>
          <PosMobileHeader title="Hospixo Tables" subtitle={posMobileOutlet.name} />
          <PosCompactHeaderChrome>
            <div className={compactPageStyles.pillRow} role="tablist" aria-label="Floor selection">
              {posFloors.map((floor) => {
                const active = floor.id === activeFloorId;

                return (
                  <button
                    key={floor.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    className={`${compactPageStyles.pill} ${
                      active ? compactPageStyles.pillActive : ''
                    }`}
                    onClick={() => setActiveFloorId(floor.id)}
                  >
                    {floor.label}
                  </button>
                );
              })}
            </div>
          </PosCompactHeaderChrome>
        </PosCompactHeader>

        <PosCompactBody className={styles.body}>
          <PosCompactSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search table name..."
          />

          <section
            className={`${styles.grid} ${
              layout === 'tablet' ? styles.gridTablet : styles.gridMobile
            }`}
            aria-label="Restaurant tables"
          >
            {visibleTables.map((table) => (
              <CompactTableCard
                key={table.id}
                table={table}
                selected={normalizeTableId(table.id) === normalizeTableId(selectedTableId)}
                onSelect={handleCompactTableSelect}
              />
            ))}
          </section>

          {visibleTables.length === 0 ? (
            <p className={styles.emptyState}>No tables match your search.</p>
          ) : null}
        </PosCompactBody>
      </PosCompactPage>

      {selectedTable ? (
        <section className={styles.selectedBar} aria-label="Selected table actions">
          <div className={styles.selectedMeta}>
            <span className={styles.selectedLabel}>Selected table</span>
            <span className={styles.selectedValue}>{selectedTable.label}</span>
          </div>
          <button type="button" className={styles.orderBtn} onClick={handleOrderMenu}>
            <Plus size={16} aria-hidden />
            Order Menu
          </button>
        </section>
      ) : null}
    </PosMobileShell>
  );
}
