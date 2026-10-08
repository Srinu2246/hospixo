'use client';

import {
  PosCompactBody,
  PosCompactHeader,
  PosCompactPage,
} from '@/features/pos/screens/layout/pos-compact-page';
import { PosMobileHeader } from '@/features/pos/screens/layout/pos-mobile-header';
import { PosMobileShell } from '@/features/pos/screens/layout/pos-mobile-shell';

import {
  PosDashboardContent,
  posDashboardMobileSubtitle,
  posDashboardMobileTitle,
} from './pos-dashboard-content';
import styles from './compact-pos-dashboard-content.module.css';

interface CompactPosDashboardContentProps {
  layout: 'mobile' | 'tablet';
}

export function CompactPosDashboardContent({ layout }: Readonly<CompactPosDashboardContentProps>) {
  return (
    <PosMobileShell bottomNavVariant="dashboard" withPageBg>
      <PosCompactPage className={layout === 'tablet' ? styles.tablet : undefined}>
        <PosCompactHeader>
          <PosMobileHeader
            title={posDashboardMobileTitle}
            subtitle={posDashboardMobileSubtitle}
            sidebarVariant="dashboard"
          />
        </PosCompactHeader>
        <PosCompactBody className={styles.body}>
          <PosDashboardContent />
        </PosCompactBody>
      </PosCompactPage>
    </PosMobileShell>
  );
}
