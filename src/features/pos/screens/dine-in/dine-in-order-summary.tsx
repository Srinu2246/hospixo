'use client';

import Image from 'next/image';
import type { DineInOrderLine } from '@/features/pos/config/dine-in';
import { dineInActions, formatDineInRupee } from '@/features/pos/config/dine-in';
import { Minus, Plus, Trash2 } from 'lucide-react';

import styles from './dine-in-order-summary.module.css';

interface DineInOrderSummaryProps {
  tableLabel: string;
  orderNumber: string;
  items: DineInOrderLine[];
  subtotal: number;
  discount: number;
  total: number;
  onQuantityChange: (lineId: string, quantity: number) => void;
  onRemoveLine: (lineId: string) => void;
  onSendToKot: () => void;
}

export function DineInOrderSummary({
  tableLabel,
  orderNumber,
  items,
  subtotal,
  discount,
  total,
  onQuantityChange,
  onRemoveLine,
  onSendToKot,
}: Readonly<DineInOrderSummaryProps>) {
  const itemCount = items.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <section className={styles.panel} aria-labelledby="dine-in-order-heading">
      <header className={styles.panelHeader}>
        <div className={styles.titleRow}>
          <h2 id="dine-in-order-heading" className={styles.panelTitle}>
            Order Summary
          </h2>
          <span className={styles.itemBadge}>{itemCount} ITEMS</span>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaStrong}>{tableLabel}</span>
          <span className={styles.metaStrong}>Order: {orderNumber}</span>
        </div>
      </header>

      <ul className={`${styles.lines} posHideScrollbar`}>
        {items.map((line) => (
          <li key={line.id} className={styles.lineItem}>
            <Image src={line.imageUrl} alt="" width={48} height={48} className={styles.lineThumb} />
            <div className={styles.lineContent}>
              <div className={styles.lineTop}>
                <p className={styles.lineName}>{line.name}</p>
                <p className={styles.linePrice}>{formatDineInRupee(line.price * line.quantity)}</p>
              </div>
              <div className={styles.lineTags}>
                <span className={styles.tag}>{line.quantity} Items</span>
                {line.variant ? <span className={styles.tag}>{line.variant}</span> : null}
                {line.addOns?.map((addOn) => (
                  <span key={addOn} className={styles.tag}>
                    {addOn}
                  </span>
                ))}
                {line.cookingPreference ? (
                  <span className={styles.tag}>{line.cookingPreference}</span>
                ) : null}
              </div>
              <div className={styles.lineControls}>
                <div className={styles.qtyControl}>
                  <button
                    type="button"
                    className={styles.qtyBtn}
                    aria-label={`Decrease ${line.name}`}
                    onClick={() => onQuantityChange(line.id, Math.max(1, line.quantity - 1))}
                  >
                    <Minus size={14} strokeWidth={2} />
                  </button>
                  <span className={styles.qtyValue}>{line.quantity}</span>
                  <button
                    type="button"
                    className={`${styles.qtyBtn} ${styles.qtyBtnPlus}`}
                    aria-label={`Increase ${line.name}`}
                    onClick={() => onQuantityChange(line.id, line.quantity + 1)}
                  >
                    <Plus size={14} strokeWidth={2} />
                  </button>
                </div>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  aria-label={`Remove ${line.name}`}
                  onClick={() => onRemoveLine(line.id)}
                >
                  <Trash2 size={18} strokeWidth={1.75} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className={styles.summaryFooter}>
        <div className={styles.totals}>
          <div className={styles.totalRow}>
            <span>Sub total</span>
            <span>{formatDineInRupee(subtotal)}</span>
          </div>
          <div className={styles.totalRow}>
            <span>Discount</span>
            <span>{formatDineInRupee(discount)}</span>
          </div>
          <div className={`${styles.totalRow} ${styles.totalRowStrong}`}>
            <span>Total</span>
            <span>{formatDineInRupee(total)}</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.billBtn}>
            Bill
          </button>
          <button
            type="button"
            className={styles.checkoutBtn}
            onClick={onSendToKot}
            disabled={itemCount === 0}
          >
            {dineInActions.sendToKot}
          </button>
        </div>
      </div>
    </section>
  );
}
