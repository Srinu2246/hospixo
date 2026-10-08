'use client';

import { ResponsivePosContent } from '@/features/pos/screens/shared/responsive-pos-content';

import { DuePaymentsDesktopContent } from './desktop-content';
import { DuePaymentsMobileContent } from './mobile-content';
import { DuePaymentsTabletContent } from './tablet-content';
import { useDuePaymentsPage } from './use-due-payments-page';

export function DuePaymentsPage() {
  const page = useDuePaymentsPage();

  return (
    <ResponsivePosContent
      desktop={DuePaymentsDesktopContent}
      tablet={DuePaymentsTabletContent}
      mobile={DuePaymentsMobileContent}
      props={page}
    />
  );
}
