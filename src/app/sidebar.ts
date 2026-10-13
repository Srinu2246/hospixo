/**
 * Global Sidebar Configuration & RBAC Navigation Resolver
 *
 * Implements role-based and permission-based navigation definitions,
 * dynamic entity route replacement (organization, company, branch),
 * and nested sub-flow navigation (POS, Captain Flow, etc.).
 */

export type SidebarItem = {
  id?: string | number;
  name: string;
  href?: string;
  icon?: string;
  permission?: string | string[];
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
    PERMISSIONS.COMPANIES_UPDATE,
    PERMISSIONS.BRANCHES_VIEW,
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
};

// ----------------------------------------------------------------------
// Route Resolution (Organization / Company / Branch replacement)
// ----------------------------------------------------------------------

export function resolveSidebarRoute(href: string, context?: SidebarContext, role?: string): string {
  if (!href) return href;
  let resolved = href;

  if (role) {
    resolved = resolved.replace(/\/branch-manager(\/|$)/g, `/${rolePathSegment(role)}$1`);
  }

  const org = context?.organizationSlug || context?.organizationName;
  const comp = context?.companySlug || context?.companyName;
  const branch = context?.branchSlug || context?.branchName;

  if (org) {
    resolved = resolved.replace(/\/organization(\/|$)/g, `/${encodeURIComponent(org)}$1`);
    resolved = resolved.replace(/:organization(\/|$)/g, `${encodeURIComponent(org)}$1`);
  }

  if (comp) {
    resolved = resolved.replace(/\/company(\/|$)/g, `/${encodeURIComponent(comp)}$1`);
    resolved = resolved.replace(/:company(\/|$)/g, `${encodeURIComponent(comp)}$1`);
  }

  if (branch) {
    resolved = resolved.replace(/\/branch-manager(\/|$)/g, `/${encodeURIComponent(branch)}$1`);
    resolved = resolved.replace(/\/branch(\/|$)/g, `/${encodeURIComponent(branch)}$1`);
    resolved = resolved.replace(/:branch(\/|$)/g, `${encodeURIComponent(branch)}$1`);
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
        icon: 'storefront',
        permission: PERMISSIONS.BRANCHES_VIEW,
      },
      {
        id: 2,
        name: 'Branch Analytics',
        href: '/company/branches/branch-analytics',
        icon: 'trending_up',
        permission: PERMISSIONS.REPORTS_VIEW,
      },
      {
        id: 3,
        name: 'Manage Performance',
        href: '/company/branches/manage-performance',
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
        icon: 'group',
        permission: PERMISSIONS.USERS_VIEW,
      },
      {
        id: 2,
        name: 'Attendance',
        href: '/company/employees/attendence',
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
        icon: 'menu_book',
        permission: PERMISSIONS.MENU_CREATE,
      },
      {
        id: 2,
        name: 'Menus',
        href: '/company/menu/menus',
        icon: 'menu_book',
        permission: PERMISSIONS.MENU_VIEW,
      },
      {
        id: 3,
        name: 'GST Rates',
        href: '/company/menu/gst-rates',
        icon: 'percent',
        permission: PERMISSIONS.GST_VIEW,
      },
      {
        id: 4,
        name: 'Prep Stations',
        href: '/company/menu/prep-station',
        icon: 'kitchen',
        permission: PERMISSIONS.MENU_UPDATE,
      },
      {
        id: 5,
        name: 'Modifier Groups',
        href: '/company/menu/modifier-groups',
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
        icon: 'receipt_long',
        permission: PERMISSIONS.ORDERS_VIEW,
      },
      {
        id: 2,
        name: 'Kitchen Display',
        href: '/company/operations/kitchen-display',
        icon: 'tv',
        permission: PERMISSIONS.ORDERS_UPDATE_STATUS,
      },
      {
        id: 3,
        name: 'Cash Counter',
        href: '/company/operations/cash-counter',
        icon: 'currency_rupee',
        permission: PERMISSIONS.PAYMENTS_VIEW,
      },
      {
        id: 4,
        name: 'Inventory',
        href: '/company/operations/inventory',
        icon: 'inventory',
        permission: PERMISSIONS.INVENTORY_VIEW,
      },
      {
        id: 5,
        name: 'Customers',
        href: '/company/operations/customers',
        icon: 'people',
        permission: PERMISSIONS.BOOKINGS_VIEW,
      },
    ],
  },
  {
    name: 'Reports',
    permission: PERMISSIONS.REPORTS_VIEW,
    items: [
      {
        id: 1,
        name: 'Sales',
        href: '/company/report/sales',
        icon: 'bar_chart',
        permission: PERMISSIONS.REPORTS_VIEW,
      },
      {
        id: 2,
        name: 'Revenue',
        href: '/company/report/revenue',
        icon: 'trending_up',
        permission: PERMISSIONS.REPORTS_VIEW,
      },
      {
        id: 3,
        name: 'Analytics',
        href: '/company/report/analytics',
        icon: 'speed',
        permission: PERMISSIONS.REPORTS_VIEW,
      },
    ],
  },
  {
    name: 'Settings',
    permission: PERMISSIONS.COMPANIES_UPDATE,
    items: [
      {
        id: 1,
        name: 'Company Settings',
        href: '/company/settings/company-settings',
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
        icon: 'group',
        permission: PERMISSIONS.USERS_VIEW,
      },
      {
        id: 2,
        name: 'Attendance',
        href: '/branch-manager/employees/attendence',
        icon: 'badge',
        permission: PERMISSIONS.HR_ATTENDANCE_VIEW,
      },
      {
        id: 3,
        name: 'Schedule',
        href: '/branch-manager/employees/schedule',
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
        icon: 'point_of_sale',
        permission: PERMISSIONS.ORDERS_CREATE,
        // Sub-navbar drilldown flow
        items: [
          {
            id: 1,
            name: 'Dashboard',
            href: '/branch-manager/pos/point-of-sale/dashboard',
            icon: 'dashboard',
          },
          {
            id: 2,
            name: 'Tables',
            href: '/branch-manager/pos/point-of-sale/tables',
            icon: 'table_restaurant',
          },
          {
            id: 3,
            name: 'Dine In',
            href: '/branch-manager/pos/point-of-sale/dine-in',
            icon: 'restaurant',
          },
          {
            id: 4,
            name: 'Take Away',
            href: '/branch-manager/pos/point-of-sale/takeaway',
            icon: 'takeaway',
          },
          {
            id: 5,
            name: 'Ready List',
            href: '/branch-manager/pos/point-of-sale/ready-list',
            icon: 'fact_check',
          },
          {
            id: 6,
            name: 'Reservation',
            href: '/branch-manager/pos/point-of-sale/reservation',
            icon: 'bookmark',
          },
          {
            id: 7,
            name: 'Online Orders',
            href: '/branch-manager/pos/point-of-sale/online-orders',
            icon: 'language',
          },
          {
            id: 8,
            name: 'All Orders',
            href: '/branch-manager/pos/point-of-sale/all-orders',
            icon: 'receipt_long',
          },
          {
            id: 9,
            name: 'Cash Shift',
            href: '/branch-manager/pos/point-of-sale/cash-shift',
            icon: 'currency_rupee',
          },
          {
            id: 10,
            name: 'Due Payments',
            href: '/branch-manager/pos/point-of-sale/due-payments',
            icon: 'credit_card',
          },
        ],
      },
      {
        id: 2,
        name: 'Captain Flow',
        href: '/branch-manager/pos/captain-flow',
        icon: 'fastfood',
        permission: PERMISSIONS.ORDERS_CREATE,
        // Sub-navbar drilldown flow
        items: [
          {
            id: 1,
            name: 'Tables',
            href: '/branch-manager/pos/captain-flow/tables',
            icon: 'table_restaurant',
          },
          {
            id: 2,
            name: 'Order Menu',
            href: '/branch-manager/pos/captain-flow/order-menu',
            icon: 'restaurant',
          },
          {
            id: 3,
            name: 'Ready List',
            href: '/branch-manager/pos/captain-flow/ready-list',
            icon: 'fact_check',
          },
          {
            id: 4,
            name: 'All Orders',
            href: '/branch-manager/pos/captain-flow/all-orders',
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
        icon: 'language',
        permission: PERMISSIONS.ORDERS_VIEW,
      },
      {
        id: 2,
        name: 'Live Orders',
        href: '/branch-manager/orders/live-orders',
        icon: 'electric_bolt',
        permission: PERMISSIONS.ORDERS_VIEW,
      },
      {
        id: 3,
        name: 'Ready Orders',
        href: '/branch-manager/orders/ready-orders',
        icon: 'fact_check',
        permission: PERMISSIONS.ORDERS_VIEW,
      },
      {
        id: 4,
        name: 'All Orders',
        href: '/branch-manager/orders/all-orders',
        icon: 'receipt_long',
        permission: PERMISSIONS.ORDERS_VIEW,
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
        href: '/branch-manager/menu/menu-creation',
        icon: 'menu_book',
        permission: PERMISSIONS.MENU_CREATE,
      },
      {
        id: 2,
        name: 'Menus',
        href: '/branch-manager/menu/menus',
        icon: 'menu_book',
        permission: PERMISSIONS.MENU_VIEW,
      },
      {
        id: 3,
        name: 'GST Rates',
        href: '/branch-manager/menu/gst-rates',
        icon: 'percent',
        permission: PERMISSIONS.GST_VIEW,
      },
      {
        id: 4,
        name: 'Prep Stations',
        href: '/branch-manager/menu/prep-station',
        icon: 'kitchen',
        permission: PERMISSIONS.MENU_UPDATE,
      },
      {
        id: 5,
        name: 'Modifier Groups',
        href: '/branch-manager/menu/modifier-groups',
        icon: 'tune',
        permission: PERMISSIONS.MENU_UPDATE,
      },
      {
        id: 6,
        name: 'Menu Availability',
        href: '/branch-manager/menu/menu-availability',
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
        icon: 'table_restaurant',
        permission: PERMISSIONS.TABLES_VIEW,
      },
      {
        id: 2,
        name: 'Dine In',
        href: '/branch-manager/management/dine-in',
        icon: 'restaurant',
        permission: PERMISSIONS.ORDERS_CREATE,
      },
      {
        id: 3,
        name: 'Cash Counter',
        href: '/branch-manager/management/cash-counter',
        icon: 'currency_rupee',
        permission: PERMISSIONS.PAYMENTS_COLLECT,
      },
      {
        id: 4,
        name: 'Due Payments',
        href: '/branch-manager/management/due-payments',
        icon: 'credit_card',
        permission: PERMISSIONS.PAYMENTS_VIEW,
      },
      {
        id: 5,
        name: 'Kitchen Display',
        href: '/branch-manager/management/kitchen-display',
        icon: 'tv',
        permission: PERMISSIONS.ORDERS_UPDATE_STATUS,
      },
      {
        id: 6,
        name: 'Inventory',
        href: '/branch-manager/management/inventory',
        icon: 'inventory',
        permission: PERMISSIONS.INVENTORY_VIEW,
      },
      {
        id: 7,
        name: 'Customers',
        href: '/branch-manager/management/customers',
        icon: 'people',
        permission: PERMISSIONS.BOOKINGS_VIEW,
      },
      {
        id: 8,
        name: 'Reports',
        href: '/branch-manager/management/reports',
        icon: 'bar_chart',
        permission: PERMISSIONS.REPORTS_VIEW,
      },
      {
        id: 9,
        name: 'Settings',
        href: '/branch-manager/management/settings',
        icon: 'settings',
        permission: PERMISSIONS.FEATURES_CONFIGURE,
      },
      {
        id: 10,
        name: 'Floor & Table Set-up',
        href: '/branch-manager/management/floor-and-table-setup',
        icon: 'view_quilt',
        permission: PERMISSIONS.FLOORS_VIEW,
      },
    ],
  },
];

export const WAITER_SIDEBAR: SidebarEntry[] = [
  {
    id: 1,
    name: 'Tables',
    href: '/branch-manager/pos/captain-flow/tables',
    icon: 'table_restaurant',
    permission: PERMISSIONS.TABLES_VIEW,
  },
  {
    id: 2,
    name: 'Orders',
    href: '/branch-manager/pos/captain-flow/all-orders',
    icon: 'receipt_long',
    permission: PERMISSIONS.ORDERS_VIEW,
  },
  {
    id: 3,
    name: 'Dine-In',
    href: '/branch-manager/pos/captain-flow/order-menu',
    icon: 'restaurant',
    permission: PERMISSIONS.ORDERS_CREATE,
  },
  {
    id: 4,
    name: 'Ready Orders',
    href: '/branch-manager/pos/captain-flow/ready-list',
    icon: 'fact_check',
    permission: PERMISSIONS.ORDERS_VIEW,
  },
  {
    id: 5,
    name: 'Menu Availability',
    href: '/branch-manager/menu/menu-availability',
    icon: 'calendar_today',
    permission: PERMISSIONS.MENU_VIEW,
  },
  {
    id: 6,
    name: 'Kitchen Display',
    href: '/branch-manager/management/kitchen-display',
    icon: 'tv',
    permission: PERMISSIONS.ORDERS_UPDATE_STATUS,
  },
];

export const ORGANIZATION_SIDEBAR: SidebarEntry[] = [
  {
    name: 'Dashboard',
    href: '/organization/dashboard',
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
        icon: 'business',
        permission: PERMISSIONS.COMPANIES_VIEW,
      },
      {
        id: 2,
        name: 'Company Analytics',
        href: '/organization/companies/analytics',
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
        href: '/organization/branches',
        icon: 'storefront',
        permission: PERMISSIONS.BRANCHES_VIEW,
      },
      {
        id: 2,
        name: 'Branch Performance',
        href: '/organization/branches/performance',
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
        icon: 'group',
        permission: PERMISSIONS.USERS_VIEW,
      },
      {
        id: 2,
        name: 'Attendance',
        href: '/organization/employees/attendence',
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
        icon: 'menu_book',
        permission: PERMISSIONS.MENU_CREATE,
      },
      {
        id: 2,
        name: 'Menus',
        href: '/organization/menu/menus',
        icon: 'menu_book',
        permission: PERMISSIONS.MENU_VIEW,
      },
      {
        id: 3,
        name: 'Menu Management',
        href: '/organization/menu/menu-management',
        icon: 'storefront',
        permission: PERMISSIONS.MENU_UPDATE,
      },
      {
        id: 4,
        name: 'Menu Builder',
        href: '/organization/menu/menu-builder',
        icon: 'tune',
        permission: PERMISSIONS.MENU_UPDATE,
      },
    ],
  },
  {
    name: 'Reports',
    permission: PERMISSIONS.REPORTS_VIEW,
    items: [
      {
        id: 1,
        name: 'Sales',
        href: '/organization/reports/sales',
        icon: 'bar_chart',
        permission: PERMISSIONS.REPORTS_VIEW,
      },
      {
        id: 2,
        name: 'Revenue',
        href: '/organization/reports/revenue',
        icon: 'currency_rupee',
        permission: PERMISSIONS.REPORTS_VIEW,
      },
      {
        id: 3,
        name: 'Expenses',
        href: '/organization/reports/expenses',
        icon: 'receipt_long',
        permission: PERMISSIONS.REPORTS_VIEW,
      },
      {
        id: 4,
        name: '% Taxes',
        href: '/organization/reports/taxes',
        icon: 'percent',
        permission: PERMISSIONS.GST_VIEW,
      },
      {
        id: 5,
        name: 'Analytics',
        href: '/organization/reports/analytics',
        icon: 'speed',
        permission: PERMISSIONS.REPORTS_VIEW,
      },
    ],
  },
  {
    name: 'Settings',
    permission: PERMISSIONS.COMPANIES_UPDATE,
    items: [
      {
        id: 1,
        name: 'Organization Settings',
        href: '/organization/settings',
        icon: 'settings',
        permission: PERMISSIONS.COMPANIES_UPDATE,
      },
      {
        id: 2,
        name: 'Subscription',
        href: '/organization/settings/billing',
        icon: 'credit_card',
        permission: PERMISSIONS.FEATURES_VIEW,
      },
      {
        id: 3,
        name: 'Integrations',
        href: '/organization/settings/integrations',
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
  if (key === 'waiter') return 'waiter';
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
};

/** Hierarchy level implied by the URL. Shared module routes such as `/pos` return null. */
export function sidebarLevelFromPath(pathname: string): string | null {
  if (!pathname) return null;
  if (pathname === '/organization' || pathname.startsWith('/organization/')) return 'organization';
  if (pathname === '/company' || pathname.startsWith('/company/')) return 'company';
  if (pathname === '/waiter' || pathname.startsWith('/waiter/')) return 'waiter';
  if (
    pathname === '/branch-manager' ||
    pathname.startsWith('/branch-manager/') ||
    pathname === '/branch' ||
    pathname.startsWith('/branch/')
  ) {
    return 'branch_manager';
  }
  return null;
}

/**
 * Sidebar catalog for the current page.
 * A higher role can drill into a lower catalog. A lower role never sees a wider one.
 */
export function resolveSidebarLevel(pathname: string, role?: string): string {
  const userKey = normalizeRoleKey(role || '');
  const pathKey = sidebarLevelFromPath(pathname);
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
  if (!userKey || userKey === 'waiter' || !level || level === userKey) return null;
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
  if (normalized.includes('waiter') || normalized.includes('captain')) return 'waiter';
  if (normalized.includes('branch')) return 'branch_manager';
  if (normalized.includes('company')) return 'company';
  if (normalized.includes('org')) return 'organization';
  if (normalized.includes('super')) return 'super_admin';
  return normalized;
}

export const ROLE_SIDEBAR_REGISTRY: Record<string, SidebarEntry[]> = {
  company: COMPANY_SIDEBAR,
  company_admin: COMPANY_SIDEBAR,
  branch_manager: BRANCH_MANAGER_SIDEBAR,
  branch_admin: BRANCH_MANAGER_SIDEBAR,
  'branch manager': BRANCH_MANAGER_SIDEBAR,
  restaurant_manager: BRANCH_MANAGER_SIDEBAR,
  waiter: WAITER_SIDEBAR,
  captain: WAITER_SIDEBAR,
  organization: ORGANIZATION_SIDEBAR,
  org_admin: ORGANIZATION_SIDEBAR,
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
  const level = resolveSidebarLevel(pathname, role);
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
  const routeRole = level === 'branch_manager' || level === 'waiter' ? level : role;

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
