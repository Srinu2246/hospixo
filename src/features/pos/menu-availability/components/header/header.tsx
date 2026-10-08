import { menuAvailabilityCopy } from '@/features/pos/menu-availability/config';

import styles from './header.module.css';

export function MenuAvailabilityHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.titles}>
        <h1 className={styles.title}>{menuAvailabilityCopy.title}</h1>
        <p className={styles.subtitle}>{menuAvailabilityCopy.subtitle}</p>
      </div>
      <span className={styles.synced}>{menuAvailabilityCopy.synced}</span>
    </header>
  );
}
