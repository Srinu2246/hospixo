import { Check } from 'lucide-react';
import Link from 'next/link';

import { successSummaryRows, wizardCopy } from '@/features/floor-table-setup/config';
import { floorTableSetupPath, seatingSummary } from '@/features/floor-table-setup/lib';
import type { FloorSetupDraft } from '@/features/floor-table-setup/types/floor-table-setup';

import styles from './wizard.module.css';

type SuccessStepProps = Readonly<{
  draft: FloorSetupDraft;
  outletId?: string | null;
  branchName?: string | null;
}>;

export function SuccessStep({ draft, outletId = null, branchName = null }: SuccessStepProps) {
  const seating = seatingSummary(draft.tables);
  const reservationsOn = draft.tables.some((table) => table.reservations);
  const values: Record<(typeof successSummaryRows)[number]['id'], string> = {
    name: draft.floor.name,
    seating: `${seating.tables} ${wizardCopy.tablesUnit} - ${seating.seats} ${wizardCopy.seatsUnit}`,
    reservations: reservationsOn ? wizardCopy.reservationsOnline : wizardCopy.reservationsOffline,
  };

  return (
    <section className={styles.success}>
      <div className={styles.successIcon} aria-hidden="true">
        <Check className={styles.icon} />
      </div>
      <h1 className={styles.successTitle}>{wizardCopy.successTitle}</h1>
      <p className={styles.successText}>
        {wizardCopy.successDescription(draft.floor.name, branchName?.trim() || 'this outlet')}
      </p>
      <dl className={styles.summary}>
        {successSummaryRows.map((row) => (
          <div key={row.id} className={styles.summaryRow}>
            <dt className={styles.summaryLabel}>{row.label}</dt>
            <dd
              className={
                row.id === 'reservations' && reservationsOn
                  ? `${styles.summaryValue} ${styles.online}`
                  : styles.summaryValue
              }
            >
              {values[row.id]}
            </dd>
          </div>
        ))}
      </dl>
      <div className={styles.successActions}>
        <Link href={floorTableSetupPath(outletId)} className={styles.secondary}>
          {wizardCopy.successHub}
        </Link>
        <Link href={floorTableSetupPath(outletId)} className={styles.primary}>
          {wizardCopy.successSetup}
        </Link>
      </div>
    </section>
  );
}
