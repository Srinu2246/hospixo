import type { ElementType } from 'react';
import {
  Building2,
  CalendarDays,
  ChartColumn,
  ChefHat,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  CreditCard,
  Globe,
  LayoutDashboard,
  LayoutGrid,
  Layers,
  ListOrdered,
  Package,
  Percent,
  Receipt,
  Settings,
  ShoppingBag,
  Store,
  TableProperties,
  Tags,
  UserCircle2,
  Users,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react';

import type { AccessLevel } from '@/lib/auth/access-level';
import { routes } from '@/config/routes';
import { flowPaths } from '@/config/shell/flow-paths';
import { posDashboardNavSections } from '@/features/pos/config/nav-dashboard';
import type { PosOperationsIconKey } from '@/features/pos/config/nav-operations';

export type AccessNavItem = Readonly<{
  id: string;
  href: string;
  label: string;
  icon: ElementType;
}>;

export type AccessNavGroup = Readonly<{
  id: string;
  /** Empty / omitted = flat item block (no section label). */
  label?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  items: readonly AccessNavItem[];
}>;

export type AccessSidebarConfig = Readonly<{
  level: AccessLevel;
  title: string;
  profileRole: string;
  homeHref: string;
  navAriaLabel: string;
  headerIcon: ElementType;
  groups: readonly AccessNavGroup[];
}>;

const pos = routes.dashboard.pos;
const org = routes.dashboard.organisation;
const company = routes.dashboard.company;
const branch = flowPaths.branch;
const companyMenu = flowPaths.company;
const captain = flowPaths.captain;
const cashier = flowPaths.cashier;
const kitchen = routes.dashboard.kitchen;
const settings = routes.dashboard.settings;
const orgEmployees = routes.platform.employees.organisation;
const companyEmployees = routes.platform.employees.company;
const branchEmployees = routes.platform.employees.branch;

const posNavIcons: Record<PosOperationsIconKey, ElementType> = {
  dashboard: LayoutDashboard,
  tables: LayoutGrid,
  kitchenKds: ClipboardList,
  openOrders: ShoppingBag,
  dineIn: UtensilsCrossed,
  readyList: ClipboardList,
  onlineOrders: Globe,
  duePayments: CircleDollarSign,
  checkoutPayment: CreditCard,
  menuAvailability: UtensilsCrossed,
  menuManager: Store,
  cashShift: Wallet,
  reports: ChartColumn,
  mealReports: ChartColumn,
  breakfastReport: ChartColumn,
  lunchReport: ChartColumn,
  snacksReport: ChartColumn,
  settings: Settings,
  setupHub: Settings,
  staffRoles: Users,
  taxes: Percent,
  devices: Package,
};

/**
 * Organisation owner — only place that lists Companies + Branches together.
 * Company sidebars list Branches only; branch sidebars list neither.
 */
export const organisationSidebar: AccessSidebarConfig = {
  level: 'organisation',
  title: 'Organization',
  profileRole: 'Organisation owner',
  homeHref: org,
  navAriaLabel: 'Organisation navigation',
  headerIcon: Building2,
  groups: [
    {
      id: 'home',
      items: [{ id: 'dashboard', href: org, label: 'Dashboard', icon: LayoutDashboard }],
    },
    {
      id: 'companies',
      label: 'Companies',
      collapsible: true,
      defaultOpen: true,
      items: [
        { id: 'all-companies', href: `${org}/companies`, label: 'All Companies', icon: Building2 },
        {
          id: 'company-analytics',
          href: `${org}/companies/analytics`,
          label: 'Company Analytics',
          icon: ChartColumn,
        },
      ],
    },
    {
      id: 'branches',
      label: 'Branches',
      collapsible: true,
      defaultOpen: true,
      items: [
        { id: 'all-branches', href: `${org}/branches`, label: 'All Branches', icon: Store },
        {
          id: 'branch-performance',
          href: `${org}/branches/performance`,
          label: 'Branch Performance',
          icon: ChartColumn,
        },
      ],
    },
    {
      id: 'employees',
      label: 'Employees',
      collapsible: true,
      defaultOpen: true,
      items: [
        { id: 'all-employees', href: orgEmployees, label: 'Users & Roles', icon: Users },
        {
          id: 'attendance',
          href: `${routes.dashboard.hr}/attendance`,
          label: 'Attendance',
          icon: Clock3,
        },
      ],
    },
    {
      id: 'menu',
      label: 'Menu',
      collapsible: true,
      defaultOpen: false,
      items: [
        {
          id: 'menu-creation',
          href: flowPaths.company.menuCreation,
          label: 'Menu Creation',
          icon: UtensilsCrossed,
        },
        {
          id: 'menus',
          href: flowPaths.company.menus,
          label: 'Menus',
          icon: CalendarDays,
        },
        {
          id: 'menu-management',
          href: flowPaths.company.menuManagement,
          label: 'Menu Management',
          icon: Store,
        },
        {
          id: 'menu-fields',
          href: flowPaths.company.menuFields,
          label: 'Menu Builder',
          icon: Tags,
        },
      ],
    },

    {
      id: 'reports',
      label: 'Reports',
      collapsible: true,
      defaultOpen: false,
      items: [
        {
          id: 'sales',
          href: `${routes.dashboard.reports}/sales`,
          label: 'Sales',
          icon: ChartColumn,
        },
        {
          id: 'revenue',
          href: `${routes.dashboard.reports}/revenue`,
          label: 'Revenue',
          icon: CircleDollarSign,
        },
        {
          id: 'expenses',
          href: `${routes.dashboard.reports}/expenses`,
          label: 'Expenses',
          icon: Receipt,
        },
        { id: 'taxes', href: `${routes.dashboard.reports}/taxes`, label: '% Taxes', icon: Percent },
        {
          id: 'analytics',
          href: routes.dashboard.analytics,
          label: 'Analytics',
          icon: ChartColumn,
        },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      collapsible: true,
      defaultOpen: false,
      items: [
        // People live under Employees — never under Settings.
        {
          id: 'org-settings',
          href: `${settings}/organisation`,
          label: 'Organization Settings',
          icon: Settings,
        },
        {
          id: 'subscription',
          href: `${settings}/billing`,
          label: 'Subscription',
          icon: CreditCard,
        },
        {
          id: 'integrations',
          href: `${settings}/integrations`,
          label: 'Integrations',
          icon: Package,
        },
      ],
    },
  ],
};

/** Company login — Branches under this company only (no Companies group). */
export const companySidebar: AccessSidebarConfig = {
  level: 'company',
  title: 'Company',
  profileRole: 'Company manager',
  homeHref: company,
  navAriaLabel: 'Company navigation',
  headerIcon: Building2,
  groups: [
    {
      id: 'home',
      items: [{ id: 'dashboard', href: company, label: 'Dashboard', icon: LayoutDashboard }],
    },
    {
      id: 'branches',
      label: 'Branches',
      collapsible: true,
      defaultOpen: true,
      items: [
        { id: 'all-branches', href: `${company}/branches`, label: 'All Branches', icon: Store },
        {
          id: 'branch-analytics',
          href: `${company}/branches/analytics`,
          label: 'Branch Analytics',
          icon: ChartColumn,
        },
        {
          id: 'branch-performance',
          href: `${company}/branches/performance`,
          label: 'Branch Performance',
          icon: ChartColumn,
        },
      ],
    },
    {
      id: 'employees',
      label: 'Employees',
      collapsible: true,
      defaultOpen: true,
      items: [
        { id: 'employees', href: companyEmployees, label: 'Users & Roles', icon: Users },
        {
          id: 'attendance',
          href: `${routes.dashboard.hr}/attendance`,
          label: 'Attendance',
          icon: Clock3,
        },
      ],
    },
    {
      id: 'menu',
      label: 'Menu',
      collapsible: true,
      defaultOpen: true,
      items: [
        {
          id: 'menu-creation',
          href: flowPaths.company.menuCreation,
          label: 'Menu Creation',
          icon: UtensilsCrossed,
        },
        {
          id: 'menus',
          href: flowPaths.company.menus,
          label: 'Menus',
          icon: CalendarDays,
        },
        {
          id: 'gst-rates',
          href: companyMenu.gstRates,
          label: 'GST Rates',
          icon: Percent,
        },
        {
          id: 'preparation-stations',
          href: companyMenu.preparationStations,
          label: 'Prep Stations',
          icon: ChefHat,
        },
        {
          id: 'modifier-groups',
          href: companyMenu.modifierGroups,
          label: 'Modifier Groups',
          icon: Layers,
        },
      ],
    },
    {
      id: 'operations',
      label: 'Operations',
      collapsible: true,
      defaultOpen: true,
      items: [
        { id: 'orders', href: `${pos}/orders`, label: 'Orders', icon: ShoppingBag },
        { id: 'kitchen-display', href: kitchen, label: 'Kitchen Display', icon: ChefHat },
        { id: 'cash', href: routes.platform.pos.cashShift, label: 'Cash Counter', icon: Wallet },
        { id: 'inventory', href: routes.dashboard.inventory, label: 'Inventory', icon: Package },
        { id: 'customers', href: `${company}/customers`, label: 'Customers', icon: UserCircle2 },
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      collapsible: true,
      defaultOpen: false,
      items: [
        {
          id: 'sales',
          href: `${routes.dashboard.reports}/sales`,
          label: 'Sales',
          icon: ChartColumn,
        },
        {
          id: 'revenue',
          href: `${routes.dashboard.reports}/revenue`,
          label: 'Revenue',
          icon: CircleDollarSign,
        },
        {
          id: 'analytics',
          href: routes.dashboard.analytics,
          label: 'Analytics',
          icon: ChartColumn,
        },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      collapsible: true,
      defaultOpen: false,
      items: [
        {
          id: 'company-settings',
          href: `${settings}/company`,
          label: 'Company Settings',
          icon: Settings,
        },
      ],
    },
  ],
};

/**
 * Branch manager — full floor ops under `/branch/*`.
 * Captain Flow is an explicit Create entry; its route owns the captain shell.
 */
export const branchSidebar: AccessSidebarConfig = {
  level: 'branch',
  title: 'Branch',
  profileRole: 'Branch manager',
  homeHref: branch.root,
  navAriaLabel: 'Branch navigation',
  headerIcon: Store,
  groups: [
    {
      id: 'home',
      items: [{ id: 'dashboard', href: branch.root, label: 'Dashboard', icon: LayoutDashboard }],
    },
    {
      id: 'employees',
      label: 'Employees',
      collapsible: true,
      defaultOpen: true,
      items: [
        { id: 'staff', href: branchEmployees, label: 'Users & Roles', icon: Users },
        { id: 'attendance', href: branch.hrAttendance, label: 'Attendance', icon: Clock3 },
        { id: 'schedule', href: branch.hrSchedule, label: 'Schedule', icon: CalendarDays },
      ],
    },
    {
      id: 'create',
      label: 'POS',
      collapsible: true,
      defaultOpen: true,
      items: [
        {
          id: 'pos',
          href: routes.platform.pos.dashboard,
          label: 'Point of Sale',
          icon: ShoppingBag,
        },
        {
          id: 'captain-flow',
          href: captain.root,
          label: 'Captain Flow',
          icon: UserCircle2,
        },
      ],
    },
    {
      id: 'orders',
      label: 'Orders',
      collapsible: true,
      defaultOpen: true,
      items: [
        {
          id: 'online-orders',
          href: branch.onlineOrders,
          label: 'Online Orders',
          icon: Globe,
        },
        {
          id: 'live-orders',
          href: branch.orders,
          label: 'Live Orders',
          icon: ListOrdered,
        },
        {
          id: 'ready-orders',
          href: branch.ready,
          label: 'Ready Orders',
          icon: ClipboardList,
        },
        {
          id: 'all-orders',
          href: branch.orders,
          label: 'All Orders',
          icon: ShoppingBag,
        },
      ],
    },
    {
      id: 'menu',
      label: 'Menu',
      collapsible: true,
      defaultOpen: true,
      items: [
        {
          id: 'menu-creation',
          href: branch.menuCreation,
          label: 'Menu Creation',
          icon: UtensilsCrossed,
        },
        {
          id: 'menus',
          href: branch.menus,
          label: 'Menus',
          icon: CalendarDays,
        },
        {
          id: 'gst-rates',
          href: branch.gstRates,
          label: 'GST Rates',
          icon: Percent,
        },
        {
          id: 'preparation-stations',
          href: branch.preparationStations,
          label: 'Prep Stations',
          icon: ChefHat,
        },
        {
          id: 'modifier-groups',
          href: branch.modifierGroups,
          label: 'Modifier Groups',
          icon: Layers,
        },
        {
          id: 'menu-availability',
          href: branch.menuAvailability,
          label: 'Menu Availability',
          icon: Package,
        },
      ],
    },
    {
      id: 'management',
      label: 'Management',
      collapsible: true,
      defaultOpen: true,
      items: [
        { id: 'tables', href: branch.tables, label: 'Tables', icon: LayoutGrid },
        { id: 'dine-in', href: branch.dineIn, label: 'Dine-In', icon: UtensilsCrossed },
        { id: 'cash-shift', href: branch.cashShift, label: 'Cash Counter', icon: Wallet },
        {
          id: 'due-payments',
          href: branch.duePayments,
          label: 'Due Payments',
          icon: CircleDollarSign,
        },
        { id: 'kitchen', href: branch.kitchen, label: 'Kitchen Display', icon: ChefHat },
        { id: 'inventory', href: branch.inventory, label: 'Inventory', icon: Package },
        { id: 'customers', href: branch.customers, label: 'Customers', icon: UserCircle2 },
        { id: 'reports', href: branch.reports, label: 'Reports', icon: ChartColumn },
        { id: 'settings', href: branch.settings, label: 'Settings', icon: Settings },
        {
          id: 'floor-table-setup',
          href: branch.floorTableSetup,
          label: 'Floor & Table Set-up',
          icon: TableProperties,
        },
      ],
    },
  ],
};

/** Branch POS mode — derived from the shared POS Captain navigation config. */
export const branchPosSidebar: AccessSidebarConfig = {
  level: 'branch',
  title: 'POS',
  profileRole: 'Branch manager',
  homeHref: routes.platform.pos.dashboard,
  navAriaLabel: 'POS navigation',
  headerIcon: ShoppingBag,
  groups: posDashboardNavSections.map((section) => ({
    id: `pos-${section.id}`,
    label: section.title,
    items: section.items.map((item) => ({
      id: `pos-${item.href}-${item.label}`,
      href: item.href,
      label: item.label,
      icon: posNavIcons[item.icon],
    })),
  })),
};

/** Cashier — orders, billing, payments, reports (fixed cashier sidebar). */
export const counterSidebar: AccessSidebarConfig = {
  level: 'counter',
  title: 'Cashier',
  profileRole: 'Cashier',
  homeHref: cashier.root,
  navAriaLabel: 'Cashier navigation',
  headerIcon: Wallet,
  groups: [
    {
      id: 'main',
      items: [
        { id: 'dashboard', href: cashier.root, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'tables', href: cashier.tables, label: 'New Order', icon: TableProperties },
        { id: 'orders', href: cashier.orders, label: 'Orders', icon: ShoppingBag },
        { id: 'dine-in', href: cashier.dineIn, label: 'Dine-In', icon: UtensilsCrossed },
        { id: 'billing', href: cashier.billing, label: 'Billing', icon: Receipt },
        { id: 'payments', href: cashier.payments, label: 'Payments', icon: CreditCard },
        { id: 'customers', href: cashier.customers, label: 'Customers', icon: UserCircle2 },
        { id: 'reports', href: cashier.reports, label: 'Reports', icon: ChartColumn },
      ],
    },
  ],
};

/** Captain — tables, menu, and floor orders (fixed captain sidebar). */
export const captainSidebar: AccessSidebarConfig = {
  level: 'captain',
  title: 'Captain',
  profileRole: 'Captain',
  homeHref: captain.root,
  navAriaLabel: 'Captain navigation',
  headerIcon: UserCircle2,
  groups: [
    {
      id: 'main',
      items: [
        { id: 'tables', href: captain.tables, label: 'Tables', icon: TableProperties },
        { id: 'orders', href: captain.orders, label: 'Orders', icon: ShoppingBag },
        { id: 'dine-in', href: captain.dineIn, label: 'Dine-In', icon: UtensilsCrossed },
        { id: 'ready', href: captain.ready, label: 'Ready Orders', icon: ClipboardList },
        {
          id: 'menu-availability',
          href: captain.menuAvailability,
          label: 'Menu Availability',
          icon: Package,
        },
      ],
    },
  ],
};

/** Kitchen display nav — used on `/kitchen` (managers). Chefs use `/chef` with no sidebar. */
export const kitchenSidebar: AccessSidebarConfig = {
  level: 'kitchen',
  title: 'Kitchen',
  profileRole: 'Kitchen',
  homeHref: kitchen,
  navAriaLabel: 'Kitchen navigation',
  headerIcon: ChefHat,
  groups: [
    {
      id: 'main',
      items: [
        { id: 'screen', href: kitchen, label: 'Kitchen Display', icon: ChefHat },
        {
          id: 'incoming',
          href: `${kitchen}/incoming`,
          label: 'Incoming Orders',
          icon: ClipboardList,
        },
        { id: 'preparing', href: `${kitchen}/preparing`, label: 'Preparing', icon: Clock3 },
        { id: 'ready', href: `${kitchen}/ready`, label: 'Ready Orders', icon: ShoppingBag },
      ],
    },
  ],
};

export const accessSidebars: Record<AccessLevel, AccessSidebarConfig> = {
  organisation: organisationSidebar,
  company: companySidebar,
  branch: branchSidebar,
  counter: counterSidebar,
  captain: captainSidebar,
  kitchen: kitchenSidebar,
};

export function getAccessSidebar(level: AccessLevel): AccessSidebarConfig {
  return accessSidebars[level];
}
