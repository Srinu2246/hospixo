'use client';

import {
  PosCompactBody,
  PosCompactHeader,
  PosCompactPage,
} from '@/features/pos/screens/layout/pos-compact-page';
import { PosMobileHeader } from '@/features/pos/screens/layout/pos-mobile-header';
import { PosMobileShell } from '@/features/pos/screens/layout/pos-mobile-shell';

import { DuePaymentsPanel } from './due-payments-panel';
import type { DuePaymentsPageViewModel } from './use-due-payments-page';
import styles from './compact-due-payments-content.module.css';

interface CompactDuePaymentsContentProps extends DuePaymentsPageViewModel {
  layout: 'mobile' | 'tablet';
}

export function CompactDuePaymentsContent({
  layout,
  ...page
}: Readonly<CompactDuePaymentsContentProps>) {
  return (
    <PosMobileShell activeNavId="tables" withPageBg>
      <PosCompactPage className={layout === 'tablet' ? styles.tablet : undefined}>
        <PosCompactHeader>
          <PosMobileHeader title="Due Payments" subtitle="Settle guest dues from POS" />
        </PosCompactHeader>
        <PosCompactBody className={styles.body}>
          <DuePaymentsPanel {...page} hideTitle />
        </PosCompactBody>
      </PosCompactPage>
    </PosMobileShell>
  );
}
