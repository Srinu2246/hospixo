import { cashShiftCopy } from '@/features/pos/cash-shift/config';
import { formatInrPlain } from '@/features/pos/cash-shift/lib';
import type { ActiveCashShift } from '@/features/pos/types/cash-shift';

import styles from './active-shift.module.css';

type ActiveShiftBannerProps = Readonly<{
  shift: ActiveCashShift;
}>;

export function ActiveShiftBanner({ shift }: ActiveShiftBannerProps) {
  const copy = cashShiftCopy.activeShift;

  return (
    <section className={styles.banner} aria-label={copy.title}>
      <div className={styles.item}>
        <p className={styles.label}>{copy.title}</p>
        <p className={styles.value}>Shift #{shift.number}</p>
      </div>
      <div className={styles.item}>
        <p className={styles.label}>{copy.openedBy}</p>
        <p className={styles.value}>{shift.openedBy}</p>
      </div>
      <div className={styles.item}>
        <p className={styles.label}>{copy.startTime}</p>
        <p className={styles.value}>{shift.startTimeLabel}</p>
      </div>
      <div className={styles.item}>
        <p className={styles.label}>{copy.openingBalance}</p>
        <p className={styles.value}>{formatInrPlain(shift.openingBalance)}</p>
      </div>
    </section>
  );
}
