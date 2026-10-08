'use client';

import { ResponsivePosContent } from '@/features/pos/screens/shared/responsive-pos-content';
import { OpenOrdersDesktopContent } from './desktop-content';
import { OpenOrdersMobileContent } from './mobile-content';
import { OpenOrdersTabletContent } from './tablet-content';
import { useOpenOrdersPage } from './use-open-orders-page';

export function OpenOrdersPage() {
  const page = useOpenOrdersPage();

  return (
    <ResponsivePosContent
      desktop={OpenOrdersDesktopContent}
      tablet={OpenOrdersTabletContent}
      mobile={OpenOrdersMobileContent}
      props={page}
    />
  );
}
