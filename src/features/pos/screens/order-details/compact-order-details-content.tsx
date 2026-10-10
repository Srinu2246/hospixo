'use client';

import { formatDineInRupee } from '@/features/pos/config/dine-in';
import { orderDetailsPageMeta } from '@/features/pos/config/order-details';
import { CheckoutCouponField } from '@/features/pos/screens/checkout-payment/checkout-coupon-field';
import {
  PosCompactBody,
  PosCompactHeader,
  PosCompactPage,
} from '@/features/pos/screens/layout/pos-compact-page';
import { PosMobileHeader } from '@/features/pos/screens/layout/pos-mobile-header';
import { PosMobileShell } from '@/features/pos/screens/layout/pos-mobile-shell';

import type { OrderDetailsPageViewModel } from './use-order-details-page';
import styles from './compact-order-details-content.module.css';

interface CompactOrderDetailsContentProps extends OrderDetailsPageViewModel {
  layout: 'mobile' | 'tablet';
}

export function CompactOrderDetailsContent({
  order,
  isLoading,
  loadError,
  lines,
  subtotal,
  tax,
  grandTotal,
  itemCount,
  metaLine,
  generateReceiptLabel,
  handleGenerateReceipt,
  goBack,
}: Readonly<CompactOrderDetailsContentProps>) {
  if (!order) {
    return (
      <PosMobileShell activeNavId="orders" withPageBg>
        <PosCompactPage>
          <PosCompactBody className={styles.emptyBody}>
            <div className={styles.emptyPage}>
              <p className={styles.emptyTitle}>
                {isLoading ? 'Loading order…' : (loadError ?? 'Order not found')}
              </p>
              <button type="button" className={styles.emptyBtn} onClick={goBack}>
                Back to Open Orders
              </button>
            </div>
          </PosCompactBody>
        </PosCompactPage>
      </PosMobileShell>
    );
  }

  return (
    <PosMobileShell activeNavId="orders" withPageBg>
      <PosCompactPage>
        <PosCompactHeader>
          <PosMobileHeader title="Open Orders" subtitle="Live active tickets" onBack={goBack} />
        </PosCompactHeader>

        <PosCompactBody className={styles.body}>
          <section className={styles.summaryCard} aria-label="Table summary">
            <div className={styles.summaryTop}>
              <p className={styles.tableLabel}>{order.reference}</p>
              <span className={styles.itemCount}>
                {itemCount} {orderDetailsPageMeta.itemsLabel}
              </span>
            </div>
            <p className={styles.meta}>{metaLine}</p>
          </section>

          <section className={styles.itemsCard} aria-labelledby="ordered-items-heading">
            <h2 id="ordered-items-heading" className={styles.sectionLabel}>
              {orderDetailsPageMeta.orderedItemsLabel}
            </h2>

            {lines.map((line) => (
              <div key={line.id} className={styles.lineItem}>
                <div className={styles.lineLeft}>
                  <p className={styles.lineName}>{line.name}</p>
                  <p className={styles.lineQty}>
                    {line.quantity} × {formatDineInRupee(line.price)}
                  </p>
                </div>
                <span className={styles.linePrice}>
                  {formatDineInRupee(line.price * line.quantity)}
                </span>
              </div>
            ))}

            <CheckoutCouponField showLabel={false} className={styles.couponField} />

            <div className={styles.totals}>
              <div className={styles.totalRow}>
                <span>{orderDetailsPageMeta.subtotalLabel}</span>
                <span>{formatDineInRupee(subtotal)}</span>
              </div>
              <div className={styles.totalRow}>
                <span>{orderDetailsPageMeta.taxLabel}</span>
                <span>{formatDineInRupee(tax)}</span>
              </div>
              <div className={`${styles.totalRow} ${styles.totalRowStrong}`}>
                <span>{orderDetailsPageMeta.grandTotalLabel}</span>
                <span>{formatDineInRupee(grandTotal)}</span>
              </div>
            </div>
          </section>

          <button type="button" className={styles.receiptBtn} onClick={handleGenerateReceipt}>
            {generateReceiptLabel}
          </button>
        </PosCompactBody>
      </PosCompactPage>
    </PosMobileShell>
  );
}
