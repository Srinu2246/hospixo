import { CheckCircle2 } from 'lucide-react';

import { successPageMeta } from '@/features/pos/day-close/config/success';

import { DayClosingSummaryCard } from './day-closing-summary-card';
import { SuccessActions } from './success-actions';

import styles from './success-page.module.css';

export function SuccessPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <span className={styles.iconWrap} aria-hidden>
          <CheckCircle2 size={40} strokeWidth={2} />
        </span>
        <h1 className={styles.title}>{successPageMeta.title}</h1>
        <p className={styles.subtitle}>{successPageMeta.subtitle}</p>
      </div>

      <DayClosingSummaryCard />
      <SuccessActions />
      <p className={styles.footerNote}>{successPageMeta.footerNote}</p>
    </div>
  );
}
