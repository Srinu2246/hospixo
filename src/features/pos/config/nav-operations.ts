import { routes } from '@/config/routes';

import { resolvePosFlowPaths, type PosFlowPaths } from '@/features/pos/lib/pos-flow-paths';

export type PosOperationsIconKey =
  | 'dashboard'
  | 'tables'
  | 'kitchenKds'
  | 'openOrders'
  | 'dineIn'
  | 'readyList'
  | 'onlineOrders'
  | 'duePayments'
  | 'checkoutPayment'
  | 'menuAvailability'
  | 'menuManager'
  | 'cashShift'
  | 'reports'
  | 'mealReports'
  | 'breakfastReport'
  | 'lunchReport'
  | 'snacksReport'
  | 'settings'
  | 'setupHub'
  | 'staffRoles'
  | 'taxes'
  | 'devices';

export interface PosOperationsNavItem {
  href: string;
  label: string;
  icon: PosOperationsIconKey;
}

export interface PosOperationsNavSection {
  id: string;
  title?: string;
  items: PosOperationsNavItem[];
}

export interface PosOperationsProfile {
  name: string;
  role: string;
  avatarSrc?: string;
}

export interface PosOperationsSidebarConfig {
  sections: PosOperationsNavSection[];
  profile: PosOperationsProfile;
  brandHref: string;
  showCollapse?: boolean;
  showUpgrade?: boolean;
}

/** Captain mobile hamburger — floor service only (distinct from full POS operations nav). */
export function buildCaptainOperationsNavSections(paths: PosFlowPaths): PosOperationsNavSection[] {
  return [
    {
      id: 'captain',
      items: [
        { href: paths.tables, label: 'Tables', icon: 'tables' },
        { href: paths.dineIn, label: 'Dine In', icon: 'dineIn' },
        { href: paths.ready, label: 'Ready Orders', icon: 'readyList' },
        { href: paths.orders, label: 'Orders', icon: 'openOrders' },
        {
          href: paths.menuAvailability,
          label: 'Menu Availability',
          icon: 'menuAvailability',
        },
      ],
    },
  ];
}

/** Full POS operations nav for platform and branch flows. */
export function buildPlatformOperationsNavSections(paths: PosFlowPaths): PosOperationsNavSection[] {
  return [
    {
      id: 'operations',
      items: [
        { href: paths.dashboard, label: 'Dashboard', icon: 'dashboard' },
        { href: paths.tables, label: 'Tables', icon: 'tables' },
        { href: paths.dineIn, label: 'Dine In', icon: 'dineIn' },
        { href: paths.ready, label: 'Ready List', icon: 'readyList' },
        { href: paths.onlineOrders, label: 'Online Orders', icon: 'onlineOrders' },
        { href: paths.orders, label: 'All Orders', icon: 'openOrders' },
        { href: paths.cashShift, label: 'Cash Shift', icon: 'cashShift' },
        { href: paths.duePayments, label: 'Due Payments', icon: 'duePayments' },
      ],
    },
  ];
}

/** Build operations nav from the active flow paths (platform / captain / branch). */
export function buildPosOperationsNavSections(paths: PosFlowPaths): PosOperationsNavSection[] {
  if (paths.id === 'captain') {
    return buildCaptainOperationsNavSections(paths);
  }
  return buildPlatformOperationsNavSections(paths);
}

/** Default sidebar for Tables, Orders, and other platform POS operation screens. */
export const posOperationsNavSections: PosOperationsNavSection[] = buildPosOperationsNavSections(
  resolvePosFlowPaths(routes.platform.pos.tables),
);

const pos = routes.platform.pos;

/** Centralized page titles for the shared POS tablet/desktop header. */
export const posPageTitles: Record<string, string> = {
  [pos.dashboard]: 'POS Dashboard',
  [pos.tables]: 'Tables',
  [pos.dineIn]: 'Order Menu',
  [pos.readyList]: 'Ready List',
  [pos.onlineOrders]: 'Online Orders',
  [pos.openOrders]: 'All Orders',
  [pos.duePayments]: 'Due Payments',
  [pos.checkoutPayment]: 'Checkout Payment',
  [pos.paymentSuccess]: 'Payment Success',
};

export const posOperationsProfile: PosOperationsProfile = {
  name: 'Ravi Kumar',
  role: 'Counter 1',
  avatarSrc: '/images/pos/avatar-ravi.jpg',
};

export const posOperationsOutlet = {
  label: 'Outlets',
  name: 'Hotel Mayukha Jungle Th...',
};
