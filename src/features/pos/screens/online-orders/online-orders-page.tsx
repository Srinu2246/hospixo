'use client';

import { ResponsivePosContent } from '@/features/pos/screens/shared/responsive-pos-content';

import { OnlineOrdersDesktopContent } from './desktop-content';
import { OnlineOrdersMobileContent } from './mobile-content';
import { OnlineOrdersTabletContent } from './tablet-content';
import { useOnlineOrdersPage } from './use-online-orders-page';

export function OnlineOrdersPage() {
  const page = useOnlineOrdersPage();

  return (
    <ResponsivePosContent
      desktop={OnlineOrdersDesktopContent}
      tablet={OnlineOrdersTabletContent}
      mobile={OnlineOrdersMobileContent}
      props={page}
    />
  );
}
