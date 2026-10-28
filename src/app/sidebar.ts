/**
 * Global Sidebar Configuration & RBAC Navigation Resolver
 *
 * Implements role-based and permission-based navigation definitions,
 * dynamic entity route replacement (organization, company, branch),
 * and nested sub-flow navigation (POS, Captain Flow, etc.).
 */

import { FEATURE_FLAGS, isFeatureFlagDefaultOn } from '@/integrations/growthbook/featureFlags';

export type SidebarItem = {
  id?: string | number;
  name: string;
  href?: string;
  icon?: string;
  permission?: string | string[];
  /** GrowthBook nav flag from FEATURE_FLAGS (scope_feature_subfeature_details). */
  featureFlag?: string;
  /**
   * When items are provided, this represents a sub-flow (like POS or Captain Flow)
   * where clicking replaces the main navbar with these items and renders a back button.
   */
  items?: SidebarItem[];
};

export type SidebarSection = {
  name: string;
  icon?: string;
  permission?: string | string[];
  /** GrowthBook nav flag for the whole section (optional). */
  featureFlag?: string;
  items: SidebarItem[];
};

export type SidebarEntry = SidebarItem | SidebarSection;

export function isSidebarSection(entry: SidebarEntry): entry is SidebarSection {
  return 'items' in entry && Array.isArray(entry.items) && !('href' in entry);
}

export type SidebarContext = {
  organizationName?: string;
  organizationSlug?: string;
  organizationId?: number;
  companyName?: string;
  companySlug?: string;
  companyId?: number;
  branchName?: string;
  branchSlug?: string;
  branchId?: number;
};

export type SidebarUserProfile = {
  name: string;
  role: string;
  avatar?: string;
  email?: string;
};

// ----------------------------------------------------------------------
// Permission Catalog (derived from role_permissions.py)
// ----------------------------------------------------------------------

export const PERMISSIONS = {
  COMPANIES_VIEW: 'companies.view',
  COMPANIES_CREATE: 'companies.create',
  COMPANIES_UPDATE: 'companies.update',
  BRANCHES_VIEW: 'branches.view',
  BRANCHES_CREATE: 'branches.create',
  BRANCHES_UPDATE: 'branches.update',
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  ROLES_VIEW: 'roles.view',
  HR_ATTENDANCE_VIEW: 'hr.attendance.view',
  HR_EMPLOYEES_VIEW: 'hr.employees.view',
  MENU_VIEW: 'menu.view',
  MENU_CREATE: 'menu.create',
  MENU_UPDATE: 'menu.update',
  MENU_DELETE: 'menu.delete',
  BRANCH_MENU_VIEW: 'branch_menu.view',
  ORDERS_VIEW: 'orders.view',
  ORDERS_CREATE: 'orders.create',
  ORDERS_UPDATE: 'orders.update',
  ORDERS_UPDATE_STATUS: 'orders.update_status',
  PAYMENTS_VIEW: 'payments.view',
  PAYMENTS_COLLECT: 'payments.collect',
  INVENTORY_VIEW: 'inventory.view',
  TABLES_VIEW: 'tables.view',
  FLOORS_VIEW: 'floors.view',
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',
  GST_VIEW: 'gst.view',
  GST_CONFIGURE: 'gst.configure',
  POS_SESSIONS_OPEN: 'pos_sessions.open',
  POS_SESSIONS_CLOSE: 'pos_sessions.close',
  BOOKINGS_VIEW: 'bookings.view',
  FEATURES_VIEW: 'features.view',
  FEATURES_CONFIGURE: 'features.configure',
} as const;

export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: Object.values(PERMISSIONS),
  org_admin: [
    PERMISSIONS.COMPANIES_VIEW,
    PERMISSIONS.COMPANIES_CREATE,
    PERMISSIONS.COMPANIES_UPDATE,
    PERMISSIONS.BRANCHES_VIEW,
    PERMISSIONS.BRANCHES_CREATE,
    PERMISSIONS.BRANCHES_UPDATE,
    PERMISSIONS.MENU_VIEW,
    PERMISSIONS.MENU_CREATE,
    PERMISSIONS.MENU_UPDATE,
    PERMISSIONS.BRANCH_MENU_VIEW,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.ROLES_VIEW,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.HR_ATTENDANCE_VIEW,
    PERMISSIONS.GST_VIEW,
    PERMISSIONS.FEATURES_VIEW,
    PERMISSIONS.FEATURES_CONFIGURE,
  ],
  company: [
    PERMISSIONS.COMPANIES_VIEW,
    PERMISSIONS.COMPANIES_UPDATE,
    PERMISSIONS.BRANCHES_VIEW,
    PERMISSIONS.BRANCHES_UPDATE,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.ROLES_VIEW,
    PERMISSIONS.HR_ATTENDANCE_VIEW,
    PERMISSIONS.MENU_VIEW,
    PERMISSIONS.MENU_CREATE,
    PERMISSIONS.MENU_UPDATE,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_UPDATE_STATUS,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.GST_VIEW,
    PERMISSIONS.BOOKINGS_VIEW,
  ],
  branch_manager: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.ROLES_VIEW,
    PERMISSIONS.HR_ATTENDANCE_VIEW,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_UPDATE,
    PERMISSIONS.ORDERS_UPDATE_STATUS,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_COLLECT,
    PERMISSIONS.TABLES_VIEW,
    PERMISSIONS.FLOORS_VIEW,
    PERMISSIONS.MENU_VIEW,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.GST_VIEW,
    PERMISSIONS.POS_SESSIONS_OPEN,
  ],
  waiter: [
    PERMISSIONS.FLOORS_VIEW,
    PERMISSIONS.TABLES_VIEW,
    PERMISSIONS.MENU_VIEW,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_UPDATE,
    PERMISSIONS.ORDERS_VIEW,
  ],
  cashier: [
    PERMISSIONS.FLOORS_VIEW,
    PERMISSIONS.TABLES_VIEW,
    PERMISSIONS.MENU_VIEW,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_UPDATE,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_COLLECT,
    PERMISSIONS.BOOKINGS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.POS_SESSIONS_OPEN,
    PERMISSIONS.POS_SESSIONS_CLOSE,
  ],
  kitchen: [PERMISSIONS.ORDERS_VIEW, PERMISSIONS.ORDERS_UPDATE_STATUS, PERMISSIONS.MENU_VIEW],
  chef: [PERMISSIONS.ORDERS_VIEW, PERMISSIONS.ORDERS_UPDATE_STATUS],
};

