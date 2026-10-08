'use client';

import Image from 'next/image';
import { useMemo } from 'react';

import {
  buildCheckoutFeeLines,
  checkoutPageMeta,
  computeCheckoutTotal,
  dineInLinesToCheckout,
  formatCheckoutRupee,
} from '@/features/pos/config/checkout';
import { usePosOrder } from '@/context/pos-order';

import { CheckoutCouponField } from './checkout-coupon-field';
import { CheckoutFeeList } from './checkout-fee-list';
import styles from './order-review-panel.module.css';

export function OrderReviewPanel() {
  const { orderLines, tableLabel, orderNumber } = usePosOrder();

  const lines = useMemo(() => dineInLinesToCheckout(orderLines), [orderLines]);
  const feeLines = useMemo(() => {
    const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
    return buildCheckoutFeeLines(subtotal);
  }, [lines]);
  const total = useMemo(() => computeCheckoutTotal(feeLines), [feeLines]);

  return (
    <section className={styles.panel} aria-labelledby="order-review-heading">
      <header className={styles.header}>
        <h1 id="order-review-heading" className={styles.title}>
          {checkoutPageMeta.title}
        </h1>
        <div className={styles.meta}>
          <span>{tableLabel}</span>
          <span>Order: {orderNumber}</span>
        </div>
      </header>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">
                <span className={styles.headerCell}>Item Name</span>
              </th>
              <th scope="col" className={styles.qtyCol}>
                <span className={styles.headerCell}>Qty</span>
              </th>
              <th scope="col" className={styles.priceCol}>
                <span className={styles.headerCell}>Unit Price</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.id}>
                <td>
                  <div className={styles.itemCell}>
                    <Image
                      src={line.imageUrl}
                      alt=""
                      width={36}
                      height={36}
                      className={styles.thumb}
                    />
                    <span className={styles.itemName}>{line.name}</span>
                  </div>
                </td>
                <td className={styles.qtyCell}>{line.quantity}</td>
                <td className={styles.priceCell}>
                  {formatCheckoutRupee(line.unitPrice, { signedDiscount: false }).replace(
                    '.00',
                    '',
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className={styles.summary} aria-labelledby="order-summary-heading">
        <h2 id="order-summary-heading" className={styles.summaryTitle}>
          {checkoutPageMeta.summaryTitle}
        </h2>
        <p className={styles.summaryCaption}>{checkoutPageMeta.summaryCaption}</p>

        <CheckoutCouponField />

        <CheckoutFeeList feeLines={feeLines} total={total} bordered />
      </section>
    </section>
  );
}
