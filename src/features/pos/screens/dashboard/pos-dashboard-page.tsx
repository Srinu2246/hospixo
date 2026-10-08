'use client';

import { ResponsivePosContent } from '@/features/pos/screens/shared/responsive-pos-content';

import { PosDashboardDesktopContent } from './desktop-content';
import { PosDashboardMobileContent } from './mobile-content';
import { PosDashboardTabletContent } from './tablet-content';

export function PosDashboardPage() {
  return (
    <ResponsivePosContent
      desktop={PosDashboardDesktopContent}
      tablet={PosDashboardTabletContent}
      mobile={PosDashboardMobileContent}
      props={{}}
    />
  );
}
