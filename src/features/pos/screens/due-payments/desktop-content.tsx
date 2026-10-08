'use client';

import { PosOperationsShell } from '@/features/pos/screens/layout/pos-operations-shell';

import { DuePaymentsPanel } from './due-payments-panel';
import type { DuePaymentsPageViewModel } from './use-due-payments-page';
import styles from './due-payments-page.module.css';

export function DuePaymentsDesktopContent(props: Readonly<DuePaymentsPageViewModel>) {
  return (
    <PosOperationsShell withPageBg>
      <main className={styles.page}>
        <DuePaymentsPanel {...props} />
      </main>
    </PosOperationsShell>
  );
}
