'use client';

import { ResponsivePosContent } from '@/features/pos/screens/shared/responsive-pos-content';
import { TablesDesktopContent } from './desktop-content';
import { TablesMobileContent } from './mobile-content';
import { TablesTabletContent } from './tablet-content';
import { useTablesPage } from './use-tables-page';

export function TablesPage() {
  const page = useTablesPage();

  return (
    <ResponsivePosContent
      desktop={TablesDesktopContent}
      tablet={TablesTabletContent}
      mobile={TablesMobileContent}
      props={page}
    />
  );
}
