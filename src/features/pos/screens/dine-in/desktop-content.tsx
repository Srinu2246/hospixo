'use client';

import { PosOperationsShell } from '@/features/pos/screens/layout/pos-operations-shell';
import { DineInHeader } from '@/features/pos/screens/dine-in/dine-in-header';
import { DineInMenuPanel } from '@/features/pos/screens/dine-in/dine-in-menu-panel';
import { DineInOrderSummary } from '@/features/pos/screens/dine-in/dine-in-order-summary';

import type { DineInPageViewModel } from './use-dine-in-page';
import styles from './dine-in-page.module.css';

export function DineInDesktopContent({
  selectedTableId,
  tableNumber,
  tableLabel,
  orderNumber,
  activeCategory,
  setActiveCategory,
  customizingItemId,
  setCustomizingItemId,
  filteredMenuItems,
  menuQuantities,
  orderLines,
  subtotal,
  discount,
  total,
  handleMenuQuantityChange,
  handleCustomizeAdd,
  handleOrderQuantityChange,
  handleRemoveLine,
  handleSendToKot,
  goToTables,
}: Readonly<DineInPageViewModel>) {
  if (!selectedTableId) {
    return (
      <PosOperationsShell withPageBg>
        <div className={styles.emptyPage}>
          <p className={styles.emptyTitle}>No table selected</p>
          <p className={styles.emptyText}>
            Select a table from the Tables page to start a dine-in order.
          </p>
          <button type="button" className={styles.emptyBtn} onClick={goToTables}>
            Go to Tables
          </button>
        </div>
      </PosOperationsShell>
    );
  }

  return (
    <PosOperationsShell withPageBg>
      <div className={styles.page}>
        <DineInHeader tableNumber={tableNumber} />

        <div className={styles.workspace}>
          <DineInMenuPanel
            items={filteredMenuItems}
            activeCategory={activeCategory}
            quantities={menuQuantities}
            customizingItemId={customizingItemId}
            onCategoryChange={setActiveCategory}
            onQuantityChange={handleMenuQuantityChange}
            onCustomizeOpen={setCustomizingItemId}
            onCustomizeClose={() => setCustomizingItemId(null)}
            onCustomizeAdd={handleCustomizeAdd}
          />

          <DineInOrderSummary
            tableLabel={tableLabel.toUpperCase()}
            orderNumber={orderNumber}
            items={orderLines}
            subtotal={subtotal}
            discount={discount}
            total={total}
            onQuantityChange={handleOrderQuantityChange}
            onRemoveLine={handleRemoveLine}
            onSendToKot={handleSendToKot}
          />
        </div>
      </div>
    </PosOperationsShell>
  );
}
