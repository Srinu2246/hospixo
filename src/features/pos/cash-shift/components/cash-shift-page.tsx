'use client';

import { CashShift } from '@/features/pos/cash-shift/components/cash-shift';
import { cashShiftCopy } from '@/features/pos/cash-shift/config';
import { PosMobileHeader } from '@/features/pos/screens/layout/pos-mobile-header';
import { PosMobileShell } from '@/features/pos/screens/layout/pos-mobile-shell';
import { PosOperationsShell } from '@/features/pos/screens/layout/pos-operations-shell';
import { ResponsivePosContent } from '@/features/pos/screens/shared/responsive-pos-content';
import type {
  ActiveCashShift,
  CashShiftDateFilter,
  CashShiftMetrics,
  CashTransaction,
  CloseShiftPreview,
  StartShiftDraft,
} from '@/features/pos/types/cash-shift';

export type CashShiftPageProps = Readonly<{
  metrics: CashShiftMetrics;
  activeShift: ActiveCashShift;
  transactions: readonly CashTransaction[];
  dateFilter: CashShiftDateFilter;
  closePreview: CloseShiftPreview;
  startDraft: StartShiftDraft;
}>;

function CashShiftDesktopContent(props: CashShiftPageProps) {
  return (
    <PosOperationsShell withPageBg>
      <CashShift {...props} />
    </PosOperationsShell>
  );
}

function CompactCashShiftContent(props: CashShiftPageProps) {
  return (
    <PosMobileShell activeNavId="tables" withPageBg>
      <PosMobileHeader title={cashShiftCopy.title} subtitle={cashShiftCopy.subtitle} />
      <CashShift {...props} compact />
    </PosMobileShell>
  );
}

function CashShiftMobileContent(props: CashShiftPageProps) {
  return <CompactCashShiftContent {...props} />;
}

function CashShiftTabletContent(props: CashShiftPageProps) {
  return <CompactCashShiftContent {...props} />;
}

/** Responsive Cash & Shift entry — desktop ops shell, mobile/tablet hamburger header. */
export function CashShiftPage(props: CashShiftPageProps) {
  return (
    <ResponsivePosContent
      desktop={CashShiftDesktopContent}
      tablet={CashShiftTabletContent}
      mobile={CashShiftMobileContent}
      props={props}
    />
  );
}
