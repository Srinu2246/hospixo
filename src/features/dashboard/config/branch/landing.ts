import {
  Banknote,
  ChefHat,
  CircleDollarSign,
  ClipboardList,
  Globe,
  LayoutGrid,
  ListOrdered,
  Package,
  ShoppingBag,
  Users,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react';

import { flowPaths } from '@/config/shell/flow-paths';
import { routes } from '@/config/routes';

const branch = flowPaths.branch;

export const branchLandingContent = {
  header: {
    title: 'Branch operations',
    subtitle: 'Full branch access — floor, kitchen, counter, and team.',
    branchName: 'Downtown HQ',
    dateRange: 'Today',
  },
  kpis: [
    { key: 'sales', label: 'Sales today', value: '₹1.8L' },
    { key: 'orders', label: 'Open orders', value: '24' },
    { key: 'staff', label: 'Staff on shift', value: '18' },
    { key: 'tables', label: 'Tables occupied', value: '12/28' },
  ],
  modulesTitle: 'Branch modules',
  modulesHint: 'Stay in branch — never redirected to captain or cashier flows.',
  modules: [
    {
      id: 'tables',
      label: 'Tables',
      description: 'Floor map and seating',
      href: routes.platform.pos.tables,
      icon: LayoutGrid,
    },
    {
      id: 'online-orders',
      label: 'Online orders',
      description: 'Aggregator and web tickets',
      href: branch.onlineOrders,
      icon: Globe,
    },
    {
      id: 'live-orders',
      label: 'Live orders',
      description: 'Floor orders right now',
      href: branch.orders,
      icon: ListOrdered,
    },
    {
      id: 'ready-orders',
      label: 'Ready orders',
      description: 'Tickets ready to serve',
      href: branch.ready,
      icon: ClipboardList,
    },
    {
      id: 'all-orders',
      label: 'All orders',
      description: 'Full order history',
      href: branch.orders,
      icon: ShoppingBag,
    },
    {
      id: 'branch-menu',
      label: 'Branch menu',
      description: 'Add or remove items for this branch',
      href: branch.menu,
      icon: UtensilsCrossed,
    },
    {
      id: 'menu-availability',
      label: 'Menu availability',
      description: '86 items and channel stock',
      href: branch.menuAvailability,
      icon: Package,
    },
    {
      id: 'menu-pricing-setup',
      label: 'Menu Pricing Setup',
      description: 'Floor and section price overrides',
      href: branch.menuPricingSetup,
      icon: CircleDollarSign,
    },
    {
      id: 'cash-shift',
      label: 'Cash & shift',
      description: 'Counter cash and shift close',
      href: branch.cashShift,
      icon: Banknote,
    },
    {
      id: 'due-payments',
      label: 'Due payments',
      description: 'Settle outstanding bills',
      href: branch.duePayments,
      icon: Wallet,
    },
    {
      id: 'kitchen',
      label: 'Kitchen display',
      description: 'Live kitchen board with branch sidebar',
      href: branch.kitchen,
      icon: ChefHat,
    },
    {
      id: 'team',
      label: 'Employees',
      description: 'Branch users and roles',
      href: branch.staff,
      icon: Users,
    },
  ],
} as const;
