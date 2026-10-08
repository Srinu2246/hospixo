'use client';

import { ResponsivePosContent } from '@/features/pos/screens/shared/responsive-pos-content';
import { DineInDesktopContent } from './desktop-content';
import { DineInMobileContent } from './mobile-content';
import { DineInTabletContent } from './tablet-content';
import { useDineInPage } from './use-dine-in-page';

export function DineInPage() {
  const page = useDineInPage();

  return (
    <ResponsivePosContent
      desktop={DineInDesktopContent}
      tablet={DineInTabletContent}
      mobile={DineInMobileContent}
      props={page}
    />
  );
}