// ----------------------------------------------------------------------
// Route Resolution (Organization / Company / Branch replacement)
// ----------------------------------------------------------------------

export function resolveSidebarRoute(href: string, context?: SidebarContext, role?: string): string {
  if (!href) return href;
  let resolved = href;

  const org = context?.organizationSlug || context?.organizationName;
  const comp = context?.companySlug || context?.companyName;
  const branch = context?.branchSlug || context?.branchName;

  const targetsBranchScope =
    Boolean(branch) &&
    (/\/branch-manager(\/|$)/.test(resolved) ||
      /\/branch(\/|$)/.test(resolved) ||
      /:branch(\/|$)/.test(resolved));

  if (targetsBranchScope) {
    resolved = resolved.replace(/\/branch-manager(\/|$)/g, `/${encodeURIComponent(branch!)}$1`);
    resolved = resolved.replace(/\/branch(\/|$)/g, `/${encodeURIComponent(branch!)}$1`);
    resolved = resolved.replace(/:branch(\/|$)/g, `${encodeURIComponent(branch!)}$1`);
  } else if (role) {
    resolved = resolved.replace(/\/branch-manager(\/|$)/g, `/${rolePathSegment(role)}$1`);
  }

  if (org) {
    resolved = resolved.replace(/\/organization(\/|$)/g, `/${encodeURIComponent(org)}$1`);
    resolved = resolved.replace(/:organization(\/|$)/g, `${encodeURIComponent(org)}$1`);
  }

  if (comp) {
    resolved = resolved.replace(/\/company(\/|$)/g, `/${encodeURIComponent(comp)}$1`);
    resolved = resolved.replace(/:company(\/|$)/g, `${encodeURIComponent(comp)}$1`);
  }

  return resolved.replace(/\/+/g, '/');
}

// ----------------------------------------------------------------------
// Permission Verification
// ----------------------------------------------------------------------

export function hasPermission(
  userPermissions: string[] | undefined | null,
  required: string | string[] | undefined,
): boolean {
  if (!required) return true;
  if (!userPermissions) return true;

  if (Array.isArray(required)) {
    return required.some((perm) => userPermissions.includes(perm));
  }
  return userPermissions.includes(required);
}

// ----------------------------------------------------------------------
// Raw Sidebar Navigation Data (from sidebar.json & PRD RBAC)
// ----------------------------------------------------------------------

export const COMPANY_SIDEBAR: SidebarEntry[] = [
  {
    name: 'Dashboard',
    href: '/company/dashboard',
    featureFlag: FEATURE_FLAGS.company_home_dashboard_nav,
    icon: 'dashboard',
    permission: PERMISSIONS.COMPANIES_VIEW,
  },
  {
    name: 'Branches',
    permission: PERMISSIONS.BRANCHES_VIEW,
    items: [
      {
        id: 1,
        name: 'All Branches',
        href: '/company/branches/all-branches',
        featureFlag: FEATURE_FLAGS.company_branches_allBranches_nav,
        icon: 'storefront',
        permission: PERMISSIONS.BRANCHES_VIEW,
      },
      {
        id: 2,
        name: 'Branch Analytics',
        href: '/company/branches/branch-analytics',
        featureFlag: FEATURE_FLAGS.company_branches_analytics_nav,
        icon: 'trending_up',
        permission: PERMISSIONS.REPORTS_VIEW,
      },
      {
        id: 3,
        name: 'Manage Performance',
        href: '/company/branches/manage-performance',
        featureFlag: FEATURE_FLAGS.company_branches_performance_nav,
        icon: 'speed',
        permission: PERMISSIONS.BRANCHES_UPDATE,
      },
    ],
  },
  {
    name: 'Employees',
    permission: PERMISSIONS.USERS_VIEW,
    items: [
      {
        id: 1,
        name: 'Users & Roles',
        href: '/company/employees/users-and-roles',
        featureFlag: FEATURE_FLAGS.company_employees_usersAndRoles_nav,
        icon: 'group',
        permission: PERMISSIONS.USERS_VIEW,
      },
      {
        id: 2,
        name: 'Attendance',
        href: '/company/employees/attendence',
        featureFlag: FEATURE_FLAGS.company_employees_attendance_nav,
        icon: 'badge',
        permission: PERMISSIONS.HR_ATTENDANCE_VIEW,
      },
    ],
  },
  {
    name: 'Menu',
    permission: PERMISSIONS.MENU_VIEW,
    items: [
      {
        id: 1,
        name: 'Menu Creation',
        href: '/company/menu/menu-creation',
        featureFlag: FEATURE_FLAGS.company_menu_creation_nav,
        icon: 'menu_book',
        permission: PERMISSIONS.MENU_CREATE,
      },
      {
        id: 2,
        name: 'Menus',
        href: '/company/menu/menus',
        featureFlag: FEATURE_FLAGS.company_menu_menus_nav,
        icon: 'menu_book',
        permission: PERMISSIONS.MENU_VIEW,
      },
      {
        id: 3,
        name: 'Sessions',
        href: '/company/menu/sessions',
        featureFlag: FEATURE_FLAGS.company_menu_sessions_nav,
        icon: 'calendar_today',
        permission: PERMISSIONS.MENU_VIEW,
      },
      {
        id: 4,
        name: 'Menu Management',
        href: '/company/menu/menu-management',
        featureFlag: FEATURE_FLAGS.company_menu_management_nav,
        icon: 'storefront',
        permission: PERMISSIONS.MENU_UPDATE,
      },
      {
        id: 5,
        name: 'Menu Availability',
        href: '/company/menu/menu-availability',
        featureFlag: FEATURE_FLAGS.company_menu_availability_nav,
        icon: 'calendar_today',
        permission: PERMISSIONS.MENU_UPDATE,
      },
      {
        id: 6,
        name: 'Menu Builder',
        href: '/company/menu/menu-builder',
        featureFlag: FEATURE_FLAGS.company_menu_builder_nav,
        icon: 'tune',
        permission: PERMISSIONS.MENU_UPDATE,
      },
      {
        id: 7,
        name: 'GST Rates',
        href: '/company/menu/gst-rates',
        featureFlag: FEATURE_FLAGS.company_menu_gstRates_nav,
        icon: 'percent',
        permission: PERMISSIONS.GST_VIEW,
      },
      {
        id: 8,
        name: 'Prep Stations',
        href: '/company/menu/prep-station',
        featureFlag: FEATURE_FLAGS.company_menu_prepStations_nav,
        icon: 'kitchen',
        permission: PERMISSIONS.MENU_UPDATE,
      },
      {
        id: 9,
        name: 'Modifier Groups',
        href: '/company/menu/modifier-groups',
        featureFlag: FEATURE_FLAGS.company_menu_modifierGroups_nav,
        icon: 'tune',
        permission: PERMISSIONS.MENU_UPDATE,
      },
    ],
  },
  {
    name: 'Operations',
    permission: PERMISSIONS.ORDERS_VIEW,
    items: [
      {
        id: 1,
        name: 'Order',
        href: '/company/operations/order',
        featureFlag: FEATURE_FLAGS.company_operations_order_nav,
        icon: 'receipt_long',
        permission: PERMISSIONS.ORDERS_VIEW,
      },
      {
        id: 2,
        name: 'Open Business',
        href: '/company/operations/open-business',
        featureFlag: FEATURE_FLAGS.company_operations_openBusiness_nav,
        icon: 'business',
        permission: PERMISSIONS.POS_SESSIONS_OPEN,
      },
      {
        id: 3,
        name: 'Inventory',
        href: '/company/operations/inventory',
        featureFlag: FEATURE_FLAGS.company_operations_inventory_nav,
        icon: 'inventory',
        permission: PERMISSIONS.INVENTORY_VIEW,
      },
      {
        id: 4,
        name: 'Customers',
        href: '/company/operations/customers',
        featureFlag: FEATURE_FLAGS.company_operations_customers_nav,
        icon: 'people',
        permission: PERMISSIONS.BOOKINGS_VIEW,
      },
    ],
  },
  {
    name: 'Reports',
    href: '/company/reports',
    featureFlag: FEATURE_FLAGS.company_reports_sales_nav,
    icon: 'bar_chart',
    permission: PERMISSIONS.REPORTS_VIEW,
  },
  {
    name: 'Settings',
    permission: PERMISSIONS.COMPANIES_UPDATE,
    items: [
      {
        id: 1,
        name: 'Company Settings',
        href: '/company/settings/company-settings',
        featureFlag: FEATURE_FLAGS.company_settings_companySettings_nav,
        icon: 'settings',
        permission: PERMISSIONS.COMPANIES_UPDATE,
      },
    ],
  },
];

