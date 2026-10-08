import type { DineInMenuItem, MenuItemCustomization } from '@/features/pos/config/dine-in';
import { formatDineInRupee } from '@/features/pos/config/dine-in';
import { Check, Minus, Plus } from 'lucide-react';

import { getSizePriceLabel } from './dine-in-customize-sheet.helpers';
import { useDineInCustomize } from './use-dine-in-customize';
import styles from './dine-in-customize-panel.module.css';

interface DineInCustomizePanelProps {
  item: DineInMenuItem;
  onAdd: (customization: MenuItemCustomization) => void;
  onClose: () => void;
}

export function DineInCustomizePanel({
  item,
  onAdd,
  onClose,
}: Readonly<DineInCustomizePanelProps>) {
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

  const hasCookingPreferences = cookingPreferences.length > 0;

  function handleAdd() {
    onAdd(customization);
    onClose();
  }

  const qtyControl = (
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
  );

  const addButton = (
    <button type="button" className={styles.addBtn} onClick={handleAdd}>
      Add item | {formatDineInRupee(totalPrice)}
    </button>
  );

  return (
    <section className={styles.panel} aria-label={`Customize ${item.name}`}>
      <header className={styles.header}>
        <h3 className={styles.title}>Customize</h3>
        <span className={styles.itemBadge}>
          {quantity} {quantity === 1 ? 'Item' : 'Items'}
        </span>
      </header>

      {item.sizes && item.sizes.length > 0 ? (
        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <span className={styles.legend}>Choose Size</span>
            <span className={styles.requiredBadge}>REQUIRED</span>
          </div>
          <div className={styles.sizeGrid}>
            {item.sizes.map((size) => {
              const selected = customization.sizeId === size.id;
              const priceLabel = getSizePriceLabel(size, referenceSizePrice);
              return (
                <button
                  key={size.id}
                  type="button"
                  aria-pressed={selected}
                  className={`${styles.sizeOption} ${selected ? styles.sizeOptionActive : ''}`}
                  onClick={() => setSizeId(size.id)}
                >
                  {selected ? (
                    <span className={styles.sizeCheck} aria-hidden>
                      <Check size={12} strokeWidth={3} />
                    </span>
                  ) : null}
                  <span className={styles.sizeLabel}>{size.label}</span>
                  <span
                    className={`${styles.sizePrice} ${
                      priceLabel.included ? styles.sizePriceIncluded : ''
                    }`}
                  >
                    {priceLabel.text}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {item.addOns && item.addOns.length > 0 ? (
        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <span className={styles.legend}>Extra Add-ons</span>
          </div>
          <div className={styles.addOnGrid}>
            {item.addOns.map((addOn) => {
              const checked = customization.addOnIds?.includes(addOn.id) ?? false;
              return (
                <label
                  key={addOn.id}
                  className={`${styles.addOnLabel} ${checked ? styles.addOnLabelChecked : ''}`}
                >
                  <input
                    type="checkbox"
                    className={styles.addOnInput}
                    checked={checked}
                    onChange={() => toggleAddOn(addOn.id)}
                  />
                  <span className={styles.addOnText}>
                    {addOn.label}{' '}
                    <span className={styles.addOnPrice}>(+{formatDineInRupee(addOn.price)})</span>
                  </span>
                </label>
              );
            })}
          </div>
        </section>
      ) : null}

      {hasCookingPreferences ? (
        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <span className={styles.legend}>Cooking Preference</span>
          </div>
          <div className={styles.actionRow}>
            <div className={styles.preferenceRow}>
              {cookingPreferences.map((preference) => {
                const selected = customization.cookingPreference === preference;
                return (
                  <button
                    key={preference}
                    type="button"
                    className={`${styles.preferenceBtn} ${selected ? styles.preferenceBtnActive : ''}`}
                    onClick={() => setCookingPreference(preference)}
                  >
                    {preference}
                  </button>
                );
              })}
            </div>
            <div className={styles.actionRight}>
              {qtyControl}
              {addButton}
            </div>
          </div>
        </section>
      ) : (
        <footer className={styles.footer}>
          {qtyControl}
          {addButton}
        </footer>
      )}
    </section>
  );
}
