import Image from 'next/image';

import type {
  DineInMenuCategoryId,
  DineInMenuItem,
  MenuItemCustomization,
} from '@/features/pos/config/dine-in';
import {
  dineInMenuCategories,
  dineInPageMeta,
  formatDineInRupee,
} from '@/features/pos/config/dine-in';
import { DineInCustomizePanel } from '@/features/pos/screens/dine-in/dine-in-customize-panel';
import { CreditCard, Minus, Plus, Search, ShoppingBag } from 'lucide-react';

import styles from './dine-in-menu-panel.module.css';

interface DineInMenuPanelProps {
  items: DineInMenuItem[];
  activeCategory: DineInMenuCategoryId;
  quantities: Record<string, number>;
  customizingItemId: string | null;
  onCategoryChange: (category: DineInMenuCategoryId) => void;
  onQuantityChange: (menuItemId: string, quantity: number) => void;
  onCustomizeOpen: (menuItemId: string) => void;
  onCustomizeClose: () => void;
  onCustomizeAdd: (menuItemId: string, customization: MenuItemCustomization) => void;
}

export function DineInMenuPanel({
  items,
  activeCategory,
  quantities,
  customizingItemId,
  onCategoryChange,
  onQuantityChange,
  onCustomizeOpen,
  onCustomizeClose,
  onCustomizeAdd,
}: Readonly<DineInMenuPanelProps>) {
  const grouped = items.reduce<Record<string, DineInMenuItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  function handleIncrease(item: DineInMenuItem) {
    onCustomizeOpen(item.id);
  }

  function handleDecrease(item: DineInMenuItem) {
    const current = quantities[item.id] ?? 0;
    if (current > 0) {
      onQuantityChange(item.id, current - 1);
    }
  }

  return (
    <section className={styles.panel} aria-labelledby="dine-in-menu-title">
      <header className={styles.panelHeader}>
        <h2 id="dine-in-menu-title" className={styles.menuTitle}>
          Menu
        </h2>

        <div className={styles.searchRow}>
          <label className={styles.search}>
            <Search size={18} className={styles.searchIcon} aria-hidden />
            <input
              type="search"
              className={styles.searchInput}
              placeholder={dineInPageMeta.searchPlaceholder}
            />
          </label>
          <button type="button" className={styles.headerIconBtn} aria-label="Payment methods">
            <CreditCard size={18} />
          </button>
          <button type="button" className={styles.headerIconBtn} aria-label="Order bag">
            <ShoppingBag size={18} />
          </button>
        </div>

        <div className={styles.tabs} role="tablist" aria-label="Menu categories">
          {dineInMenuCategories.map((category) => {
            const active = category.id === activeCategory;
            return (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`${styles.tab} ${active ? styles.tabActive : ''}`}
                onClick={() => onCategoryChange(category.id)}
              >
                {category.label}
              </button>
            );
          })}
        </div>
      </header>

      <div className={`${styles.menuScroll} posHideScrollbar`}>
        {Object.entries(grouped).map(([group, groupItems]) => (
          <section key={group} className={styles.group} aria-label={group}>
            <h3 className={styles.groupTitle}>{group}</h3>
            <ul className={styles.itemList}>
              {groupItems.map((item) => {
                const qty = quantities[item.id] ?? 0;
                const isCustomizing = customizingItemId === item.id;

                return (
                  <li key={item.id} className={styles.menuItemWrap}>
                    <div className={styles.menuItem}>
                      <Image
                        src={item.imageUrl}
                        alt=""
                        width={44}
                        height={44}
                        className={styles.thumb}
                      />
                      <div className={styles.itemBody}>
                        <p className={styles.itemName}>{item.name}</p>
                        <p className={styles.itemPrice}>
                          {formatDineInRupee(item.price * Math.max(qty, 1))}
                        </p>
                      </div>

                      {qty > 0 ? (
                        <div className={styles.qtyControl} aria-label={`Quantity for ${item.name}`}>
                          <button
                            type="button"
                            className={styles.qtyBtn}
                            aria-label={`Decrease ${item.name}`}
                            onClick={() => handleDecrease(item)}
                          >
                            <Minus size={14} />
                          </button>
                          <span className={styles.qtyValue}>{qty}</span>
                          <button
                            type="button"
                            className={styles.qtyBtn}
                            aria-label={`Increase ${item.name}`}
                            onClick={() => handleIncrease(item)}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className={styles.addBtn}
                          aria-label={
                            item.isAvailable === false ? `${item.name} is 86'd` : `Add ${item.name}`
                          }
                          disabled={item.isAvailable === false}
                          onClick={() => handleIncrease(item)}
                          style={
                            item.isAvailable === false
                              ? { opacity: 0.5, cursor: 'not-allowed', backgroundColor: '#94a3b8' }
                              : undefined
                          }
                        >
                          {item.isAvailable === false ? "86'd" : 'Add'}
                        </button>
                      )}
                    </div>

                    {isCustomizing ? (
                      <DineInCustomizePanel
                        key={item.id}
                        item={item}
                        onAdd={(customization) => onCustomizeAdd(item.id, customization)}
                        onClose={onCustomizeClose}
                      />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}
