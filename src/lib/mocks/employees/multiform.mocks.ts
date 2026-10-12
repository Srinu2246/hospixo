import type {
  RoleTemplateItem,
  PermissionCategory,
  CreateUserFormValues,
} from '@/features/employees/user-roles/types/multiform.types';

export const ROLE_TEMPLATES: RoleTemplateItem[] = [
  {
    id: 'tpl-company-mgr',
    title: 'Company Manager',
    description: 'Purchase orders & supplier management',
    icon: 'company',
    roleName: 'Company Manager',
  },
  {
    id: 'tpl-restaurant-mgr',
    title: 'Restaurant Manager',
    description: 'Daily store operations and staff',
    icon: 'restaurant',
    roleName: 'Restaurant Manager',
  },
  {
    id: 'tpl-pos-counter',
    title: 'POS Counter',
    description: 'Financial approvals and reports',
    icon: 'pos',
    roleName: 'POS Counter',
  },
  {
    id: 'tpl-captain',
    title: 'Captain',
    description: 'Read-only access to all system data',
    icon: 'captain',
    roleName: 'Captain',
  },
  {
    id: 'tpl-kitchen-staff',
    title: 'Kitchen Staff',
    description: 'Kitchen display and order prep',
    icon: 'kitchen',
    roleName: 'Kitchen Staff',
  },
];

export function addRoleTemplate(template: RoleTemplateItem): void {
  ROLE_TEMPLATES.push(template);
}

export const DEFAULT_COMPANIES: readonly string[] = [
  'VJITVI',
  'Apollo Healthcare',
  'Hospixo Group',
] as const;

export const DEFAULT_BRANCHES: readonly string[] = [
  'Downtown Branch',
  'Westside Cafe',
  'Airport Branch',
  'Eastgate Outlet',
] as const;

export const INITIAL_USER_FORM_VALUES: CreateUserFormValues = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  email: '',
  username: '',
  password: '',
  company: 'VJITVI',
  branch: 'Downtown Branch',
  role: 'Branch Manager',
  sendInviteImmediately: true,
  personalMessage: 'Welcome to the team! Here is your access to Hospixo.',
};

export const INITIAL_PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    id: 'companies',
    title: 'Companies',
    permissions: [
      {
        id: 'companies.view',
        name: 'View Companies',
        description: 'View company details',
        enabled: false,
      },
      {
        id: 'companies.create',
        name: 'Create Companies',
        description: 'Create new companies',
        enabled: false,
      },
      {
        id: 'companies.update',
        name: 'Modify company details',
        description: 'Update Companies',
        enabled: false,
      },
    ],
  },
  {
    id: 'branches',
    title: 'Branches',
    permissions: [
      {
        id: 'branches.view',
        name: 'View Branches',
        description: 'View branch details',
        enabled: false,
      },
      {
        id: 'branches.create',
        name: 'Create Branches',
        description: 'Add new branches',
        enabled: false,
      },
      {
        id: 'branches.update',
        name: 'Update Branches',
        description: 'Edit branch details',
        enabled: false,
      },
    ],
  },
  {
    id: 'users',
    title: 'Users',
    permissions: [
      { id: 'users.view', name: 'View Users', description: 'View user accounts', enabled: false },
      { id: 'users.create', name: 'Create Users', description: 'Add new users', enabled: false },
      {
        id: 'users.update',
        name: 'Update Users',
        description: 'Edit user information',
        enabled: false,
      },
      {
        id: 'users.delete',
        name: 'Delete Users',
        description: 'Remove user accounts',
        enabled: false,
      },
      {
        id: 'users.activate',
        name: 'Activate Users',
        description: 'Enable user access',
        enabled: false,
      },
      {
        id: 'users.deactivate',
        name: 'Deactivate Users',
        description: 'Disable user access',
        enabled: false,
      },
      {
        id: 'users.assign_roles',
        name: 'Assign Roles',
        description: 'Assign roles to users',
        enabled: false,
      },
      {
        id: 'users.remove_roles',
        name: 'Remove Roles',
        description: 'Remove roles from users',
        enabled: false,
      },
    ],
  },
  {
    id: 'subscriptions',
    title: 'Subscriptions',
    permissions: [
      {
        id: 'subscriptions.assign',
        name: 'Assign Subscriptions',
        description: 'Assign subscriptions to entities',
        enabled: false,
      },
    ],
  },
  {
    id: 'features',
    title: 'Features',
    permissions: [
      {
        id: 'features.view',
        name: 'View Features',
        description: 'View available features',
        enabled: false,
      },
      {
        id: 'features.configure',
        name: 'Configure Features',
        description: 'Configure feature settings',
        enabled: false,
      },
    ],
  },
  {
    id: 'pos_sessions',
    title: 'POS Sessions & Shifts',
    permissions: [
      {
        id: 'pos.open_session',
        name: 'Open POS Session',
        description: 'Open new POS sessions',
        enabled: false,
      },
      {
        id: 'pos.close_session',
        name: 'Close POS Session',
        description: 'Close active POS sessions',
        enabled: false,
      },
      {
        id: 'pos.close_shift',
        name: 'Close POS Shift',
        description: 'Close POS shifts',
        enabled: false,
      },
    ],
  },
  {
    id: 'menu',
    title: 'Menu',
    permissions: [
      { id: 'menu.view', name: 'View Menu', description: 'View menu catalog', enabled: false },
      {
        id: 'menu.create',
        name: 'Create Menu Items',
        description: 'Add new menu items',
        enabled: false,
      },
      {
        id: 'menu.update',
        name: 'Update Menu Items',
        description: 'Edit menu items',
        enabled: false,
      },
      {
        id: 'menu.delete',
        name: 'Delete Menu Items',
        description: 'Remove menu items',
        enabled: false,
      },
    ],
  },
  {
    id: 'branch_menu',
    title: 'Branch Menu',
    permissions: [
      {
        id: 'branch_menu.view',
        name: 'View Branch Menu',
        description: 'View branch pricing and menus',
        enabled: false,
      },
      {
        id: 'branch_menu.update',
        name: 'Update Branch Menu',
        description: 'Configure branch pricing',
        enabled: false,
      },
      {
        id: 'branch_menu.override',
        name: 'Override Items',
        description: 'Override branch availability',
        enabled: false,
      },
      {
        id: 'branch_menu.publish',
        name: 'Publish Menu',
        description: 'Publish menu to live register',
        enabled: false,
      },
    ],
  },
];

