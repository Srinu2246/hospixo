'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';

import { cashShiftCopy } from '@/features/pos/cash-shift/config';

import styles from './cash-shift-preview-dialog.module.css';

export type CashShiftPreviewDialogState =
  | { kind: 'closed' }
  | { kind: 'info'; message: string }
  | { kind: 'confirm'; message: string; onConfirm: () => void }
  | {
      kind: 'amount';
      title: string;
      variant: 'cash_in' | 'cash_out';
      onSubmit: (amount: number) => void;
    };

type CashShiftPreviewDialogProps = Readonly<{
  state: CashShiftPreviewDialogState;
  onClose: () => void;
}>;

function parseAmount(raw: string): number | null {
  const amount = Number.parseFloat(raw.replaceAll(',', '').trim());
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return amount;
}

type AmountDialogBodyProps = Readonly<{
  title: string;
  titleId: string;
  variant: 'cash_in' | 'cash_out';
  onSubmit: (amount: number) => void;
  onClose: () => void;
}>;

function AmountDialogBody({ title, titleId, variant, onSubmit, onClose }: AmountDialogBodyProps) {
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState<string | null>(null);
  const { dialogs } = cashShiftCopy;
  const descriptionId = useId();

  function handleAmountSubmit() {
    const parsed = parseAmount(amount);
    if (parsed === null) {
      setAmountError(cashShiftCopy.prompts.invalidAmount);
      return;
    }

    onSubmit(parsed);
    onClose();
  }

  const submitLabel = variant === 'cash_in' ? dialogs.cashInSubmit : dialogs.cashOutSubmit;
  const submitClass = variant === 'cash_in' ? styles.btnSuccess : styles.btnDanger;

  return (
    <>
      <header className={styles.header}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <p id={descriptionId} className={styles.description}>
          {dialogs.amountLabel}
        </p>
      </header>
      <div>
        <label className={styles.fieldLabel} htmlFor="cash-shift-amount">
          {dialogs.amountLabel}
        </label>
        <input
          id="cash-shift-amount"
          className={styles.input}
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          placeholder={dialogs.amountPlaceholder}
          value={amount}
          aria-invalid={amountError ? true : undefined}
          aria-describedby={amountError ? 'cash-shift-amount-error' : descriptionId}
          onChange={(event) => {
            setAmount(event.target.value);
            if (amountError) setAmountError(null);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              handleAmountSubmit();
            }
          }}
          autoFocus
        />
        {amountError ? (
          <p id="cash-shift-amount-error" role="alert" className={styles.error}>
            {amountError}
          </p>
        ) : null}
      </div>
      <footer className={styles.footer}>
        <button type="button" className={styles.btnSecondary} onClick={onClose}>
          {dialogs.cancel}
        </button>
        <button type="button" className={submitClass} onClick={handleAmountSubmit}>
          {submitLabel}
        </button>
      </footer>
    </>
  );
}

export function CashShiftPreviewDialog({ state, onClose }: CashShiftPreviewDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const isOpen = state.kind !== 'closed';

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
      return;
    }

    if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    function handleCancel(event: Event) {
      event.preventDefault();
      onClose();
    }

    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  if (!isOpen) return null;

  const { dialogs } = cashShiftCopy;
  const showDismiss = state.kind !== 'confirm';

  function handleConfirm() {
    if (state.kind !== 'confirm') return;
    state.onConfirm();
  }

  return (
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby={titleId}>
      <div className={showDismiss ? styles.panelWithClose : styles.panel}>
        {showDismiss ? (
          <button
            type="button"
            className={styles.closeIcon}
            onClick={onClose}
            aria-label={dialogs.close}
          >
            <X size={16} aria-hidden />
          </button>
        ) : null}

        {state.kind === 'info' ? (
          <>
            <header className={styles.header}>
              <h2 id={titleId} className={styles.title}>
                {cashShiftCopy.title}
              </h2>
              <p className={styles.description}>{state.message}</p>
            </header>
            <footer className={styles.footer}>
              <button type="button" className={styles.btnPrimary} onClick={onClose}>
                {dialogs.ok}
              </button>
            </footer>
          </>
        ) : null}

        {state.kind === 'confirm' ? (
          <>
            <header className={styles.header}>
              <h2 id={titleId} className={styles.title}>
                {cashShiftCopy.actions.closeShift}
              </h2>
              <p className={styles.description}>{state.message}</p>
            </header>
            <footer className={styles.footer}>
              <button type="button" className={styles.btnSecondary} onClick={onClose}>
                {dialogs.cancel}
              </button>
              <button type="button" className={styles.btnPrimary} onClick={handleConfirm}>
                {dialogs.confirm}
              </button>
            </footer>
          </>
        ) : null}

        {state.kind === 'amount' ? (
          <AmountDialogBody
            key={`${state.variant}-${state.title}`}
            title={state.title}
            titleId={titleId}
            variant={state.variant}
            onSubmit={state.onSubmit}
            onClose={onClose}
          />
        ) : null}
      </div>
    </dialog>
  );
}