export const BRANCH_MANAGER_SIDEBAR: SidebarEntry[] = [
  {
    name: 'Dashboard',
    href: '/branch-manager/dashboard',
    featureFlag: FEATURE_FLAGS.branch_home_dashboard_nav,
    icon: 'dashboard',
    permission: PERMISSIONS.REPORTS_VIEW,
  },
  {
    name: 'Employees',
    permission: PERMISSIONS.USERS_VIEW,
    items: [
      {
        id: 1,
        name: 'Users & Roles',
        href: '/branch-manager/employees/users-and-roles',
        featureFlag: FEATURE_FLAGS.branch_employees_usersAndRoles_nav,
        icon: 'group',
        permission: PERMISSIONS.USERS_VIEW,
      },
      {
        id: 2,
        name: 'Attendance',
        href: '/branch-manager/employees/attendence',
        featureFlag: FEATURE_FLAGS.branch_employees_attendance_nav,
        icon: 'badge',
        permission: PERMISSIONS.HR_ATTENDANCE_VIEW,
      },
      {
        id: 3,
        name: 'Schedule',
        href: '/branch-manager/employees/schedule',
        featureFlag: FEATURE_FLAGS.branch_employees_schedule_nav,
        icon: 'calendar_month',
        permission: PERMISSIONS.USERS_VIEW,
      },
    ],
  },
  {
    name: 'POS',
    permission: PERMISSIONS.ORDERS_CREATE,
    items: [
      {
        id: 1,
        name: 'Point of Sale',
        href: '/branch-manager/pos/point-of-sale',
        featureFlag: FEATURE_FLAGS.branch_pos_pointOfSale_nav,
        icon: 'point_of_sale',
        permission: PERMISSIONS.ORDERS_CREATE,
        // Sub-navbar drilldown flow
        items: [
          {
            id: 1,
            name: 'Dashboard',
            href: '/branch-manager/pos/point-of-sale/dashboard',
            featureFlag: FEATURE_FLAGS.branch_pos_dashboard_nav,
            icon: 'dashboard',
          },
          {
            id: 2,
            name: 'Tables',
            href: '/branch-manager/pos/point-of-sale/tables',
            featureFlag: FEATURE_FLAGS.branch_pos_tables_nav,
            icon: 'table_restaurant',
          },
          {
            id: 3,
            name: 'Dine In',
            href: '/branch-manager/pos/point-of-sale/dine-in',
            featureFlag: FEATURE_FLAGS.branch_pos_dineIn_nav,
            icon: 'restaurant',
          },
          {
            id: 4,
            name: 'Take Away',
            href: '/branch-manager/pos/point-of-sale/takeaway',
            featureFlag: FEATURE_FLAGS.branch_pos_takeAway_nav,
            icon: 'takeaway',
          },
          {
            id: 5,
            name: 'Ready List',
            href: '/branch-manager/pos/point-of-sale/ready-list',
            featureFlag: FEATURE_FLAGS.branch_pos_readyList_nav,
            icon: 'fact_check',
          },
          // RESERVATION FEATURE (HIDDEN): Uncomment below to re-enable Reservation in Branch Manager sidebar
          // {
          //   id: 6,
          //   name: 'Reservation',
          //   href: '/branch-manager/pos/point-of-sale/reservation',
          //   featureFlag: FEATURE_FLAGS.branch_pos_reservation_nav,
          //   icon: 'bookmark',
          // },
          {
            id: 7,
            name: 'Online Orders',
            href: '/branch-manager/pos/point-of-sale/online-orders',
            featureFlag: FEATURE_FLAGS.branch_pos_onlineOrders_nav,
            icon: 'language',
          },
          {
            id: 8,
            name: 'All Orders',
            href: '/branch-manager/pos/point-of-sale/all-orders',
            featureFlag: FEATURE_FLAGS.branch_pos_allOrders_nav,
            icon: 'receipt_long',
          },
          {
            id: 9,
            name: 'Cash Shift',
            href: '/branch-manager/pos/point-of-sale/cash-shift',
            featureFlag: FEATURE_FLAGS.branch_pos_cashShift_nav,
            icon: 'currency_rupee',
          },
          {
            id: 10,
            name: 'Due Payments',
            href: '/branch-manager/pos/point-of-sale/due-payments',
            featureFlag: FEATURE_FLAGS.branch_pos_duePayments_nav,
            icon: 'credit_card',
          },
        ],
      },
      {
        id: 2,
        name: 'Captain Flow',
        href: '/branch-manager/pos/captain-flow',
        featureFlag: FEATURE_FLAGS.branch_pos_captainFlow_nav,
        icon: 'fastfood',
        permission: PERMISSIONS.ORDERS_CREATE,
        // Sub-navbar drilldown flow
        items: [
          {
            id: 1,
            name: 'Tables',
            href: '/branch-manager/pos/captain-flow/tables',
            featureFlag: FEATURE_FLAGS.branch_pos_captainTables_nav,
            icon: 'table_restaurant',
          },
          {
            id: 2,
            name: 'Order Menu',
            href: '/branch-manager/pos/captain-flow/order-menu',
            featureFlag: FEATURE_FLAGS.branch_pos_captainOrderMenu_nav,
            icon: 'restaurant',
          },
          {
            id: 3,
            name: 'Ready List',
            href: '/branch-manager/pos/captain-flow/ready-list',
            featureFlag: FEATURE_FLAGS.branch_pos_captainReadyList_nav,
            icon: 'fact_check',
          },
          {
            id: 4,
            name: 'All Orders',
            href: '/branch-manager/pos/captain-flow/all-orders',
            featureFlag: FEATURE_FLAGS.branch_pos_captainAllOrders_nav,
            icon: 'receipt_long',
          },
        ],
      },
    ],
  },
  {
    name: 'Orders',
    permission: PERMISSIONS.ORDERS_VIEW,
    items: [
      {
        id: 1,
        name: 'Online Orders',
        href: '/branch-manager/orders/online-orders',
        featureFlag: FEATURE_FLAGS.branch_orders_onlineOrders_nav,
        icon: 'language',
        permission: PERMISSIONS.ORDERS_VIEW,
      },
      {
        id: 2,
        name: 'Live Orders',
        href: '/branch-manager/orders/live-orders',
        featureFlag: FEATURE_FLAGS.branch_orders_liveOrders_nav,
        icon: 'electric_bolt',
        permission: PERMISSIONS.ORDERS_VIEW,
      },
      {
        id: 3,
        name: 'Ready Orders',
        href: '/branch-manager/orders/ready-orders',
        featureFlag: FEATURE_FLAGS.branch_orders_readyOrders_nav,
        icon: 'fact_check',
        permission: PERMISSIONS.ORDERS_VIEW,
      },
      {
        id: 4,
        name: 'All Orders',
        href: '/branch-manager/orders/all-orders',
        featureFlag: FEATURE_FLAGS.branch_orders_allOrders_nav,
        icon: 'receipt_long',
        permission: PERMISSIONS.ORDERS_VIEW,
      },
    ],
  },
  {
    name: 'Menu',
    permission: PERMISSIONS.MENU_VIEW,
    featureFlag: FEATURE_FLAGS.branch_menu_hub_nav,
    items: [
      {
        id: 1,
        name: 'Menu Creation',
        href: '/branch-manager/menu/menu-creation',
        featureFlag: FEATURE_FLAGS.branch_menu_creation_nav,
        icon: 'menu_book',
        permission: PERMISSIONS.MENU_CREATE,
      },
      {
        id: 2,
        name: 'Menus',
        href: '/branch-manager/menu/menus',
        featureFlag: FEATURE_FLAGS.branch_menu_menus_nav,
        icon: 'menu_book',
        permission: PERMISSIONS.MENU_VIEW,
      },
      {
        id: 3,
        name: 'Sessions',
        href: '/branch-manager/menu/sessions',
        featureFlag: FEATURE_FLAGS.branch_menu_sessions_nav,
        icon: 'calendar_today',
        permission: PERMISSIONS.MENU_VIEW,
      },
      {
        id: 4,
        name: 'GST Rates',
        href: '/branch-manager/menu/gst-rates',
        featureFlag: FEATURE_FLAGS.branch_menu_gstRates_nav,
        icon: 'percent',
        permission: PERMISSIONS.GST_VIEW,
      },
      {
        id: 5,
        name: 'Prep Stations',
        href: '/branch-manager/menu/prep-station',
        featureFlag: FEATURE_FLAGS.branch_menu_prepStations_nav,
        icon: 'kitchen',
        permission: PERMISSIONS.MENU_UPDATE,
      },
      {
        id: 6,
        name: 'Modifier Groups',
        href: '/branch-manager/menu/modifier-groups',
        featureFlag: FEATURE_FLAGS.branch_menu_modifierGroups_nav,
        icon: 'tune',
        permission: PERMISSIONS.MENU_UPDATE,
      },
      {
        id: 7,
        name: 'Menu Availability',
        href: '/branch-manager/menu/menu-availability',
        featureFlag: FEATURE_FLAGS.branch_menu_availability_nav,
        icon: 'calendar_today',
        permission: PERMISSIONS.MENU_UPDATE,
      },
    ],
  },
  {
    name: 'Management',
    permission: PERMISSIONS.TABLES_VIEW,
    items: [
      {
        id: 1,
        name: 'Tables',
        href: '/branch-manager/management/tables',
        featureFlag: FEATURE_FLAGS.branch_management_tables_nav,
        icon: 'table_restaurant',
        permission: PERMISSIONS.TABLES_VIEW,
      },
      {
        id: 2,
        name: 'Dine In',
        href: '/branch-manager/management/dine-in',
        featureFlag: FEATURE_FLAGS.branch_management_dineIn_nav,
        icon: 'restaurant',
        permission: PERMISSIONS.ORDERS_CREATE,
      },
      {
        id: 3,
        name: 'Open Business',
        href: '/branch-manager/management/open-business',
        featureFlag: FEATURE_FLAGS.branch_management_openBusiness_nav,
        icon: 'business',
        permission: PERMISSIONS.POS_SESSIONS_OPEN,
      },
      {
        id: 4,
        name: 'Cash Counter',
        href: '/branch-manager/management/cash-counter',
        featureFlag: FEATURE_FLAGS.branch_management_cashCounter_nav,
        icon: 'point_of_sale',
        permission: PERMISSIONS.POS_SESSIONS_OPEN,
      },
      {
        id: 5,
        name: 'Due Payments',
        href: '/branch-manager/management/due-payments',
        featureFlag: FEATURE_FLAGS.branch_management_duePayments_nav,
        icon: 'credit_card',
        permission: PERMISSIONS.PAYMENTS_VIEW,
      },
      {
        id: 6,
        name: 'Inventory',
        href: '/branch-manager/management/inventory',
        featureFlag: FEATURE_FLAGS.branch_management_inventory_nav,
        icon: 'inventory',
        permission: PERMISSIONS.INVENTORY_VIEW,
      },
      {
        id: 7,
        name: 'Customers',
        href: '/branch-manager/management/customers',
        featureFlag: FEATURE_FLAGS.branch_management_customers_nav,
        icon: 'people',
        permission: PERMISSIONS.BOOKINGS_VIEW,
      },
      {
        id: 8,
        name: 'Reports',
        href: '/branch-manager/management/reports',
        featureFlag: FEATURE_FLAGS.branch_management_reports_nav,
        icon: 'bar_chart',
        permission: PERMISSIONS.REPORTS_VIEW,
      },
      {
        id: 9,
        name: 'Settings',
        href: '/branch-manager/management/settings',
        featureFlag: FEATURE_FLAGS.branch_management_settings_nav,
        icon: 'settings',
        permission: PERMISSIONS.FEATURES_CONFIGURE,
      },
      {
        id: 10,
        name: 'Floor & Table Set-up',
        href: '/branch-manager/management/floor-and-table-setup',
        featureFlag: FEATURE_FLAGS.branch_management_floorAndTableSetup_nav,
        icon: 'view_quilt',
        permission: PERMISSIONS.FLOORS_VIEW,
      },
    ],
  },
];

