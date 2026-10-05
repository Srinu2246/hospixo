import type { PosOperationsIconKey } from '@/features/pos/config/nav-operations';

/** Stub until POS module is ported — keeps access-navigation compiling. */
export const posDashboardNavSections: ReadonlyArray<{
  id: string;
  title: string;
  items: ReadonlyArray<{ href: string; label: string; icon: PosOperationsIconKey }>;
}> = [];
