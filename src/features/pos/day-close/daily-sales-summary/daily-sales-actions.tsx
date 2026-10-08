'use client';

import { useRouter } from 'next/navigation';

import { dailySalesSummaryPageMeta } from '@/features/pos/day-close/config/daily-sales-summary';

import styles from './daily-sales-actions.module.css';

export function DailySalesActions() {
  const router = useRouter();

  return (
    <div className={styles.actions}>
      <button
        type="button"
        className={styles.backBtn}
        onClick={() => router.push(dailySalesSummaryPageMeta.backHref)}
      >
        {dailySalesSummaryPageMeta.backLabel}
      </button>
      <button
        type="button"
        className={styles.confirmBtn}
        onClick={() => router.push(dailySalesSummaryPageMeta.confirmHref)}
      >
        {dailySalesSummaryPageMeta.confirmLabel}
      </button>
    </div>
  );
}
