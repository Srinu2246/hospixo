'use client';

import { useState, type ReactNode } from 'react';
import { Banknote, CreditCard, Info, Lock, Printer, Ticket, WalletCards } from 'lucide-react';

import { cashShiftCopy } from '@/features/pos/cash-shift/config';
import { formatInrPlain } from '@/features/pos/cash-shift/lib';
import type { CloseShiftPaymentMethod, CloseShiftPreview } from '@/features/pos/types/cash-shift';

import styles from './close-shift.module.css';

type CloseShiftProps = Readonly<{
  preview: CloseShiftPreview;
  shiftNumber: string;
  onBack: () => void;
  onConfirm: (payload: { notes: string; actualCash: number; pin: string }) => void | Promise<void>;
  onPrint?: () => void;
  isSubmitting?: boolean;
}>;

const paymentIconClass: Record<CloseShiftPaymentMethod, string> = {
  cash: styles.payIconCash,
  card: styles.payIconCard,
  upi: styles.payIconUpi,
  complementary: styles.payIconComp,
};

const paymentAmountClass: Record<CloseShiftPaymentMethod, string> = {
  cash: styles.payAmountCash,
  card: styles.payAmountCard,
  upi: styles.payAmountUpi,
  complementary: styles.payAmountComp,
};

const paymentIconContent: Record<CloseShiftPaymentMethod, ReactNode> = {
  cash: <Banknote size={16} aria-hidden />,
  card: <CreditCard size={16} aria-hidden />,
  upi: (
    <span aria-hidden style={{ fontSize: 10, fontWeight: 800 }}>
      UPI
    </span>
  ),
  complementary: <Ticket size={16} aria-hidden />,
};

function PaymentIcon({ method }: Readonly<{ method: CloseShiftPaymentMethod }>) {
  return (
    <span className={`${styles.payIcon} ${paymentIconClass[method]}`}>
      {paymentIconContent[method]}
    </span>
  );
}

function parseAmountInput(raw: string, fallback: number): number {
  const cleaned = raw.replace(/[₹,\s]/g, '').trim();
  const amount = Number.parseFloat(cleaned);
  return Number.isFinite(amount) ? amount : fallback;
}