export type WaiterWorkspaceNavId = 'tables' | 'orders' | 'ready' | 'menu';

/** Waiter captain-flow screens — single catalog for sidebar, bottom nav, and post-login routing. */
export type WaiterWorkspaceNavItem = {
  id: WaiterWorkspaceNavId;
  name: string;
  bottomNavLabel: string;
  /** Path after role segment, e.g. `/pos/captain-flow/tables`. */
  captainFlowSuffix: string;
  icon: string;
  permission: string;
  featureFlag: string;
  isActivePath: (pathname: string) => boolean;
};

const CAPTAIN_FLOW_PREFIX = '/pos/captain-flow';

/**
 * Captain / waiter workspace — footer order matches Figma: Tables · Menu · Ready · Orders.
 * Sidebar and bottom nav both derive from this list (no separate hardcoded tab arrays).
 */
export const CAPTAIN_WORKSPACE_NAV: readonly WaiterWorkspaceNavItem[] = [
  {
    id: 'tables',
    name: 'Tables',
    bottomNavLabel: 'Tables',
    captainFlowSuffix: `${CAPTAIN_FLOW_PREFIX}/tables`,
    icon: 'table_restaurant',
    permission: PERMISSIONS.TABLES_VIEW,
    featureFlag: FEATURE_FLAGS.captain_pos_tables_nav,
    isActivePath: (pathname) =>
      pathname.includes(`${CAPTAIN_FLOW_PREFIX}/tables`) ||
      /\/pos\/captain-flow\/?$/.test(pathname.replace(/\/+$/, '')),
  },
  {
    id: 'menu',
    name: 'Dine-In',
    bottomNavLabel: 'Menu',
    captainFlowSuffix: `${CAPTAIN_FLOW_PREFIX}/order-menu`,
    icon: 'restaurant',
    permission: PERMISSIONS.ORDERS_CREATE,
    featureFlag: FEATURE_FLAGS.captain_pos_dineIn_nav,
    isActivePath: (pathname) =>
      pathname.includes(`${CAPTAIN_FLOW_PREFIX}/order-menu`) ||
      pathname.includes(`${CAPTAIN_FLOW_PREFIX}/dine-in`) ||
      pathname.includes('/takeaway') ||
      /\/dine-in\/[^/?#]+/.test(pathname),
  },
  {
    id: 'ready',
    name: 'Ready Orders',
    bottomNavLabel: 'Ready',
    captainFlowSuffix: `${CAPTAIN_FLOW_PREFIX}/ready-list`,
    icon: 'fact_check',
    permission: PERMISSIONS.ORDERS_VIEW,
    featureFlag: FEATURE_FLAGS.captain_pos_readyOrders_nav,
    isActivePath: (pathname) => pathname.includes(`${CAPTAIN_FLOW_PREFIX}/ready-list`),
  },
  {
    id: 'orders',
    name: 'Orders',
    bottomNavLabel: 'Orders',
    captainFlowSuffix: `${CAPTAIN_FLOW_PREFIX}/all-orders`,
    icon: 'receipt_long',
    permission: PERMISSIONS.ORDERS_VIEW,
    featureFlag: FEATURE_FLAGS.captain_pos_orders_nav,
    isActivePath: (pathname) => pathname.includes(`${CAPTAIN_FLOW_PREFIX}/all-orders`),
  },
];

function waiterSidebarHref(captainFlowSuffix: string): string {
  return `/branch-manager${captainFlowSuffix}`;
}

export const WAITER_SIDEBAR: SidebarEntry[] = CAPTAIN_WORKSPACE_NAV.map((item, index) => ({
  id: index + 1,
  name: item.name,
  href: waiterSidebarHref(item.captainFlowSuffix),
  icon: item.icon,
  permission: item.permission,
  featureFlag: item.featureFlag,
}));

/** Cashier / counter staff — billing-focused flat nav. */
export const CASHIER_SIDEBAR: SidebarEntry[] = [
  {
    id: 1,
    name: 'Dashboard',
    href: '/branch-manager/pos/point-of-sale/dashboard',
    icon: 'dashboard',
    permission: PERMISSIONS.ORDERS_VIEW,
    featureFlag: FEATURE_FLAGS.cashier_pos_dashboard_nav,
  },
  {
    id: 2,
    name: 'New Order',
    href: '/branch-manager/pos/point-of-sale/tables',
    icon: 'table_restaurant',
    permission: PERMISSIONS.ORDERS_CREATE,
    featureFlag: FEATURE_FLAGS.cashier_pos_newOrder_nav,
  },
  {
    id: 3,
    name: 'Orders',
    href: '/branch-manager/pos/point-of-sale/all-orders',
    icon: 'receipt_long',
    permission: PERMISSIONS.ORDERS_VIEW,
    featureFlag: FEATURE_FLAGS.cashier_pos_orders_nav,
  },
  {
    id: 4,
    name: 'Dine-In',
    href: '/branch-manager/pos/point-of-sale/dine-in',
    icon: 'restaurant',
    permission: PERMISSIONS.ORDERS_CREATE,
    featureFlag: FEATURE_FLAGS.cashier_pos_dineIn_nav,
  },
  {
    id: 5,
    name: 'Billing',
    href: '/branch-manager/pos/point-of-sale/all-orders',
    icon: 'receipt_long',
    permission: PERMISSIONS.PAYMENTS_COLLECT,
    featureFlag: FEATURE_FLAGS.cashier_pos_billing_nav,
  },
  {
    id: 6,
    name: 'Open Business',
    href: '/branch-manager/management/open-business',
    icon: 'business',
    permission: PERMISSIONS.POS_SESSIONS_OPEN,
    featureFlag: FEATURE_FLAGS.cashier_pos_openBusiness_nav,
  },
  {
    id: 7,
    name: 'Payments',
    href: '/branch-manager/pos/point-of-sale/due-payments',
    icon: 'credit_card',
    permission: PERMISSIONS.PAYMENTS_VIEW,
    featureFlag: FEATURE_FLAGS.cashier_pos_payments_nav,
  },
  {
    id: 8,
    name: 'Customers',
    href: '/branch-manager/management/customers',
    icon: 'people',
    permission: PERMISSIONS.BOOKINGS_VIEW,
    featureFlag: FEATURE_FLAGS.cashier_management_customers_nav,
  },
  {
    id: 9,
    name: 'Reports',
    href: '/branch-manager/management/reports',
    icon: 'bar_chart',
    permission: PERMISSIONS.REPORTS_VIEW,
    featureFlag: FEATURE_FLAGS.cashier_management_reports_nav,
  },
];

/** Kitchen manager / kitchen staff — KDS-focused flat nav. */
export const KITCHEN_SIDEBAR: SidebarEntry[] = [
  {
    id: 1,
    name: 'Incoming Orders',
    href: '/branch-manager/management/kitchen-display',
    icon: 'fact_check',
    permission: PERMISSIONS.ORDERS_VIEW,
    featureFlag: FEATURE_FLAGS.kitchen_kds_incoming_nav,
  },
  {
    id: 2,
    name: 'Preparing',
    href: '/branch-manager/management/kitchen-display',
    icon: 'schedule',
    permission: PERMISSIONS.ORDERS_UPDATE_STATUS,
    featureFlag: FEATURE_FLAGS.kitchen_kds_preparing_nav,
  },
  {
    id: 3,
    name: 'Ready Orders',
    href: '/branch-manager/pos/point-of-sale/ready-list',
    icon: 'receipt_long',
    permission: PERMISSIONS.ORDERS_VIEW,
    featureFlag: FEATURE_FLAGS.kitchen_kds_readyOrders_nav,
  },
];

/** Chef station — distraction-free KDS; no sidebar chrome. */
export const CHEF_SIDEBAR: SidebarEntry[] = [];

export const ORGANIZATION_SIDEBAR: SidebarEntry[] = [
  {
    name: 'Dashboard',
    href: '/organization/dashboard',
    featureFlag: FEATURE_FLAGS.org_home_dashboard_nav,
    icon: 'dashboard',
    permission: PERMISSIONS.COMPANIES_VIEW,
  },
  {
    name: 'Companies',
    permission: PERMISSIONS.COMPANIES_VIEW,
    items: [
      {
        id: 1,
        name: 'All Companies',
        href: '/organization/companies',
        featureFlag: FEATURE_FLAGS.org_companies_allCompanies_nav,
        icon: 'business',
        permission: PERMISSIONS.COMPANIES_VIEW,
      },
      {
        id: 2,
        name: 'Add Company',
        href: '/organization/companies/new',
        featureFlag: FEATURE_FLAGS.org_companies_addCompany_nav,
        icon: 'add',
        permission: PERMISSIONS.COMPANIES_CREATE,
      },
      {
        id: 3,
        name: 'Company Analytics',
        href: '/organization/companies/analytics',
        featureFlag: FEATURE_FLAGS.org_companies_analytics_nav,
        icon: 'bar_chart',
        permission: PERMISSIONS.REPORTS_VIEW,
      },
    ],
  },
  {
    name: 'Branches',
    permission: PERMISSIONS.BRANCHES_VIEW,
    items: [
      {
        id: 1,
        name: 'All Branches',
        href: '/organization/branches/all-branches',
        featureFlag: FEATURE_FLAGS.org_branches_allBranches_nav,
        icon: 'storefront',
        permission: PERMISSIONS.BRANCHES_VIEW,
      },
      {
        id: 2,
        name: 'Add Branch',
        href: '/organization/branches/new',
        featureFlag: FEATURE_FLAGS.org_branches_addBranch_nav,
        icon: 'add',
        permission: PERMISSIONS.BRANCHES_CREATE,
      },
      {
        id: 3,
        name: 'Branch Performance',
        href: '/organization/branches/performance',
        featureFlag: FEATURE_FLAGS.org_branches_performance_nav,
        icon: 'trending_up',
        permission: PERMISSIONS.REPORTS_VIEW,
      },
    ],
  },
  {
    name: 'Employees',
    permission: PERMISSIONS.USERS_VIEW,
    items: [
      {
        id: 1,
        name: 'Users & Roles',
        href: '/organization/employees/users-and-roles',
        featureFlag: FEATURE_FLAGS.org_employees_usersAndRoles_nav,
        icon: 'group',
        permission: PERMISSIONS.USERS_VIEW,
      },
      {
        id: 2,
        name: 'Attendance',
        href: '/organization/employees/attendence',
        featureFlag: FEATURE_FLAGS.org_employees_attendance_nav,
        icon: 'badge',
        permission: PERMISSIONS.HR_ATTENDANCE_VIEW,
      },
    ],
  },
  {
    name: 'Menu',
    permission: PERMISSIONS.MENU_VIEW,
    items: [
      {
        id: 1,
        name: 'Menu Creation',
        href: '/organization/menu/menu-creation',
        featureFlag: FEATURE_FLAGS.org_menu_creation_nav,
        icon: 'menu_book',
        permission: PERMISSIONS.MENU_CREATE,
      },
      {
        id: 2,
        name: 'Menus',
        href: '/organization/menu/menus',
        featureFlag: FEATURE_FLAGS.org_menu_menus_nav,
        icon: 'menu_book',
        permission: PERMISSIONS.MENU_VIEW,
      },
      {
        id: 3,
        name: 'Sessions',
        href: '/organization/menu/sessions',
        featureFlag: FEATURE_FLAGS.org_menu_sessions_nav,
        icon: 'calendar_today',
        permission: PERMISSIONS.MENU_VIEW,
      },
      {
        id: 4,
        name: 'Menu Management',
        href: '/organization/menu/menu-management',
        featureFlag: FEATURE_FLAGS.org_menu_management_nav,
        icon: 'storefront',
        permission: PERMISSIONS.MENU_UPDATE,
      },
      {
        id: 5,
        name: 'Menu Builder',
        href: '/organization/menu/menu-builder',
        featureFlag: FEATURE_FLAGS.org_menu_builder_nav,
        icon: 'tune',
        permission: PERMISSIONS.MENU_UPDATE,
      },
    ],
  },
  {
    name: 'Reports',
    href: '/organization/reports',
    featureFlag: FEATURE_FLAGS.org_reports_sales_nav,
    icon: 'bar_chart',
    permission: PERMISSIONS.REPORTS_VIEW,
  },
  {
    name: 'Settings',
    permission: PERMISSIONS.COMPANIES_UPDATE,
    items: [
      {
        id: 1,
        name: 'Organization Settings',
        href: '/organization/settings',
        featureFlag: FEATURE_FLAGS.org_settings_organizationSettings_nav,
        icon: 'settings',
        permission: PERMISSIONS.COMPANIES_UPDATE,
      },
      {
        id: 2,
        name: 'Subscription',
        href: '/organization/settings/billing',
        featureFlag: FEATURE_FLAGS.org_settings_subscription_nav,
        icon: 'credit_card',
        permission: PERMISSIONS.FEATURES_VIEW,
      },
      {
        id: 3,
        name: 'Integrations',
        href: '/organization/settings/integrations',
        featureFlag: FEATURE_FLAGS.org_settings_integrations_nav,
        icon: 'inventory',
        permission: PERMISSIONS.FEATURES_CONFIGURE,
      },
    ],
  },
];

// ----------------------------------------------------------------------
// Configuration Lookup & Filtering
// ----------------------------------------------------------------------

export function rolePathSegment(role: string): string {
  const key = normalizeRoleKey(role);
  if (key === 'branch_manager') return 'branch-manager';
  if (key === 'waiter' || key === 'cashier' || key === 'kitchen' || key === 'chef') {
    return 'branch-manager';
  }
  if (key === 'company') return 'company';
  if (key === 'organization' || key === 'super_admin') return 'organization';
  return key.replace(/_/g, '-');
}

const SIDEBAR_RANK: Record<string, number> = {
  organization: 3,
  super_admin: 3,
  company: 2,
  branch_manager: 1,
  waiter: 0,
  cashier: 0,
  kitchen: 0,
  chef: 0,
};

function normalizeScopeSlug(value: string): string {
  return decodeURIComponent(value).trim().toLowerCase();
}

/** `/PH/...` or `/TEST-BRANCH1/dashboard` — match slug to sidebar context from drill-down. */
function sidebarLevelFromScopedSegment(segment: string, context?: SidebarContext): string | null {
  if (!context) return null;

  const token = normalizeScopeSlug(segment);
  const branchSlug = context.branchSlug ?? context.branchName;
  const companySlug = context.companySlug ?? context.companyName;
  const orgSlug = context.organizationSlug ?? context.organizationName;

  if (branchSlug && token === normalizeScopeSlug(String(branchSlug))) return 'branch_manager';
  if (companySlug && token === normalizeScopeSlug(String(companySlug))) return 'company';
  if (orgSlug && token === normalizeScopeSlug(String(orgSlug))) return 'organization';

  if (token === 'organization') return 'organization';
  if (token === 'company') return 'company';
  if (token === 'branch-manager' || token === 'branch') return 'branch_manager';

  return null;
}

/** Hierarchy level implied by the URL. Shared module routes such as `/pos` return null. */
export function sidebarLevelFromPath(pathname: string, context?: SidebarContext): string | null {
  if (!pathname) return null;
  if (pathname === '/organization' || pathname.startsWith('/organization/')) return 'organization';
  if (pathname === '/company' || pathname.startsWith('/company/')) return 'company';
  if (pathname === '/waiter' || pathname.startsWith('/waiter/')) return 'waiter';
  if (pathname === '/cashier' || pathname.startsWith('/cashier/')) return 'cashier';
  if (pathname === '/kitchen' || pathname.startsWith('/kitchen/')) return 'kitchen';
  if (pathname === '/chef' || pathname.startsWith('/chef/')) return 'chef';
  if (
    pathname === '/branch-manager' ||
    pathname.startsWith('/branch-manager/') ||
    pathname === '/branch' ||
    pathname.startsWith('/branch/')
  ) {
    return 'branch_manager';
  }

  const scopedRoot = pathname.match(/^\/([^/]+)(?:\/|$)/);
  if (scopedRoot) {
    const fromContext = sidebarLevelFromScopedSegment(scopedRoot[1], context);
    if (fromContext) return fromContext;
  }

  return null;
}

/**
 * Sidebar catalog for the current page.
 * A higher role can drill into a lower catalog. A lower role never sees a wider one.
 */
export function resolveSidebarLevel(
  pathname: string,
  role?: string,
  context?: SidebarContext,
): string {
  const userKey = normalizeRoleKey(role || '');
  const pathKey = sidebarLevelFromPath(pathname, context);
  if (!userKey) return pathKey || '';
  if (!pathKey) return userKey;

  const userRank = SIDEBAR_RANK[userKey] ?? 1;
  const pathRank = SIDEBAR_RANK[pathKey] ?? 1;
  if (pathRank > userRank) return userKey;
  return pathKey;
}

/** Link back to the signed-in role's home when the page is using a lower catalog. */
export function resolveSidebarEscape(
  role: string | undefined,
  level: string,
): { href: string; label: string } | null {
  const userKey = normalizeRoleKey(role || '');
  const operational =
    userKey === 'waiter' || userKey === 'cashier' || userKey === 'kitchen' || userKey === 'chef';
  if (!userKey || operational || !level || level === userKey) return null;
  if ((SIDEBAR_RANK[level] ?? 0) >= (SIDEBAR_RANK[userKey] ?? 0)) return null;

  if (userKey === 'company') {
    return { href: '/company/dashboard', label: 'Back to company' };
  }
  if (userKey === 'organization' || userKey === 'super_admin') {
    return { href: '/organization/dashboard', label: 'Back to organization' };
  }
  return { href: '/branch-manager/dashboard', label: 'Back to branch' };
}

export function normalizeRoleKey(role: string): string {
  const normalized = role
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  if (normalized === 'chef' || normalized.startsWith('chef_') || normalized.endsWith('_chef')) {
    return 'chef';
  }
  if (normalized.includes('kitchen')) return 'kitchen';
  if (
    normalized.includes('cashier') ||
    normalized.includes('counter') ||
    normalized === 'pos_cashier'
  ) {
    return 'cashier';
  }
  if (
    normalized.includes('waiter') ||
    normalized.includes('captain') ||
    normalized.includes('server') ||
    normalized === 'host'
  ) {
    return 'waiter';
  }
  if (normalized.includes('platform_support')) return 'platform_support';
  if (normalized.includes('branch') || normalized.includes('store_manager'))
    return 'branch_manager';
  if (normalized.includes('company')) return 'company';
  if (normalized.includes('org') || normalized.includes('tenant_admin')) return 'organization';
  if (normalized.includes('super')) return 'super_admin';
  return normalized;
}

/** Chef stations render full-screen KDS with no sidebar chrome. */
export function isSidebarlessRole(role?: string | null): boolean {
  return normalizeRoleKey(role || '') === 'chef';
}

export const ROLE_SIDEBAR_REGISTRY: Record<string, SidebarEntry[]> = {
  company: COMPANY_SIDEBAR,
  company_admin: COMPANY_SIDEBAR,
  company_owner: COMPANY_SIDEBAR,
  company_manager: COMPANY_SIDEBAR,
  branch_manager: BRANCH_MANAGER_SIDEBAR,
  branch_admin: BRANCH_MANAGER_SIDEBAR,
  'branch manager': BRANCH_MANAGER_SIDEBAR,
  store_manager: BRANCH_MANAGER_SIDEBAR,
  restaurant_manager: BRANCH_MANAGER_SIDEBAR,
  waiter: WAITER_SIDEBAR,
  captain: WAITER_SIDEBAR,
  server: WAITER_SIDEBAR,
  host: WAITER_SIDEBAR,
  cashier: CASHIER_SIDEBAR,
  counter: CASHIER_SIDEBAR,
  pos_cashier: CASHIER_SIDEBAR,
  counter_staff: CASHIER_SIDEBAR,
  kitchen: KITCHEN_SIDEBAR,
  kitchen_staff: KITCHEN_SIDEBAR,
  chef: CHEF_SIDEBAR,
  organization: ORGANIZATION_SIDEBAR,
  org_admin: ORGANIZATION_SIDEBAR,
  org_owner: ORGANIZATION_SIDEBAR,
  tenant_admin: ORGANIZATION_SIDEBAR,
  super_admin: ORGANIZATION_SIDEBAR,
};

/**
 * Filter and resolve navigation entries based on role, user permissions, and context.
 * The catalog for the access level is what that role sees. An explicit permission
 * list still hides items the account cannot open.
 */
export function getSidebarNavigation({
  role,
  userPermissions,
  context,
  pathname = '',
}: {
  role?: string;
  userPermissions?: string[] | null;
  context?: SidebarContext;
  pathname?: string;
}): SidebarEntry[] {
  if (!role?.trim()) return [];

  const normalized = normalizeRoleKey(role);
  const level = resolveSidebarLevel(pathname, role, context);
  const rawEntries = ROLE_SIDEBAR_REGISTRY[level] || ROLE_SIDEBAR_REGISTRY[normalized];
  if (!rawEntries) return [];

  const drilledIntoLowerCatalog = level !== normalized && Boolean(ROLE_SIDEBAR_REGISTRY[level]);
  const permissionKey = normalized === 'organization' ? 'org_admin' : normalized;
  // A drilled-in page shows that level's full menu. Otherwise the role's grants apply.
  const permissions = drilledIntoLowerCatalog
    ? null
    : userPermissions !== undefined && userPermissions !== null
      ? userPermissions
      : permissionKey === 'branch_manager'
        ? null
        : DEFAULT_ROLE_PERMISSIONS[permissionKey] || [];
  const routeRole =
    level === 'branch_manager' ||
    level === 'waiter' ||
    level === 'cashier' ||
    level === 'kitchen' ||
    level === 'chef'
      ? level
      : role;

  const filterItem = (item: SidebarItem): SidebarItem | null => {
    if (!hasPermission(permissions, item.permission)) return null;

    const resolvedHref = item.href ? resolveSidebarRoute(item.href, context, routeRole) : undefined;
    const resolvedChildren = item.items
      ? (item.items.map(filterItem).filter(Boolean) as SidebarItem[])
      : undefined;

    return {
      ...item,
      href: resolvedHref,
      items: resolvedChildren,
    };
  };

  const filteredEntries: SidebarEntry[] = [];

  for (const entry of rawEntries) {
    if (isSidebarSection(entry)) {
      if (!hasPermission(permissions, entry.permission)) continue;
      const validChildren = entry.items.map(filterItem).filter(Boolean) as SidebarItem[];
      if (validChildren.length > 0) {
        filteredEntries.push({
          ...entry,
          items: validChildren,
        });
      }
    } else {
      const validItem = filterItem(entry);
      if (validItem) {
        filteredEntries.push(validItem);
      }
    }
  }

  return filteredEntries;
}

/**
 * Hide sidebar leaves whose GrowthBook / MVP default flag is off.
 * Drop empty sections and drilldown parents after filtering.
 */
export function filterSidebarByFeatureFlags(
  entries: SidebarEntry[],
  isEnabled: (flag: string) => boolean = isFeatureFlagDefaultOn,
): SidebarEntry[] {
  const filterItem = (item: SidebarItem): SidebarItem | null => {
    if (item.featureFlag && !isEnabled(item.featureFlag)) return null;

    const children = item.items
      ? (item.items.map(filterItem).filter(Boolean) as SidebarItem[])
      : undefined;

    if (item.items && (!children || children.length === 0)) return null;

    return children ? { ...item, items: children } : item;
  };

  const next: SidebarEntry[] = [];
  for (const entry of entries) {
    if (isSidebarSection(entry)) {
      if (entry.featureFlag && !isEnabled(entry.featureFlag)) continue;
      const items = entry.items.map(filterItem).filter(Boolean) as SidebarItem[];
      if (items.length > 0) next.push({ ...entry, items });
    } else {
      const item = filterItem(entry);
      if (item) next.push(item);
    }
  }
  return next;
}
