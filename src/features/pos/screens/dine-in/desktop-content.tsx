'use client';

import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';

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
  isMenuLoading,
  isMenuError,
  menuError,
  menuIsEmpty,
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

        <Stack spacing={2} sx={{ mb: 2 }}>
          {isMenuLoading ? <CircularProgress size={24} aria-label="Loading menu" /> : null}
          {isMenuError || menuError ? <Alert severity="error">{menuError}</Alert> : null}
          {menuIsEmpty && !isMenuLoading && !menuError ? (
            <Alert severity="info">No menu items are available for this branch.</Alert>
          ) : null}
        </Stack>

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
