'use client';

import Link from 'next/link';
import { Check, Printer } from 'lucide-react';

import { routes } from '@/config/routes';
import { cashShiftCopy } from '@/features/pos/cash-shift/config';
import { formatInrPlain } from '@/features/pos/cash-shift/lib';
import type { ShiftClosedResult } from '@/features/pos/types/cash-shift';

import styles from './shift-closed.module.css';

type ShiftClosedProps = Readonly<{
  result: ShiftClosedResult;
  onStartNewShift: () => void;
}>;

export function ShiftClosed({ result, onStartNewShift }: ShiftClosedProps) {
  const copy = cashShiftCopy.closed;
  const balanced = result.balanceStatus === 'balanced';

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.badge} aria-hidden>
          <Check className={styles.check} />
        </div>
        <h1 className={styles.title}>{copy.title(result.shiftNumber)}</h1>
        <p className={styles.subtitle}>{copy.subtitle(result.closedAtLabel)}</p>
      </div>

      <section className={styles.card} aria-labelledby="shift-closed-summary-title">
        <div className={styles.cardHead}>
          <h2 id="shift-closed-summary-title" className={styles.cardTitle}>
            {copy.summaryTitle}
          </h2>
          <span
            className={`${styles.status} ${
              balanced ? styles.statusBalanced : styles.statusVariance
            }`}
          >
            {balanced ? copy.balanced : copy.variance}
          </span>
        </div>

        <div className={styles.grid}>
          <div>
            <p className={styles.fieldLabel}>{copy.openedBy}</p>
            <p className={styles.fieldValue}>{result.openedBy}</p>
          </div>
          <div>
            <p className={styles.fieldLabel}>{copy.timeRange}</p>
            <p className={styles.fieldValue}>
              {copy.timeRangeValue(result.startTimeLabel, result.endTimeLabel)}
            </p>
          </div>
          <div>
            <p className={styles.fieldLabel}>{copy.duration}</p>
            <p className={styles.fieldValue}>{result.durationLabel}</p>
          </div>
          <div>
            <p className={styles.fieldLabel}>{copy.totalSales}</p>
            <p className={styles.fieldValue}>{formatInrPlain(result.totalSales)}</p>
          </div>
          <div>
            <p className={styles.fieldLabel}>{copy.transactions}</p>
            <p className={styles.fieldValue}>{result.transactions}</p>
          </div>
          <div>
            <p className={styles.fieldLabel}>{copy.cashDifference}</p>
            <p className={styles.fieldValue}>{formatInrPlain(result.cashDifference)}</p>
          </div>
        </div>

        {result.reportPrinted ? (
          <p className={styles.printBanner}>
            <Printer className={styles.printIcon} aria-hidden />
            {copy.reportPrinted}
          </p>
        ) : null}
      </section>

      <div className={styles.actions}>
        <Link href={routes.platform.pos.dashboard} className={styles.secondaryBtn}>
          {copy.goCashCounter}
        </Link>
        <button type="button" className={styles.primaryBtn} onClick={onStartNewShift}>
          <span className={styles.plus} aria-hidden>
            +
          </span>
          {copy.startNewShift}
        </button>
      </div>

      <p className={styles.emailNote}>{copy.emailNote(result.managerEmailMasked)}</p>
    </div>
  );
}
