'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

import { successPageMeta } from '@/features/pos/day-close/config/success';

import styles from './success-actions.module.css';

export function SuccessActions() {
  const router = useRouter();

  return (
    <div className={styles.actions}>
      <button
        type="button"
        className={styles.dashboardBtn}
        onClick={() => router.push(successPageMeta.dashboardHref)}
      >
        {successPageMeta.dashboardLabel}
      </button>
      <button
        type="button"
        className={styles.startBtn}
        onClick={() => router.push(successPageMeta.startNewDayHref)}
      >
        <Plus size={16} aria-hidden />
        {successPageMeta.startNewDayLabel}
      </button>
    </div>
  );
}
