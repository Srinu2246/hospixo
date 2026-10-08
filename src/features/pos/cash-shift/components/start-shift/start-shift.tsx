'use client';

import { useState, type ComponentProps } from 'react';
import { CircleDot, Info } from 'lucide-react';

import { cashShiftCopy } from '@/features/pos/cash-shift/config';
import { formatDateTimeLabel } from '@/features/pos/cash-shift/lib';
import type { StartShiftDraft, StartShiftPayload } from '@/features/pos/types/cash-shift';

import styles from './start-shift.module.css';

type StartShiftProps = Readonly<{
  draft: StartShiftDraft;
  /** When false, Cancel is hidden (e.g. fresh load with no prior closed screen). */
  canCancel?: boolean;
  onCancel: () => void;
  onStart: (payload: StartShiftPayload) => void;
}>;

type FormSubmitEvent = Parameters<NonNullable<ComponentProps<'form'>['onSubmit']>>[0];

function parseOpeningBalance(raw: string): number {
  const cleaned = raw.replace(/[₹,\s]/g, '').trim();
  const amount = Number.parseFloat(cleaned);
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Number(amount.toFixed(2));
}

export function StartShift({ draft, canCancel = true, onCancel, onStart }: StartShiftProps) {
  const copy = cashShiftCopy.start;
  const dateTimeLabel = formatDateTimeLabel();

  const [operatorId, setOperatorId] = useState(draft.defaultOperatorId);
  const [terminalId, setTerminalId] = useState(draft.defaultTerminalId);
  const [openingBalanceText, setOpeningBalanceText] = useState(
    draft.defaultOpeningBalance.toFixed(2),
  );
  const [operatorError, setOperatorError] = useState<string | null>(null);

  const selectedOperator = draft.operators.find((item) => item.id === operatorId);
  const operatorMissing = !selectedOperator;
  const operatorMessage = operatorError ?? (operatorMissing ? copy.operatorMissing : null);

  function handleSubmit(event: FormSubmitEvent) {
    event.preventDefault();
    if (!selectedOperator) {
      setOperatorError(copy.operatorMissing);
      return;
    }

    setOperatorError(null);
    onStart({
      shiftNumber: draft.nextShiftNumber,
      operatorId,
      operatorName: selectedOperator.name,
      terminalId,
      openingBalance: parseOpeningBalance(openingBalanceText),
      startedAtLabel: formatDateTimeLabel(),
    });
  }

  return (
    <div className={styles.page}>
      <section className={styles.card} aria-labelledby="start-shift-title">
        <header className={styles.header}>
          <h1 id="start-shift-title" className={styles.title}>
            {copy.title}
          </h1>
          <p className={styles.subtitle}>{copy.subtitle}</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="start-shift-number">
                {copy.shiftNumber}
              </label>
              <input
                id="start-shift-number"
                className={`${styles.input} ${styles.inputReadonly}`}
                value={`#${draft.nextShiftNumber}`}
                readOnly
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="start-shift-datetime">
                {copy.dateTime}
              </label>
              <input
                id="start-shift-datetime"
                className={`${styles.input} ${styles.inputReadonly}`}
                value={dateTimeLabel}
                readOnly
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="start-shift-operator">
              {copy.operator}
            </label>
            <select
              id="start-shift-operator"
              className={styles.select}
              value={operatorId}
              aria-invalid={Boolean(operatorMessage)}
              aria-describedby={
                operatorMessage ? 'start-shift-operator-error' : 'start-shift-operator-hint'
              }
              onChange={(e) => {
                setOperatorId(e.target.value);
                setOperatorError(null);
              }}
            >
              {draft.operators.map((operator) => (
                <option key={operator.id} value={operator.id}>
                  {operator.name}
                </option>
              ))}
            </select>
            {operatorMessage ? (
              <p id="start-shift-operator-error" className={styles.error} role="alert">
                {operatorMessage}
              </p>
            ) : (
              <p id="start-shift-operator-hint" className={styles.hint}>
                {copy.operatorHint}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="start-shift-terminal">
              {copy.terminal}
            </label>
            <select
              id="start-shift-terminal"
              className={styles.select}
              value={terminalId}
              onChange={(e) => setTerminalId(e.target.value)}
            >
              {draft.terminals.map((terminal) => (
                <option key={terminal.id} value={terminal.id}>
                  {terminal.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="start-shift-opening">
              {copy.openingBalance}
            </label>
            <div className={styles.amountWrap}>
              <span className={styles.currency} aria-hidden>
                ₹
              </span>
              <input
                id="start-shift-opening"
                className={styles.amountInput}
                value={openingBalanceText}
                onChange={(e) => setOpeningBalanceText(e.target.value)}
                onBlur={() =>
                  setOpeningBalanceText(parseOpeningBalance(openingBalanceText).toFixed(2))
                }
                inputMode="decimal"
              />
            </div>
          </div>

          <p className={styles.info}>
            <Info className={styles.infoIcon} aria-hidden />
            {copy.balanceInfo}
          </p>

          <div className={styles.actions}>
            {canCancel ? (
              <button type="button" className={styles.cancelBtn} onClick={onCancel}>
                {copy.cancel}
              </button>
            ) : null}
            <button type="submit" className={styles.startBtn} disabled={operatorMissing}>
              <CircleDot className={styles.btnIcon} aria-hidden />
              {copy.confirm}
            </button>
          </div>
        </form>
      </section>

      <p className={styles.auditNote}>{copy.auditNote}</p>
    </div>
  );
}
