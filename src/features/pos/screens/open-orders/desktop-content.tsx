'use client';

import type { OpenOrderType } from '@/features/pos/config/open-orders';
import { PosOperationsShell } from '@/features/pos/screens/layout/pos-operations-shell';
import { OpenOrdersFilters } from '@/features/pos/screens/open-orders/open-orders-filters';
import { OpenOrdersFooter } from '@/features/pos/screens/open-orders/open-orders-footer';
import { OpenOrdersHeader } from '@/features/pos/screens/open-orders/open-orders-header';
import { OpenOrdersTable } from '@/features/pos/screens/open-orders/open-orders-table';

import type { OpenOrdersPageViewModel } from './use-open-orders-page';
import styles from './open-orders-page.module.css';

export function OpenOrdersDesktopContent({
  activeType,
  setActiveType,
  searchQuery,
  setSearchQuery,
  visibleOrders,
  handleAddItems,
  handleSettleBill,
}: Readonly<OpenOrdersPageViewModel>) {
  function handleTypeChange(type: OpenOrderType) {
    setActiveType(type);
  }

  return (
    <PosOperationsShell withPageBg>
      <div className={styles.page}>
        <OpenOrdersHeader
          activeType={activeType}
          searchQuery={searchQuery}
          onTypeChange={handleTypeChange}
          onSearchChange={setSearchQuery}
        />

        <OpenOrdersFilters activeType={activeType} onChange={handleTypeChange} />

        <OpenOrdersTable
          orders={visibleOrders}
          onAddItems={handleAddItems}
          onSettleBill={handleSettleBill}
        />

        {visibleOrders.length === 0 ? (
          <p className={styles.empty}>No open orders match your filters.</p>
        ) : null}

        <OpenOrdersFooter />
      </div>
    </PosOperationsShell>
  );
}