export const DEFAULT_STAFF_PROFILE_PERMISSIONS: PermissionCategory[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    permissions: [
      {
        id: 'dashboard.view',
        name: 'View Dashboard',
        description: 'Access to the main overview and KPI tiles',
        enabled: true,
      },
      {
        id: 'dashboard.analytics',
        name: 'View Analytics',
        description: 'Detailed charts and data trends analysis',
        enabled: true,
      },
    ],
  },
  {
    id: 'user_management',
    title: 'User Management',
    permissions: [
      {
        id: 'users.create',
        name: 'Create Users',
        description: 'Invite and add new members to the system',
        enabled: true,
      },
      {
        id: 'users.edit',
        name: 'Edit Users',
        description: 'Modify existing user details and status',
        enabled: true,
      },
      {
        id: 'users.delete',
        name: 'Delete Users',
        description: 'Remove users permanently from the organization',
        enabled: true,
      },
    ],
  },
  {
    id: 'branch_management',
    title: 'Branch Management',
    permissions: [
      {
        id: 'branches.view',
        name: 'View Branches',
        description: 'See details of all connected branch locations',
        enabled: true,
      },
      {
        id: 'branches.manage',
        name: 'Manage Branches',
        description: 'Edit branch info, opening hours, and zones',
        enabled: true,
      },
    ],
  },
  {
    id: 'inventory',
    title: 'Inventory',
    permissions: [
      {
        id: 'inventory.view',
        name: 'View Inventory',
        description: 'Monitor stock levels and tracking',
        enabled: false,
      },
      {
        id: 'inventory.items',
        name: 'Manage Items',
        description: 'Add or edit items in the product catalog',
        enabled: false,
      },
    ],
  },
];

export const DEFAULT_CUSTOM_TEMPLATE_PERMISSIONS: PermissionCategory[] = [
  {
    id: 'user_roles_mgmt',
    title: 'User & Roles Management',
    permissions: [
      {
        id: 'roles.create',
        name: 'Create Custom Role',
        description: 'Define new user roles with specific access',
        enabled: false,
      },
      {
        id: 'roles.assign',
        name: 'Assign Role Permissions',
        description: 'Set and modify permissions for roles',
        enabled: false,
      },
    ],
  },
  {
    id: 'order_kot',
    title: 'Order & KOT',
    permissions: [
      {
        id: 'orders.create',
        name: 'Create Order',
        description: 'Place new dine-in or takeaway orders',
        enabled: false,
      },
      {
        id: 'orders.kot',
        name: 'Send KOT',
        description: 'Send kitchen order tickets to the kitchen display',
        enabled: false,
      },
    ],
  },
  {
    id: 'pos_billing',
    title: 'POS & Billing',
    permissions: [
      {
        id: 'billing.generate',
        name: 'Generate Bill',
        description: 'Create and print customer bills',
        enabled: false,
      },
      {
        id: 'billing.discount',
        name: 'Apply Discount',
        description: 'Apply discounts on orders or bills',
        enabled: false,
      },
      {
        id: 'billing.drawer',
        name: 'Manually Open Cash Drawer',
        description: 'Open the cash drawer without a transaction',
        enabled: false,
      },
    ],
  },
  {
    id: 'payments',
    title: 'Payments',
    permissions: [
      {
        id: 'payments.collect',
        name: 'Collect Payment',
        description: 'Accept and process customer payments',
        enabled: false,
      },
      {
        id: 'payments.settle',
        name: 'Settle Payment',
        description: 'Settle and close payment transactions',
        enabled: false,
      },
      {
        id: 'payments.refund',
        name: 'Approve Refund',
        description: 'Authorize refunds to customers',
        enabled: false,
      },
    ],
  },
  {
    id: 'reports',
    title: 'Reports',
    permissions: [
      {
        id: 'reports.sales',
        name: 'View Sales Report',
        description: 'Access sales data and revenue reports',
        enabled: false,
      },
    ],
  },
  {
    id: 'inventory',
    title: 'Inventory',
    permissions: [
      {
        id: 'inventory.view',
        name: 'View Inventory',
        description: 'Monitor stock levels and tracking',
        enabled: false,
      },
      {
        id: 'inventory.manage',
        name: 'Manage Items',
        description: 'Add or edit items in the product catalog',
        enabled: false,
      },
    ],
  },
];

export const DEFAULT_STAFF_PROFILE = {
  id: 'usr-marco',
  firstName: 'Marco',
  lastName: 'Rossi',
  email: 'marco@email.com',
  phoneNumber: '(555) 123-4567',
  countryCode: '+1',
  username: 'Marco123',
  password: 'Marco@123',
  userStatus: true,
  roleName: 'Branch Manager',
  roleDescription: 'Manages staff and inventory at a specific branch level.',
};
