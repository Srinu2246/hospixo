'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Minus, Plus } from 'lucide-react';

import {
  dineInActions,
  dineInMenuCategories,
  dineInPageMeta,
  formatDineInRupee,
} from '@/features/pos/config/dine-in';
import { posOrderNotifications } from '@/features/pos/config/order-actions';
import { PosMobileHeader } from '@/features/pos/screens/layout/pos-mobile-header';
import {
  PosCompactBody,
  PosCompactHeader,
  PosCompactHeaderChrome,
  PosCompactPage,
  PosCompactSearch,
} from '@/features/pos/screens/layout/pos-compact-page';
import compactPageStyles from '@/features/pos/screens/layout/pos-compact-page.module.css';
import { PosMobileShell } from '@/features/pos/screens/layout/pos-mobile-shell';
import { DineInCustomizeSheet } from '@/features/pos/screens/dine-in/dine-in-customize-sheet';

import type { DineInPageViewModel } from './use-dine-in-page';
import styles from './compact-dine-in-content.module.css';

interface CompactDineInContentProps extends DineInPageViewModel {
  layout: 'mobile' | 'tablet';
}

function KotSentToast() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 4000);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className={styles.kotToast} role="status" aria-live="polite">
      <strong>{posOrderNotifications.kotSentTitle}</strong>
      {posOrderNotifications.kotSentBody}
    </div>
  );
}

export function CompactDineInContent({
  layout,
  selectedTableId,
  tableLabel,
  activeCategory,
  setActiveCategory,
  customizingItemId,
  setCustomizingItemId,
  searchQuery,
  setSearchQuery,
  menuItems,
  filteredMenuItems,
  menuQuantities,
  itemCount,
  subtotal,
  handleMenuQuantityChange,
  handleCustomizeAdd,
  handleSendToKot,
  goToTables,
  kotSentNotice,
}: Readonly<CompactDineInContentProps>) {
  const customizingItem = customizingItemId
    ? (menuItems.find((item) => item.id === customizingItemId) ?? null)
    : null;

  if (!selectedTableId) {
    return (
      <PosMobileShell activeNavId="menu" withPageBg>
        <div className={styles.emptyPage}>
          <p className={styles.emptyTitle}>No table selected</p>
          <p className={styles.emptyText}>Select a table to start ordering.</p>
          <button type="button" className={styles.emptyBtn} onClick={goToTables}>
            Go to Tables
          </button>
        </div>
      </PosMobileShell>
    );
  }

  const subtitle = `Table ${tableLabel}`;

  function handleIncrease(itemId: string) {
    setCustomizingItemId(itemId);
  }

  function handleDecrease(itemId: string) {
    const current = menuQuantities[itemId] ?? 0;
    if (current > 0) handleMenuQuantityChange(itemId, current - 1);
  }

  const listContent = filteredMenuItems.map((item) => {
    const qty = menuQuantities[item.id] ?? 0;
    return (
      <li key={item.id} className={styles.itemCard}>
        <Image src={item.imageUrl} alt="" width={56} height={56} className={styles.thumb} />
        <div className={styles.itemBody}>
          <p className={styles.itemName}>{item.name}</p>
          <p className={styles.itemPrice}>{formatDineInRupee(item.price * Math.max(qty, 1))}</p>
        </div>
        {qty > 0 ? (
          <div className={styles.qtyControl} aria-label={`Quantity for ${item.name}`}>
            <button
              type="button"
              className={styles.qtyBtn}
              aria-label={`Decrease ${item.name}`}
              onClick={() => handleDecrease(item.id)}
            >
              <Minus size={14} />
            </button>
            <span className={styles.qtyValue}>{qty}</span>
            <button
              type="button"
              className={styles.qtyBtn}
              aria-label={`Increase ${item.name}`}
              onClick={() => handleIncrease(item.id)}
            >
              <Plus size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={styles.addBtn}
            aria-label={`Add ${item.name}`}
            onClick={() => handleIncrease(item.id)}
          >
            Add
          </button>
        )}
      </li>
    );
  });

  return (
    <PosMobileShell activeNavId="menu" hasStickyBar={itemCount > 0} withPageBg>
      {kotSentNotice ? <KotSentToast key={kotSentNotice} /> : null}

      <PosCompactPage>
        <PosCompactHeader>
          <PosMobileHeader title={dineInPageMeta.mobileMenuTitle} subtitle={subtitle} />
          <PosCompactHeaderChrome>
            <div className={compactPageStyles.pillRow} role="tablist" aria-label="Menu categories">
              {dineInMenuCategories.map((category) => {
                const active = category.id === activeCategory;
                return (
                  <button
                    key={category.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    className={`${compactPageStyles.pill} ${
                      active ? compactPageStyles.pillActive : ''
                    }`}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.label}
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
            placeholder="Search food items, drinks, code..."
          />
          {layout === 'tablet' ? (
            <ul className={`${styles.itemList} ${styles.gridTablet}`}>{listContent}</ul>
          ) : (
            <ul className={styles.itemList}>{listContent}</ul>
          )}
        </PosCompactBody>
      </PosCompactPage>

      {itemCount > 0 ? (
        <div className={styles.orderBar} aria-label="Order summary">
          <div className={styles.orderMeta}>
            <span className={styles.orderCount}>{itemCount} Items Selected</span>
            <span className={styles.orderSubtotal}>Subtotal: {formatDineInRupee(subtotal)}</span>
          </div>
          <button type="button" className={styles.sendKotBtn} onClick={handleSendToKot}>
            {dineInActions.sendToKot}
            <ArrowRight size={16} aria-hidden />
          </button>
        </div>
      ) : null}

      {customizingItem ? (
        <>
          <button
            type="button"
            className={styles.sheetBackdrop}
            aria-label="Close customization"
            onClick={() => setCustomizingItemId(null)}
          />
          <dialog open className={styles.sheet} aria-label={`Customize ${customizingItem.name}`}>
            <div className={styles.sheetHandle} aria-hidden />
            <DineInCustomizeSheet
              key={customizingItem.id}
              item={customizingItem}
              onAdd={(customization) => handleCustomizeAdd(customizingItem.id, customization)}
              onClose={() => setCustomizingItemId(null)}
            />
          </dialog>
        </>
      ) : null}
    </PosMobileShell>
  );
}
