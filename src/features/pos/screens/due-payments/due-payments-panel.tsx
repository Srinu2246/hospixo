'use client';

import { AlertTriangle, ChevronRight } from 'lucide-react';

import { DuePaymentRow } from '@/features/pos/screens/due-payments/due-payment-row';

import type { DuePaymentsPageViewModel } from './use-due-payments-page';
import styles from './due-payments-page.module.css';

export function DuePaymentsPanel({
  settleFromPos,
  setSettleFromPos,
  payments,
  handleSettle,
  hideTitle = false,
}: Readonly<DuePaymentsPageViewModel & { hideTitle?: boolean }>) {
  return (
    <section
      className={styles.panel}
      aria-labelledby={hideTitle ? undefined : 'due-payment-heading'}
    >
      <header className={styles.header}>
        {hideTitle ? (
          <span className={styles.headerSpacer} />
        ) : (
          <h1 id="due-payment-heading">
            <span aria-hidden="true" />
            Due Payment Listing
          </h1>
        )}

        <label className={styles.toggleLabel}>
          Settle From POS
          <input
            type="checkbox"
            checked={settleFromPos}
            onChange={(event) => setSettleFromPos(event.target.checked)}
          />
          <i aria-hidden="true" />
        </label>
      </header>

      <output className={styles.alert}>
        <AlertTriangle size={15} aria-hidden />
        <p>
          You can settle the due payments either on the POS or on the web dashboard simultaneously.
          To settle the due payments from here, disable it from POS.
        </p>
      </output>

      <div className={styles.list}>
        {payments.map((payment) => (
          <DuePaymentRow key={payment.id} payment={payment} onSettle={handleSettle} />
        ))}
      </div>

      <footer className={styles.footer}>
        <p>Showing {payments.length} pending due payments</p>
        <button type="button">
          View All Billing History
          <ChevronRight size={14} aria-hidden />
        </button>
      </footer>
    </section>
  );
}
