import type { DineInMenuItem, MenuItemCustomization } from '@/features/pos/config/dine-in';
import { formatDineInRupee } from '@/features/pos/config/dine-in';
import { Check, Minus, Plus } from 'lucide-react';

import { getSizePriceLabel, getSizeSubtitle } from './dine-in-customize-sheet.helpers';
import { useDineInCustomize } from './use-dine-in-customize';
import styles from './dine-in-customize-sheet.module.css';

interface DineInCustomizeSheetProps {
  item: DineInMenuItem;
  onAdd: (customization: MenuItemCustomization) => void;
  onClose: () => void;
}

export function DineInCustomizeSheet({
  item,
  onAdd,
  onClose,
}: Readonly<DineInCustomizeSheetProps>) {
  const {
    customization,
    referenceSizePrice,
    quantity,
    totalPrice,
    cookingPreferences,
    toggleAddOn,
    setSizeId,
    setCookingPreference,
    decreaseQty,
    increaseQty,
  } = useDineInCustomize(item);

  function handleAdd() {
    onAdd(customization);
    onClose();
  }

  return (
    <div className={styles.sheetContent}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h3 className={styles.itemTitle}>{item.name}</h3>
          <span className={styles.itemPrice}>{formatDineInRupee(totalPrice)}</span>
        </div>
        <p className={styles.headerSub}>Customize cooking preferences and add-ons</p>
      </header>

      {item.sizes && item.sizes.length > 0 ? (
        <section className={styles.section}>
          <h4 className={styles.sectionLabel}>Select Portion Size</h4>
          <ul className={styles.sizeList}>
            {item.sizes.map((size) => {
              const selected = customization.sizeId === size.id;
              const priceLabel = getSizePriceLabel(size, referenceSizePrice);
              return (
                <li key={size.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    className={`${styles.sizeCard} ${selected ? styles.sizeCardActive : ''}`}
                    onClick={() => setSizeId(size.id)}
                  >
                    <div className={styles.sizeCopy}>
                      <span className={styles.sizeName}>{size.label}</span>
                      <span className={styles.sizeSub}>{getSizeSubtitle(size)}</span>
                    </div>
                    <div className={styles.sizeMeta}>
                      <span
                        className={`${styles.sizePriceLabel} ${
                          priceLabel.included ? styles.sizePriceIncluded : ''
                        }`}
                      >
                        {priceLabel.text}
                      </span>
                      <span
                        className={`${styles.sizeIndicator} ${
                          selected ? styles.sizeIndicatorActive : ''
                        }`}
                        aria-hidden
                      >
                        {selected ? <Check size={12} strokeWidth={3} /> : null}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {item.addOns && item.addOns.length > 0 ? (
        <section className={styles.section}>
          <h4 className={styles.sectionLabel}>Add Extras</h4>
          <ul className={styles.extraList}>
            {item.addOns.map((addOn) => {
              const checked = customization.addOnIds?.includes(addOn.id) ?? false;
              return (
                <li key={addOn.id}>
                  <label className={styles.extraRow}>
                    <span className={styles.vegMark} aria-hidden />
                    <span className={styles.extraCopy}>
                      <span className={styles.extraName}>{addOn.label}</span>
                      <span className={styles.extraPrice}>+ {formatDineInRupee(addOn.price)}</span>
                    </span>
                    <input
                      type="checkbox"
                      className={styles.extraInput}
                      checked={checked}
                      onChange={() => toggleAddOn(addOn.id)}
                    />
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {cookingPreferences.length > 0 ? (
        <section className={styles.section}>
          <h4 className={styles.sectionLabel}>Cooking Preference</h4>
          <div className={styles.preferenceRow}>
            {cookingPreferences.map((preference) => {
              const selected = customization.cookingPreference === preference;
              return (
                <button
                  key={preference}
                  type="button"
                  aria-pressed={selected}
                  className={`${styles.preferenceBtn} ${selected ? styles.preferenceBtnActive : ''}`}
                  onClick={() => setCookingPreference(preference)}
                >
                  {preference}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <footer className={styles.footer}>
        <div className={styles.qtyControl} aria-label="Item quantity">
          <button
            type="button"
            className={styles.qtyBtn}
            aria-label="Decrease quantity"
            onClick={decreaseQty}
          >
            <Minus size={14} />
          </button>
          <span className={styles.qtyValue}>{quantity}</span>
          <button
            type="button"
            className={styles.qtyBtn}
            aria-label="Increase quantity"
            onClick={increaseQty}
          >
            <Plus size={14} />
          </button>
        </div>
        <button type="button" className={styles.addBtn} onClick={handleAdd}>
          Add Item · {formatDineInRupee(totalPrice)}
        </button>
      </footer>
    </div>
  );
}
