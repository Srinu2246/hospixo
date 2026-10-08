import { CloseBusinessDayActions } from './close-business-day-actions';
import { CloseBusinessDayHeader } from './close-business-day-header';
import { CurrentDayInfoCard } from './current-day-info-card';
import { PreCloseChecklistCard } from './pre-close-checklist-card';

import styles from './close-business-day-page.module.css';

export function CloseBusinessDayPage() {
  return (
    <div className={styles.page}>
      <CloseBusinessDayHeader />
      <CurrentDayInfoCard />
      <PreCloseChecklistCard />
      <CloseBusinessDayActions />
    </div>
  );
}
