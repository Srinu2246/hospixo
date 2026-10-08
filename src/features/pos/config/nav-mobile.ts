import { routes } from '@/config/routes';

import type { PosOperationsIconKey } from '@/features/pos/config/nav-operations';
import { resolvePosFlowPaths, type PosFlowPaths } from '@/features/pos/lib/pos-flow-paths';

export type PosMobileNavId = 'tables' | 'menu' | 'ready' | 'orders';

export interface PosMobileNavItem {
  id: PosMobileNavId;
  href: string;
  label: string;
  icon: PosOperationsIconKey;
}

/** Build compact bottom nav from the active workspace flow paths. */
export function buildPosMobileBottomNav(paths: PosFlowPaths): PosMobileNavItem[] {
  return [
    { id: 'tables', href: paths.tables, label: 'Tables', icon: 'tables' },
    { id: 'menu', href: paths.dineIn, label: 'Menu', icon: 'dineIn' },
    { id: 'ready', href: paths.ready, label: 'Ready', icon: 'readyList' },
    { id: 'orders', href: paths.orders, label: 'Orders', icon: 'openOrders' },
  ];
}

export const posMobileBottomNav: PosMobileNavItem[] = buildPosMobileBottomNav(
  resolvePosFlowPaths(routes.platform.pos.tables),
);

export const posMobileOutlet = {
  name: 'Hotel Mayukha Jungle Theme',
};
