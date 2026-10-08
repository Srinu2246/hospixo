import { formatDuePaymentAmount, type DuePayment } from '@/features/pos/config/due-payments';

import styles from './due-payment-row.module.css';

interface DuePaymentRowProps {
  payment: DuePayment;
  onSettle: (paymentId: string) => void;
}

export function DuePaymentRow({ payment, onSettle }: Readonly<DuePaymentRowProps>) {
  return (
    <article className={styles.row}>
      <div className={styles.guest}>
        <h2>{payment.guestName}</h2>
        <p>ID: {payment.guestId}</p>
      </div>

      <div className={styles.detail}>
        <span>DUE DATE</span>
        <strong>{payment.dueDate}</strong>
      </div>

      <div className={styles.detail}>
        <span>AMOUNT</span>
        <strong>{formatDuePaymentAmount(payment.amount)}</strong>
      </div>

      <span className={`${styles.status} ${styles[payment.status]}`}>
        {payment.status[0]?.toUpperCase()}
        {payment.status.slice(1)}
      </span>

      <button
        type="button"
        className={styles.settleButton}
        disabled={payment.status === 'paid'}
        onClick={() => onSettle(payment.id)}
      >
        {payment.status === 'paid' ? 'Settled' : 'Settle'}
      </button>
    </article>
  );
}
