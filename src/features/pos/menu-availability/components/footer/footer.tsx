'use client';

import { menuAvailabilityCopy } from '@/features/pos/menu-availability/config';

import styles from './footer.module.css';

type MenuAvailabilityFooterProps = Readonly<{
  changedCount: number;
  eightySixedCount: number;
  onUpdate: () => void;
}>;

export function MenuAvailabilityFooter({
  changedCount,
  eightySixedCount,
  onUpdate,
}: MenuAvailabilityFooterProps) {
  const { footer } = menuAvailabilityCopy;

  return (
    <footer className={styles.footer}>
      <p className={styles.summary}>
        {footer.changed(changedCount)} — {footer.eightySixed(eightySixedCount)}
      </p>
      <button type="button" className={styles.update} onClick={onUpdate}>
        {footer.update}
      </button>
    </footer>
  );
}
