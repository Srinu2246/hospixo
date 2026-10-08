import type { PaymentMethod, RecentTransaction } from '@/features/pos/config/dashboard';
import { formatInr, getPaymentMethodLabel } from '@/features/pos/config/dashboard';

import styles from './recent-transactions.module.css';

const methodClass: Record<PaymentMethod, string> = {
  upi: styles.upi,
  cash: styles.cash,
  card: styles.card,
};

interface RecentTransactionsProps {
  transactions: RecentTransaction[];
}

export function RecentTransactions({ transactions }: Readonly<RecentTransactionsProps>) {
  return (
    <section className={styles.panel} aria-labelledby="recent-transactions-title">
      <header className={styles.header}>
        <h2 id="recent-transactions-title" className={styles.title}>
          Recent Transactions
        </h2>
      </header>

      <ul className={styles.list}>
        {transactions.map((tx) => (
          <li key={tx.id} className={styles.row}>
            <div className={styles.meta}>
              <span className={styles.reference}>{tx.reference}</span>
              <span className={styles.amount}>{formatInr(tx.amount)}</span>
            </div>
            <span className={`${styles.method} ${methodClass[tx.method]}`}>
              {getPaymentMethodLabel(tx.method)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
