import {
  formatPaymentRupee,
  paymentSuccessLines,
  paymentSuccessOrderMeta,
  paymentSuccessPageMeta,
  paymentSuccessTotals,
} from '@/features/pos/config/payment-success';

import styles from './receipt-card.module.css';

export function ReceiptCard() {
  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <h2 className={styles.brand}>{paymentSuccessOrderMeta.brand}</h2>
        <p className={styles.metaLine}>Order: {paymentSuccessOrderMeta.orderNumber}</p>
        <p className={styles.metaLine}>{paymentSuccessOrderMeta.dateTime}</p>
        <p className={styles.metaLine}>
          {paymentSuccessOrderMeta.tableLabel} | {paymentSuccessOrderMeta.cashierLabel}
        </p>
      </header>

      <ul className={styles.lines}>
        {paymentSuccessLines.map((line) => (
          <li key={line.id} className={styles.line}>
            <span>
              {line.name} x{line.quantity}
            </span>
            <strong>{formatPaymentRupee(line.amount)}</strong>
          </li>
        ))}
      </ul>

      <dl className={styles.totals}>
        <div className={styles.totalRow}>
          <dt>Sub Total</dt>
          <dd>{formatPaymentRupee(paymentSuccessTotals.subtotal)}</dd>
        </div>
        <div className={styles.totalRow}>
          <dt>Discount (0%)</dt>
          <dd className={styles.discount}>
            {formatPaymentRupee(paymentSuccessTotals.discount, { signedDiscount: true })}
          </dd>
        </div>
        <div className={styles.totalRow}>
          <dt>Tax (5%)</dt>
          <dd>{formatPaymentRupee(paymentSuccessTotals.tax)}</dd>
        </div>
      </dl>

      <div className={styles.grandTotal}>
        <span>Total</span>
        <strong>{formatPaymentRupee(paymentSuccessTotals.total)}</strong>
      </div>

      <div className={styles.paymentRow}>
        <span>Payment Method</span>
        <strong>{paymentSuccessOrderMeta.paymentMethod}</strong>
      </div>

      <p className={styles.thankYou}>{paymentSuccessPageMeta.thankYouMessage}</p>
    </article>
  );
}