export function CloseShift({
  preview,
  shiftNumber,
  onBack,
  onConfirm,
  onPrint,
  isSubmitting = false,
}: CloseShiftProps) {
  const { summary, payments, reconciliation } = preview;
  const copy = cashShiftCopy.close;

  const [notes, setNotes] = useState('');
  const [actualCash, setActualCash] = useState(reconciliation.expectedInDrawer);
  const [actualCashText, setActualCashText] = useState(
    formatInrPlain(reconciliation.expectedInDrawer),
  );
  const [pin, setPin] = useState('');

  const difference = Number((actualCash - reconciliation.expectedInDrawer).toFixed(2));
  const diffOk = Math.abs(difference) < 0.005;

  function handleActualBlur() {
    const next = parseAmountInput(actualCashText, reconciliation.expectedInDrawer);
    setActualCash(next);
    setActualCashText(formatInrPlain(next));
  }

  async function handleConfirm() {
    const resolvedActualCash = parseAmountInput(actualCashText, actualCash);
    setActualCash(resolvedActualCash);
    setActualCashText(formatInrPlain(resolvedActualCash));
    try {
      await onConfirm({ notes, actualCash: resolvedActualCash, pin });
    } catch {
      // Parent surfaces submit errors (e.g. via preview dialog).
    }
  }

  const pinReady = pin.length >= 4;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.subtitle}>{copy.subtitle(shiftNumber)}</p>
      </header>

      <div className={styles.layout}>
        <div className={styles.stack}>
          <section className={styles.card} aria-labelledby="close-summary-title">
            <h2 id="close-summary-title" className={styles.cardTitle}>
              {copy.summary.title}
            </h2>
            <div className={styles.summaryGrid}>
              <div>
                <p className={styles.fieldLabel}>{copy.summary.shiftId}</p>
                <p className={styles.fieldValue}>{summary.shiftId}</p>
              </div>
              <div>
                <p className={styles.fieldLabel}>{copy.summary.openedBy}</p>
                <p className={styles.fieldValue}>{summary.openedBy}</p>
              </div>
              <div>
                <p className={styles.fieldLabel}>{copy.summary.startTime}</p>
                <p className={styles.fieldValue}>{summary.startTimeLabel}</p>
              </div>
              <div>
                <p className={styles.fieldLabel}>{copy.summary.duration}</p>
                <p className={styles.fieldValue}>{summary.durationLabel}</p>
              </div>
              <div>
                <p className={styles.fieldLabel}>{copy.summary.totalSales}</p>
                <p className={styles.fieldValue}>{formatInrPlain(summary.totalSales)}</p>
              </div>
              <div>
                <p className={styles.fieldLabel}>{copy.summary.transactions}</p>
                <p className={styles.fieldValue}>{summary.transactions}</p>
              </div>
            </div>

            {summary.voucher ? (
              <div className={styles.voucher}>
                <div className={styles.voucherLeft}>
                  <span className={styles.voucherIcon}>
                    <WalletCards size={16} aria-hidden />
                  </span>
                  <div className={styles.voucherMeta}>
                    <p className={styles.voucherName}>{summary.voucher.label}</p>
                    <p className={styles.voucherSub}>
                      {copy.summary.voucherTxns(summary.voucher.transactions)}
                    </p>
                  </div>
                </div>
                <p className={styles.voucherAmount}>{formatInrPlain(summary.voucher.amount)}</p>
              </div>
            ) : null}
          </section>

          <section className={styles.card} aria-labelledby="close-payments-title">
            <h2 id="close-payments-title" className={styles.cardTitle}>
              {copy.payments.title}
            </h2>
            <ul className={styles.paymentList}>
              {payments.map((row) => (
                <li key={row.id} className={styles.paymentRow}>
                  <div className={styles.paymentLeft}>
                    <PaymentIcon method={row.id} />
                    <div className={styles.payMeta}>
                      <p className={styles.payName}>{row.label}</p>
                      <p className={styles.paySub}>{copy.payments.txns(row.transactions)}</p>
                    </div>
                  </div>
                  <p className={`${styles.payAmount} ${paymentAmountClass[row.id]}`}>
                    {formatInrPlain(row.amount)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.card} aria-labelledby="close-notes-title">
            <h2 id="close-notes-title" className={styles.cardTitle}>
              {copy.notes.title}
            </h2>
            <textarea
              className={styles.notes}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={copy.notes.placeholder}
              rows={4}
            />
          </section>
        </div>

        <section className={styles.card} aria-labelledby="close-recon-title">
          <h2 id="close-recon-title" className={styles.cardTitle}>
            {copy.reconciliation.title}
          </h2>

          <div className={styles.reconList}>
            <div className={styles.reconRow}>
              <p className={styles.reconLabel}>{copy.reconciliation.openingBalance}</p>
              <p className={styles.reconValue}>{formatInrPlain(reconciliation.openingBalance)}</p>
            </div>
            <div className={styles.reconRow}>
              <p className={styles.reconLabel}>{copy.reconciliation.totalCashIn}</p>
              <p className={styles.reconValue}>{formatInrPlain(reconciliation.totalCashIn)}</p>
            </div>
            <div className={styles.reconRow}>
              <p className={styles.reconLabel}>{copy.reconciliation.totalCashOut}</p>
              <p className={styles.reconValue}>{formatInrPlain(reconciliation.totalCashOut)}</p>
            </div>
            <div className={styles.reconRow}>
              <p className={styles.reconLabel}>{copy.reconciliation.expectedInDrawer}</p>
              <p className={styles.reconValue}>{formatInrPlain(reconciliation.expectedInDrawer)}</p>
            </div>
          </div>

          <div className={styles.actualField}>
            <label className={styles.actualLabel} htmlFor="actual-cash-count">
              {copy.reconciliation.actualCashCount}
            </label>
            <input
              id="actual-cash-count"
              className={styles.actualInput}
              value={actualCashText}
              onChange={(e) => setActualCashText(e.target.value)}
              onBlur={handleActualBlur}
              inputMode="decimal"
            />
          </div>

          <div className={`${styles.diff} ${diffOk ? styles.diffOk : styles.diffWarn}`}>
            <span>{copy.reconciliation.difference}</span>
            <span>{formatInrPlain(difference)}</span>
          </div>

          <div className={styles.pinField}>
            <label className={styles.pinLabel} htmlFor="manager-pin">
              {copy.reconciliation.managerPin}
            </label>
            <input
              id="manager-pin"
              className={styles.pinInput}
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder={copy.reconciliation.pinPlaceholder}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <p className={styles.info}>
            <Info className={styles.infoIcon} aria-hidden />
            {copy.reconciliation.info}
          </p>
        </section>
      </div>

      <footer className={styles.footer}>
        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={onBack}
          disabled={isSubmitting}
        >
          {copy.actions.back}
        </button>
        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={onPrint}
          disabled={isSubmitting || !onPrint}
        >
          <Printer className={styles.btnIcon} aria-hidden />
          {copy.actions.print}
        </button>
        <button
          type="button"
          className={styles.confirmBtn}
          onClick={() => {
            void handleConfirm();
          }}
          disabled={!pinReady || isSubmitting}
          aria-busy={isSubmitting}
          title={pinReady ? undefined : copy.reconciliation.pinRequired}
        >
          <Lock className={styles.btnIcon} aria-hidden />
          {isSubmitting ? copy.actions.confirming : copy.actions.confirm}
        </button>
      </footer>
    </div>
  );
}
