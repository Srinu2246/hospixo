'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  cashReconciliationPageMeta,
  cashReconciliationSummaryMeta,
  formatCashReconciliationSummaryAmount,
  isReconciliationBalanced,
} from '@/features/pos/day-close/config/cash-reconciliation';

import styles from './reconciliation-summary-panel.module.css';

interface ReconciliationSummaryPanelProps {
  totalCounted: number;
  variance: number;
}

export function ReconciliationSummaryPanel({
  totalCounted,
  variance,
}: Readonly<ReconciliationSummaryPanelProps>) {
  const router = useRouter();
  const [notes, setNotes] = useState('');
  const balanced = isReconciliationBalanced(variance);

  return (
    <aside className={styles.panel} aria-labelledby="reconciliation-summary-heading">
      <section className={styles.card}>
        <h2 id="reconciliation-summary-heading" className={styles.title}>
          {cashReconciliationSummaryMeta.title}
        </h2>

        <div className={styles.metricBlock}>
          <span className={styles.metricLabel}>
            {cashReconciliationSummaryMeta.totalCountedLabel}
          </span>
          <strong className={styles.metricValue}>
            {formatCashReconciliationSummaryAmount(totalCounted)}
          </strong>
        </div>

        <div className={styles.metricBlock}>
          <span className={styles.metricLabel}>
            {cashReconciliationSummaryMeta.differenceLabel}
          </span>
          <strong
            className={`${styles.metricValue} ${balanced ? styles.differenceBalanced : styles.differenceMismatch}`}
          >
            {formatCashReconciliationSummaryAmount(Math.abs(variance))}
          </strong>
        </div>

        <label className={styles.notesField}>
          <span className={styles.notesLabel}>{cashReconciliationSummaryMeta.notesLabel}</span>
          <textarea
            className={styles.notesInput}
            placeholder={cashReconciliationSummaryMeta.notesPlaceholder}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={5}
          />
        </label>

        <button
          type="button"
          className={styles.submitBtn}
          onClick={() => router.push(cashReconciliationPageMeta.submitHref)}
        >
          {cashReconciliationPageMeta.submitLabel}
        </button>
      </section>
    </aside>
  );
}
