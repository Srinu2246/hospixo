'use client';

import { Info } from 'lucide-react';

import { cashShiftCopy } from '@/features/pos/cash-shift/config';

import styles from './footer.module.css';

type CashShiftFooterProps = Readonly<{
  onCloseShift: () => void;
  shiftIsActive: boolean;
}>;

export function CashShiftFooter({ onCloseShift, shiftIsActive }: CashShiftFooterProps) {
  return (
    <footer className={styles.footer}>
      <p className={styles.note}>
        <Info className={styles.icon} aria-hidden="true" />
        {cashShiftCopy.footer.syncNote}
      </p>
      <button
        type="button"
        className={styles.close}
        onClick={onCloseShift}
        disabled={!shiftIsActive}
        title={shiftIsActive ? undefined : cashShiftCopy.footer.shiftAlreadyClosed}
      >
        {cashShiftCopy.actions.closeShift}
      </button>
    </footer>
  );
}
