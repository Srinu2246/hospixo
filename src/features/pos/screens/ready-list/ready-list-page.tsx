'use client';

import { ResponsivePosContent } from '@/features/pos/screens/shared/responsive-pos-content';
import { ReadyListDesktopContent } from './desktop-content';
import { ReadyListMobileContent } from './mobile-content';
import { ReadyListTabletContent } from './tablet-content';
import { useReadyListPage } from './use-ready-list-page';

export function ReadyListPage() {
  const page = useReadyListPage();

  return (
    <ResponsivePosContent
      desktop={ReadyListDesktopContent}
      tablet={ReadyListTabletContent}
      mobile={ReadyListMobileContent}
      props={page}
    />
  );
}
