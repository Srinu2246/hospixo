'use client';

import { cashShiftCopy } from '@/features/pos/cash-shift/config';

import styles from './header.module.css';

type CashShiftHeaderProps = Readonly<{
  onCashIn?: () => void;
  onCashOut?: () => void;
  /** Hide title/subtitle when PosMobileHeader is shown. */
  hideTitle?: boolean;
}>;

export function CashShiftHeader({ onCashIn, onCashOut, hideTitle = false }: CashShiftHeaderProps) {
  return (
    <header className={`${styles.header} ${hideTitle ? styles.headerCompact : ''}`}>
      {hideTitle ? null : (
        <div className={styles.titles}>
          <h1 className={styles.title}>{cashShiftCopy.title}</h1>
          <p className={styles.subtitle}>{cashShiftCopy.subtitle}</p>
        </div>
      )}
      <div className={styles.actions}>
        <button type="button" className={styles.cashIn} onClick={onCashIn}>
          {cashShiftCopy.actions.cashIn}
        </button>
        <button type="button" className={styles.cashOut} onClick={onCashOut}>
          {cashShiftCopy.actions.cashOut}
        </button>
      </div>
    </header>
  );
}
