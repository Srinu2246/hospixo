'use client';

import { formatDineInRupee } from '@/features/pos/config/dine-in';
import { orderDetailsPageMeta } from '@/features/pos/config/order-details';
import { CheckoutCouponField } from '@/features/pos/screens/checkout-payment/checkout-coupon-field';
import { PosMobileHeader } from '@/features/pos/screens/layout/pos-mobile-header';
import { PosOperationsShell } from '@/features/pos/screens/layout/pos-operations-shell';

import type { OrderDetailsPageViewModel } from './use-order-details-page';
import styles from './desktop-content.module.css';

export function OrderDetailsDesktopContent({
  order,
  isLoading,
  loadError,
  lines,
  subtotal,
  tax,
  grandTotal,
  itemCount,
  subtitle,
  metaLine,
  generateReceiptLabel,
  handleGenerateReceipt,
  goBack,
}: Readonly<OrderDetailsPageViewModel>) {
  if (!order) {
    return (
      <PosOperationsShell withPageBg>
        <div className={styles.centerWrap}>
          <div className={styles.emptyPage}>
            <p className={styles.emptyTitle}>
              {isLoading ? 'Loading order…' : (loadError ?? 'Order not found')}
            </p>
            <button type="button" className={styles.emptyBtn} onClick={goBack}>
              Back to Open Orders
            </button>
          </div>
        </div>
      </PosOperationsShell>
    );
  }

  return (
    <PosOperationsShell withPageBg>
      <div className={styles.centerWrap}>
        <div className={styles.page}>
          <PosMobileHeader
            title={`Order ${order.orderNumber}`}
            subtitle={subtitle}
            onBack={goBack}
          />

          <section className={styles.summaryCard}>
            <div className={styles.summaryTop}>
              <p className={styles.tableLabel}>{order.reference}</p>
              <span className={styles.itemCount}>
                {itemCount} {orderDetailsPageMeta.itemsLabel}
              </span>
            </div>
            <p className={styles.meta}>{metaLine}</p>
          </section>

          <section className={styles.itemsCard}>
            <h2 className={styles.sectionLabel}>{orderDetailsPageMeta.orderedItemsLabel}</h2>
            {lines.map((line) => (
              <div key={line.id} className={styles.lineItem}>
                <div>
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
        </div>
      </div>
    </PosOperationsShell>
  );
}
