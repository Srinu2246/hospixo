import { routes } from '@/config/routes';

import { resolvePosFlowPaths, type PosFlowPaths } from '@/features/pos/lib/pos-flow-paths';

export type PosFlowIconKey =
  | 'dashboard'
  | 'dineIn'
  | 'openOrders'
  | 'onlineOrders'
  | 'checkoutPayment'
  | 'inventory'
  | 'financials'
  | 'staff'
  | 'settings';

export interface PosFlowNavItem {
  id: string;
  href: string;
  label: string;
  icon: PosFlowIconKey;
}

/** Build dine-in flow sidenav from the active workspace flow paths. */
export function buildPosFlowNavItems(paths: PosFlowPaths): PosFlowNavItem[] {
  return [
    { id: 'dashboard', href: paths.dashboard, label: 'Dashboard', icon: 'dashboard' },
    { id: 'dine-in', href: paths.dineIn, label: 'Dine-In', icon: 'dineIn' },
    { id: 'open-orders', href: paths.orders, label: 'Open Orders', icon: 'openOrders' },
    { id: 'online-orders', href: paths.onlineOrders, label: 'Online Orders', icon: 'onlineOrders' },
    {
      id: 'checkout-payment',
      href: paths.checkout,
      label: 'Checkout & Payment',
      icon: 'checkoutPayment',
    },
    { id: 'inventory', href: '#inventory', label: 'Inventory', icon: 'inventory' },
    { id: 'financials', href: '#financials', label: 'Financials', icon: 'financials' },
    { id: 'staff', href: '#staff', label: 'Staff', icon: 'staff' },
  ];
}

/**
 * Common sidenav for Dine-In flow screens (screen 2+).
 * Prefer `buildPosFlowNavItems(usePosFlowPaths())` in components.
 */
export const posFlowNavItems: PosFlowNavItem[] = buildPosFlowNavItems(
  resolvePosFlowPaths(routes.platform.pos.tables),
);

export const posFlowFooterNav: PosFlowNavItem = {
  id: 'settings',
  href: '#settings',
  label: 'Settings',
  icon: 'settings',
};

export const posFlowProfile = {
  initials: 'CM',
  name: 'Chef Marco',
  role: 'Manager',
};

export const posFlowBrand = {
  title: 'HOSPIXO',
  subtitle: 'OPERATIONS',
};
