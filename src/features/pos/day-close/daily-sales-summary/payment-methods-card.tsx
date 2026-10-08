import {
  dailySalesPaymentMethods,
  dailySalesPaymentMethodsMeta,
  formatDailySalesAmount,
  type PaymentMethodItem,
} from '@/features/pos/day-close/config/daily-sales-summary';

import styles from './payment-methods-card.module.css';

const paymentToneClass: Record<PaymentMethodItem['id'], string> = {
  cash: styles.toneCash,
  card: styles.toneCard,
  upi: styles.toneUpi,
};

export function PaymentMethodsCard() {
  return (
    <section className={styles.card} aria-labelledby="payment-methods-heading">
      <div className={styles.header}>
        <h2 id="payment-methods-heading" className={styles.title}>
          {dailySalesPaymentMethodsMeta.title}
        </h2>
        <span className={styles.periodTag}>{dailySalesPaymentMethodsMeta.periodLabel}</span>
      </div>

      <div className={styles.distributionRow}>
        <span className={styles.distributionLabel}>
          {dailySalesPaymentMethodsMeta.distributionLabel}
        </span>
        <strong className={styles.distributionTotal}>
          {formatDailySalesAmount(dailySalesPaymentMethodsMeta.totalAmount)}
        </strong>
      </div>

      <div className={styles.distributionBar} aria-hidden>
        {dailySalesPaymentMethods.map((method) => (
          <span
            key={method.id}
            className={`${styles.distributionSegment} ${paymentToneClass[method.id]}`}
            style={{ width: `${method.percent}%` }}
          />
        ))}
      </div>

      <ul className={styles.legend} aria-hidden>
        {dailySalesPaymentMethods.map((method) => (
          <li key={method.id} className={styles.legendItem}>
            <span className={`${styles.methodDot} ${paymentToneClass[method.id]}`} />
            {method.label}
          </li>
        ))}
      </ul>

      <ul className={styles.methodList}>
        {dailySalesPaymentMethods.map((method) => (
          <li key={method.id} className={styles.methodItem}>
            <span className={`${styles.methodDot} ${paymentToneClass[method.id]}`} aria-hidden />
            <span className={styles.methodLabel}>{method.label}</span>
            <span className={styles.methodAmount}>{formatDailySalesAmount(method.amount)}</span>
            <span className={`${styles.methodBadge} ${styles[method.badgeClass]}`}>
              {method.percent}%
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
