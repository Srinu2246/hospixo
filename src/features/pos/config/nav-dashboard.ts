import { routes } from '@/config/routes';

import type { PosOperationsNavSection } from '@/features/pos/config/nav-operations';

const pos = routes.platform.pos;

/** POS Captain navigation used by the POS dashboard and its operation pages. */
export const posDashboardNavSections: PosOperationsNavSection[] = [
  {
    id: 'operations',
    title: 'POS',
    items: [
      { href: pos.tables, label: 'Tables', icon: 'tables' },
      { href: pos.dineIn, label: 'Dine-In', icon: 'dineIn' },
      { href: pos.readyList, label: 'Ready List', icon: 'readyList' },
      { href: pos.openOrders, label: 'All Orders', icon: 'openOrders' },
      { href: pos.onlineOrders, label: 'Live Orders', icon: 'onlineOrders' },
      { href: pos.duePayments, label: 'Due Payments', icon: 'duePayments' },
      { href: pos.cashShift, label: 'Cash Counter', icon: 'cashShift' },
      { href: routes.dashboard.kitchen, label: 'Kitchen Display', icon: 'kitchenKds' },
    ],
  },
];

export const posDashboardProfile = {
  name: 'Ravi Kumar',
  role: 'admin',
  avatarSrc: '/images/pos/avatar-ravi.jpg',
};
