'use client';

import { PosOperationsShell } from '@/features/pos/screens/layout/pos-operations-shell';

import { PosDashboardContent } from './pos-dashboard-content';

export function PosDashboardDesktopContent() {
  return (
    <PosOperationsShell sidebarVariant="dashboard" withPageBg>
      <PosDashboardContent />
    </PosOperationsShell>
  );
}
