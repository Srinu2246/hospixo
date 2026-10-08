import { Check } from 'lucide-react';

import {
  closeBusinessDayCardTitles,
  closeBusinessDayChecklist,
} from '@/features/pos/day-close/config/close-business-day';

import styles from './pre-close-checklist-card.module.css';

export function PreCloseChecklistCard() {
  return (
    <section className={styles.card} aria-labelledby="pre-close-checklist-heading">
      <h2 id="pre-close-checklist-heading" className={styles.cardTitle}>
        {closeBusinessDayCardTitles.checklist}
      </h2>

      <ul className={styles.list}>
        {closeBusinessDayChecklist.map((item) => (
          <li key={item.id} className={styles.listItem}>
            <span
              className={`${styles.statusIcon} ${item.done ? styles.statusDone : styles.statusPending}`}
              aria-hidden
            >
              {item.done ? <Check size={14} strokeWidth={3} /> : null}
            </span>
            <span className={styles.itemLabel}>{item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
