'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Power } from 'lucide-react';

import { resolveCashShiftHref } from '@/config/shell/flow-paths';
import { closeBusinessDayPageMeta } from '@/features/pos/day-close/config/close-business-day';

import styles from './close-business-day-actions.module.css';

export function CloseBusinessDayActions() {
  const router = useRouter();
  const pathname = usePathname();
  const cashShiftHref = resolveCashShiftHref(pathname);

  return (
    <div className={styles.actions}>
      <button type="button" className={styles.cancelBtn} onClick={() => router.push(cashShiftHref)}>
        {closeBusinessDayPageMeta.cancelLabel}
      </button>
      <button
        type="button"
        className={styles.initiateBtn}
        onClick={() => router.push(closeBusinessDayPageMeta.initiateHref)}
      >
        <Power size={16} aria-hidden />
        {closeBusinessDayPageMeta.initiateLabel}
      </button>
    </div>
  );
}
