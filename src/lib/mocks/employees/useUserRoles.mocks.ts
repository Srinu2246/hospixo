import { z } from 'zod';

import {
  DEFAULT_STAFF_PROFILE_PERMISSIONS,
  roleTemplateItemSchema,
  userRoleListSchema,
  type UserRoleItem,
  type RoleTemplateItem,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';
import type { HttpMethod, QueryParams } from '@/services/api/types';

// ============================================================================
// 3. User Mock Records
// ============================================================================

type InitialUserTuple = [
  id: string,
  name: string,
  email: string,
  role: string,
  branch: string,
  status: 'active' | 'invited' | 'disabled',
  avatar: string,
  createdAt: string,
  company?: string,
];

const INITIAL_USERS_RAW_DEFS: ReadonlyArray<InitialUserTuple> = [
  [
    'usr-1',
    'Marcus Wright',
    'm.marcus@hospixo.com',
    'Branch Manager',
    'Downtown HQ',
    'active',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    '2024-01-15',
  ],
  [
    'usr-2',
    'Elena Rodriguez',
    'elena.r@hospixo.com',
    'Inventory',
    'Westside Cafe',
    'active',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    '2024-02-10',
  ],
  [
    'usr-3',
    'David Kim',
    'd.kim@hospixo.com',
    'Cashier',
    'Airport Branch',
    'invited',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    '2024-03-01',
  ],
  [
    'usr-4',
    'Jamal Washington',
    'j.wash@hospixo.com',
    'Kitchen Staff',
    'Downtown HQ',
    'active',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    '2024-03-12',
  ],
  [
    'usr-5',
    'Sophie Miller',
    's.miller@hospixo.com',
    'Staff',
    'Westside Cafe',
    'disabled',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    '2024-01-22',
  ],
  [
    'usr-6',
    'Oliver Twist',
    'o.twist@hospixo.com',
    'Kitchen Staff',
    'Eastgate Outlet',
    'active',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
    '2024-02-18',
  ],
  [
    'usr-7',
    'Amina Al-Mansoor',
    'a.mansoor@hospixo.com',
    'Staff',
    'Downtown HQ',
    'active',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80',
    '2024-01-05',
  ],
  [
    'usr-8',
    'Lucas Vance',
    'l.vance@hospixo.com',
    'Branch Manager',
    'Westside Cafe',
    'active',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
    '2024-02-28',
  ],
  [
    'usr-9',
    'Zara Patel',
    'z.patel@hospixo.com',
    'Cashier',
    'Eastgate Outlet',
    'invited',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
    '2024-03-05',
  ],
  [
    'usr-10',
    'Carlos Mendez',
    'c.mendez@hospixo.com',
    'Staff',
    'Airport Branch',
    'active',
    'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=120&q=80',
    '2024-01-12',
  ],
  [
    'usr-11',
    'Liam Chen',
    'l.chen@hospixo.com',
    'Captain',
    'Airport Branch',
    'active',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80',
    '2024-01-20',
  ],
  [
    'usr-12',
    'Amara Okafor',
    'a.okafor@hospixo.com',
    'Waiter',
    'Eastgate Outlet',
    'invited',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    '2024-02-01',
  ],
  [
    'usr-13',
    'Noah Williams',
    'n.williams@hospixo.com',
    'Barista',
    'Downtown HQ',
    'active',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    '2024-02-04',
  ],
  [
    'usr-14',
    'Priya Sharma',
    'p.sharma@hospixo.com',
    'Accountant',
    'Downtown HQ',
    'active',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    '2024-02-08',
  ],
  [
    'usr-15',
    'Daniel Brooks',
    'd.brooks@hospixo.com',
    'Operations Lead',
    'Westside Cafe',
    'invited',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    '2024-02-15',
  ],
  [
    'usr-16',
    'Isabella Rossi',
    'i.rossi@hospixo.com',
    'Shift Supervisor',
    'Airport Branch',
    'invited',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    '2024-02-20',
    'VJITVI',
  ],
  [
    'usr-org-1',
    'Alexander Wright',
    'a.wright@hospixo.com',
    'Organization Admin',
    'Global HQ',
    'active',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    '2024-01-01',
    'VJITVI',
  ],
];

const INITIAL_USERS_RAW = INITIAL_USERS_RAW_DEFS.map(
  ([id, name, email, role, branch, status, avatar, createdAt, company]) => ({
    id,
    name,
    email,
    role,
    branch,
    status,
    avatar,
    createdAt,
    ...(company ? { company } : {}),
  }),
);

export const INITIAL_USERS: UserRoleItem[] = userRoleListSchema.parse(
  INITIAL_USERS_RAW.map((u) => {
    const roleLower = u.role.toLowerCase();
    const isOrg = roleLower.includes('org') || roleLower.includes('super');
    const isCompany =
      roleLower.includes('company') ||
      roleLower.includes('accountant') ||
      roleLower.includes('finance') ||
      roleLower.includes('inventory') ||
      roleLower.includes('hr');
    const scope = isOrg ? 'organization' : isCompany ? 'company' : 'branch';
    const company =
      ('company' in u && u.company) ||
      (u.branch.includes('Airport')
        ? 'Spice Garden Group'
        : u.branch.includes('Eastgate')
          ? 'Urban Bites Co'
          : 'Al Baik Foods Ltd');
    const companyId =
      company === 'Al Baik Foods Ltd'
        ? 12
        : company === 'Spice Garden Group'
          ? 18
          : company === 'Urban Bites Co'
            ? 21
            : undefined;
    const branchId = u.branch.includes('Downtown')
      ? 101
      : u.branch.includes('Westside')
        ? 102
        : u.branch.includes('Airport')
          ? 103
          : u.branch.includes('Eastgate')
            ? 104
            : undefined;
    return {
      ...u,
      company,
      companyId,
      branchId,
      phone: 'phone' in u && typeof u.phone === 'string' ? u.phone : undefined,
      scope,
    };
  }),
);

const COMPANY_INITIAL_USERS: UserRoleItem[] = userRoleListSchema.parse(
  INITIAL_USERS.map((u) => ({
    ...u,
    branch: u.branch.replace(' HQ', ' Branch'),
    company: 'VJITVI',
  })),
);

const BRANCH_INITIAL_USERS: UserRoleItem[] = userRoleListSchema.parse(
  INITIAL_USERS.slice(0, 6).map((u, i) => ({
    ...u,
    id: `usr-branch-${i + 1}`,
    branch: 'Downtown Branch',
    company: 'VJITVI',
    scope: 'branch' as const,
  })),
);

// ============================================================================
// 4. Role Templates
// ============================================================================

const roleTemplateListSchema = z.array(roleTemplateItemSchema);

const ROLE_TEMPLATE_DEFS: ReadonlyArray<
  [
    id: string,
    title: string,
    description: string,
    icon: RoleTemplateItem['icon'],
    roleName: string,
    scope: 'branch' | 'company',
  ]
> = [
  [
    '9',
    'Branch Admin',
    'Branch operations and local approvals',
    'restaurant',
    'Branch Admin',
    'branch',
  ],
  ['12', 'Cashier', 'Payments, shifts, billing', 'pos', 'Cashier', 'branch'],
  ['14', 'Hotel Manager', 'Rooms, bookings, front desk', 'company', 'Hotel Manager', 'branch'],
  [
    '13',
    'Kitchen Staff',
    'Kitchen order preparation and status updates',
    'kitchen',
    'Kitchen Staff',
    'branch',
  ],
  ['15', 'Receptionist', 'Bookings, check-in/out', 'restaurant', 'Receptionist', 'branch'],
  [
    '10',
    'Restaurant Manager',
    'Menu, tables, order visibility',
    'restaurant',
    'Restaurant Manager',
    'branch',
  ],
  [
    '11',
    'Waiter / Steward',
    'Creates and updates assigned orders',
    'captain',
    'Waiter / Steward',
    'branch',
  ],
  ['7', 'Accountant', 'Reviews invoices, journals, GST prep', 'company', 'Accountant', 'company'],
  [
    '4',
    'Company Admin',
    'Manages one specific company: branches, users, settings',
    'company',
    'Company Admin',
    'company',
  ],
  ['5', 'Finance Admin', 'Invoices, journals, GST, ledgers', 'company', 'Finance Admin', 'company'],
  ['6', 'HR Admin', 'Employees, attendance, payroll', 'company', 'HR Admin', 'company'],
  [
    '8',
    'Inventory Manager',
    'Stock, suppliers, PO lifecycle',
    'company',
    'Inventory Manager',
    'company',
  ],
];

export const COMPANY_ROLE_TEMPLATES: RoleTemplateItem[] = roleTemplateListSchema.parse(
  ROLE_TEMPLATE_DEFS.map(([id, title, description, icon, roleName, scope]) => ({
    id,
    title,
    description,
    icon,
    roleName,
    scope,
  })),
);

// ============================================================================
// 5. Permission Categories (imported from schema)
// ============================================================================

// ============================================================================
// 6. Mock Request Resolver (for serverClient / handler.ts)
// ============================================================================

type MockRequest = {
  method: HttpMethod;
  path: string;
  params?: QueryParams;
  body?: unknown;
};

const mockUsersDataset: UserRoleItem[] = [...INITIAL_USERS];

export const mockUserPermissionsMap = new Map<string, string[]>();

const DEFAULT_COMPANY_PERMISSION_CODES = [
  'dashboard.view',
  'dashboard.analytics',
  'users.view',
  'users.create',
  'users.edit',
  'roles.view',
  'company.view',
  'company.manage',
  'branches.view',
  'inventory.view',
  'reports.view',
];

const DEFAULT_BRANCH_PERMISSION_CODES = [
  'dashboard.view',
  'dashboard.analytics',
  'users.view',
  'users.create',
  'users.edit',
  'users.delete',
  'roles.view',
  'branches.view',
  'branches.manage',
];

const ROLE_PERMISSIONS_BY_ID: Record<string, string[]> = {
  // Branch roles
  '9': ['dashboard.view', 'branches.view', 'users.view', 'reports.view'], // Branch Admin
  '10': ['dashboard.view', 'reports.view', 'inventory.view'], // Restaurant Manager
  '11': ['dashboard.view', 'reports.view'], // Waiter / Steward
  '12': ['dashboard.view', 'reports.view'], // Cashier
  '13': ['dashboard.view'], // Kitchen Staff
  '14': ['dashboard.view', 'branches.view', 'reports.view'], // Hotel Manager
  '15': ['dashboard.view', 'reports.view'], // Receptionist
  // Company roles
  '4': [
    'dashboard.view',
    'dashboard.analytics',
    'company.view',
    'company.manage',
    'branches.view',
    'users.view',
  ], // Company Admin
  '5': ['dashboard.view', 'company.view', 'reports.view', 'reports.export'], // Finance Admin
  '6': ['dashboard.view', 'users.view', 'users.create', 'users.edit'], // HR Admin
  '7': ['dashboard.view', 'company.view', 'reports.view', 'reports.export'], // Accountant
  '8': ['dashboard.view', 'inventory.view', 'inventory.items'], // Inventory Manager
  // Organization roles
  '1': [
    'dashboard.view',
    'dashboard.analytics',
    'company.view',
    'company.manage',
    'users.view',
    'users.create',
    'roles.view',
    'reports.view',
  ],
  '2': ['dashboard.view', 'company.view', 'users.view', 'reports.view'],
  '3': ['dashboard.view', 'users.view'],
};

export function getDefaultPermissionCodes(isCompanyScope: boolean): string[] {
  return isCompanyScope ? DEFAULT_COMPANY_PERMISSION_CODES : DEFAULT_BRANCH_PERMISSION_CODES;
}

function saveMockPermissions(
  userId: string,
  body: unknown,
): { success: boolean; data: { permission_codes: string[] } } {
  const payload = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const codes = Array.isArray(payload.permission_codes)
    ? (payload.permission_codes as string[])
    : Array.isArray(payload.permission_ids)
      ? (payload.permission_ids as string[])
      : [];
  mockUserPermissionsMap.set(userId, codes);
  return { success: true, data: { permission_codes: codes } };
}

function getEffectiveMockCodes(userId: string, isCompany: boolean): string[] {
  const savedCodes = mockUserPermissionsMap.get(userId);
  return savedCodes !== undefined ? savedCodes : getDefaultPermissionCodes(isCompany);
}

function formatMockUserDetail(user: UserRoleItem): Record<string, unknown> {
  const roleLower = user.role.toLowerCase();
  const template = COMPANY_ROLE_TEMPLATES.find(
    (t) =>
      t.roleName.toLowerCase() === roleLower ||
      t.id === String(user.roleId ?? '') ||
      (roleLower.includes('inventory') && t.roleName === 'Inventory Manager') ||
      (roleLower.includes('branch') && t.roleName === 'Branch Admin') ||
      (roleLower.includes('company') && t.roleName === 'Company Admin') ||
      (roleLower.includes('finance') && t.roleName === 'Finance Admin') ||
      (roleLower.includes('accountant') && t.roleName === 'Accountant') ||
      (roleLower.includes('cashier') && t.roleName === 'Cashier') ||
      (roleLower.includes('restaurant') && t.roleName === 'Restaurant Manager') ||
      (roleLower.includes('kitchen') && t.roleName === 'Kitchen Staff') ||
      (roleLower.includes('hr') && t.roleName === 'HR Admin'),
  );

  const roleId = user.roleId ?? (template?.id ? Number(template.id) || template.id : 4);
  const isCompanyRole =
    user.scope === 'company' ||
    template?.scope === 'company' ||
    roleId === 4 ||
    roleId === 5 ||
    roleId === 6 ||
    roleId === 7 ||
    roleId === 8;
  const roleScope = isCompanyRole ? 'company' : (user.scope ?? template?.scope ?? 'branch');

  return {
    ...user,
    first_name: user.name.split(' ')[0] ?? 'User',
    last_name: user.name.split(' ').slice(1).join(' ') ?? '',
    phone: user.phone ?? '',
    phone_number: user.phone ?? '',
    username: user.email.split('@')[0] ?? 'user',
    description: template?.description ?? `Operations for ${user.role}.`,
    role_description: template?.description ?? `Operations for ${user.role}.`,
    role_id: roleId,
    roleId,
    role_code: user.roleCode ?? template?.roleName.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
    scope: roleScope,
    company_id: user.companyId ?? 94,
    companyId: user.companyId ?? 94,
    branch_id: user.branchId ?? (roleScope === 'branch' ? 1 : undefined),
    branchId: user.branchId ?? (roleScope === 'branch' ? 1 : undefined),
    is_active: user.status === 'active',
    ...(mockUserPermissionsMap.has(user.id)
      ? {
          permissions: mockUserPermissionsMap.get(user.id),
          permission_codes: mockUserPermissionsMap.get(user.id),
        }
      : {}),
  };
}

function resolveUsersMock(request: MockRequest, itemId?: string): unknown {
  if (request.method === 'GET') {
    if (itemId) {
      const allUsers = [...mockUsersDataset, ...COMPANY_INITIAL_USERS, ...BRANCH_INITIAL_USERS];
      const found = allUsers.find((user) => user.id === itemId) ?? mockUsersDataset[0];
      return formatMockUserDetail(found);
    }
    let items = [...mockUsersDataset];
    const search = request.params?.search;
    if (typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (user) =>
          user.name.toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q) ||
          (user.phone && user.phone.includes(q)),
      );
    }
    const status = request.params?.status;
    if (
      typeof status === 'string' &&
      status.trim() &&
      status !== 'all' &&
      status !== 'All Statuses'
    ) {
      items = items.filter((user) => user.status.toLowerCase() === status.toLowerCase());
    }
    const role = request.params?.role;
    if (typeof role === 'string' && role.trim() && role !== 'all' && role !== 'All Roles') {
      const rLower = role.toLowerCase();
      items = items.filter(
        (user) =>
          user.role.toLowerCase() === rLower ||
          user.roleCode?.toLowerCase() === rLower ||
          user.role.toLowerCase().replace(/[^a-z0-9]+/g, '_') === rLower,
      );
    }
    const companyId = request.params?.company_id;
    if (companyId != null && String(companyId).trim()) {
      items = items.filter((user) => String(user.companyId ?? '') === String(companyId));
    }
    const branchId = request.params?.branch_id;
    if (branchId != null && String(branchId).trim()) {
      items = items.filter((user) => String(user.branchId ?? '') === String(branchId));
    }
    const branchName = request.params?.branch;
    if (typeof branchName === 'string' && branchName.trim()) {
      items = items.filter((user) => user.branch.toLowerCase() === branchName.toLowerCase());
    }

    // Sort users
    const sortBy = String(request.params?.sort_by ?? 'created_at');
    const sortOrder = String(request.params?.sort_order ?? 'desc').toLowerCase();
    items.sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';
      if (sortBy === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortBy === 'email') {
        valA = a.email.toLowerCase();
        valB = b.email.toLowerCase();
      } else if (sortBy === 'role') {
        valA = a.role.toLowerCase();
        valB = b.role.toLowerCase();
      } else if (sortBy === 'status') {
        valA = a.status.toLowerCase();
        valB = b.status.toLowerCase();
      } else if (sortBy === 'branch') {
        valA = a.branch.toLowerCase();
        valB = b.branch.toLowerCase();
      } else if (sortBy === 'company') {
        valA = (a.company ?? '').toLowerCase();
        valB = (b.company ?? '').toLowerCase();
      } else if (sortBy === 'id') {
        valA = a.id;
        valB = b.id;
      } else {
        valA = a.createdAt ?? '';
        valB = b.createdAt ?? '';
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const total = items.length;
    const page = Math.max(1, Number(request.params?.page) || 1);
    const pageSize = Math.max(1, Math.min(100, Number(request.params?.page_size) || 20));
    const startIndex = (page - 1) * pageSize;
    const pagedItems = items.slice(startIndex, startIndex + pageSize);

    const summary = {
      total_users: mockUsersDataset.length,
      active_now: mockUsersDataset.filter((u) => u.status === 'active').length,
      pending_invites: mockUsersDataset.filter((u) => u.status === 'invited').length,
      user_roles: new Set(mockUsersDataset.map((u) => u.role)).size,
    };

    return {
      items: pagedItems,
      total,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(total / pageSize) || 1,
      summary,
    };
  }

  if (request.method === 'POST') {
    const body = (request.body && typeof request.body === 'object' ? request.body : {}) as Record<
      string,
      unknown
    >;
    const firstName = String(body.first_name ?? body.firstName ?? '').trim();
    const lastName = String(body.last_name ?? body.lastName ?? '').trim();
    const joinedName = [firstName, lastName].filter(Boolean).join(' ') || 'New User';
    const email = String(body.email ?? 'user@hospixo.com')
      .trim()
      .toLowerCase();
    const roleString = String(body.role ?? 'Staff');
    const roleLower = roleString.toLowerCase();
    const isCompany =
      body.scope === 'company' ||
      roleLower.includes('company') ||
      roleLower.includes('finance') ||
      roleLower.includes('hr') ||
      roleLower.includes('accountant') ||
      roleLower.includes('inventory');
    const isOrg = body.scope === 'organization' || roleLower.includes('super');
    const userScope = isOrg ? 'organization' : isCompany ? 'company' : 'branch';
    const newUser: UserRoleItem = {
      id: `usr-${Date.now()}`,
      name: joinedName,
      email,
      role: roleString,
      branch: String(body.branch_name ?? body.branch ?? 'Downtown Branch'),
      status: 'active',
      phone: body.phone
        ? String(body.phone)
        : body.phone_number
          ? String(body.phone_number)
          : undefined,
      scope: userScope,
      companyId: 94,
    };
    mockUsersDataset.unshift(newUser);
    return newUser;
  }

  if (request.method === 'PUT' && itemId) {
    const body = (request.body && typeof request.body === 'object' ? request.body : {}) as Record<
      string,
      unknown
    >;
    const idx = mockUsersDataset.findIndex((u) => u.id === itemId);
    const existing = idx >= 0 ? mockUsersDataset[idx] : undefined;
    const firstName = body.first_name ?? body.firstName;
    const lastName = body.last_name ?? body.lastName;
    const name =
      firstName || lastName
        ? [firstName, lastName].filter(Boolean).join(' ')
        : (existing?.name ?? 'User');
    const updatedPhone = body.phone ?? body.phone_number ?? existing?.phone;
    const updated: UserRoleItem = {
      id: itemId,
      name: String(name),
      email: String(body.email ?? existing?.email ?? 'user@hospixo.com'),
      role: String(body.role ?? existing?.role ?? 'Staff'),
      branch: String(body.branch ?? existing?.branch ?? 'Downtown Branch'),
      status: (body.status as UserRoleItem['status']) ?? existing?.status ?? 'active',
      phone: updatedPhone ? String(updatedPhone) : undefined,
      scope: existing?.scope ?? 'branch',
      avatar: existing?.avatar,
      createdAt: existing?.createdAt,
    };
    if (idx >= 0) {
      mockUsersDataset[idx] = updated;
    } else {
      mockUsersDataset.push(updated);
    }
    return updated;
  }

  if (request.method === 'PATCH' && itemId) {
    const body = (request.body && typeof request.body === 'object' ? request.body : {}) as Record<
      string,
      unknown
    >;
    const idx = mockUsersDataset.findIndex((u) => u.id === itemId);
    const nextStatus = (body.status as UserRoleItem['status']) ?? 'active';
    if (idx >= 0) {
      mockUsersDataset[idx] = { ...mockUsersDataset[idx], status: nextStatus };
    }
    return { id: itemId, status: nextStatus };
  }

  if (request.method === 'DELETE' && itemId) {
    const idx = mockUsersDataset.findIndex((u) => u.id === itemId);
    if (idx >= 0) {
      mockUsersDataset.splice(idx, 1);
    }
    return { success: true };
  }

  return { success: true };
}

export function resolveUserRolesMock(request: MockRequest): unknown | undefined {
  if (request.path === '/v1/permissions/grouped' && request.method === 'GET') {
    return DEFAULT_STAFF_PROFILE_PERMISSIONS;
  }

  if (request.path === '/v1/roles/templates' && request.method === 'GET') {
    return COMPANY_ROLE_TEMPLATES;
  }

  const rolePermissionsMatch = request.path.match(/^\/v1\/roles\/([^/?]+)\/permissions(?:\?.*)?$/);
  if (rolePermissionsMatch) {
    if (request.method === 'GET') {
      const roleIdStr = String(rolePermissionsMatch[1]);
      const roleIdNum = Number(roleIdStr) || 12;
      const requestedScope = String(request.params?.scope_type ?? 'branch');
      const isCompanyScope =
        requestedScope === 'company' ||
        roleIdNum === 4 ||
        roleIdNum === 5 ||
        roleIdNum === 6 ||
        roleIdNum === 7 ||
        roleIdNum === 8;

      const permissionCodes =
        ROLE_PERMISSIONS_BY_ID[roleIdStr] ??
        ROLE_PERMISSIONS_BY_ID[String(roleIdNum)] ??
        (isCompanyScope ? ['company.view', 'reports.view'] : ['dashboard.view', 'reports.view']);

      return {
        success: true,
        data: {
          role_id: roleIdNum,
          scope_type: isCompanyScope ? 'company' : requestedScope,
          organization_id: 1,
          inherited_permission_codes: [],
          permission_codes: permissionCodes,
          total_permissions: permissionCodes.length,
          page: 1,
          page_size: 100,
          total_pages: 1,
          scope_adjustments: [],
        },
      };
    }
    if (request.method === 'PUT') {
      return { success: true };
    }
  }

  if (request.path.startsWith('/v1/roles') && request.method === 'GET') {
    return {
      success: true,
      data: {
        roles: COMPANY_ROLE_TEMPLATES.map((t) => ({
          id: Number(t.id) || t.id,
          code: t.roleName.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
          display_name: t.title,
          name: t.roleName,
          scope: t.scope ?? 'company',
          description: t.description,
          status: 'active',
          is_system_role: true,
        })),
      },
      message: 'Roles retrieved',
    };
  }

  const userRolesMatch = request.path.match(/^\/v1\/users\/([^/]+)\/roles/);
  if (userRolesMatch) {
    const userId = userRolesMatch[1];
    if (request.method === 'PUT' || request.method === 'POST') {
      const body = (request.body && typeof request.body === 'object' ? request.body : {}) as Record<
        string,
        unknown
      >;
      const rolesArr = Array.isArray(body.roles) ? (body.roles as Record<string, unknown>[]) : [];
      const roleCode = String(rolesArr[0]?.role_code ?? body.role_code ?? '').trim();
      if (roleCode) {
        const template = COMPANY_ROLE_TEMPLATES.find(
          (t) =>
            t.roleName.toLowerCase() === roleCode.toLowerCase() ||
            t.id.toLowerCase() === roleCode.toLowerCase(),
        );
        const idx = mockUsersDataset.findIndex((u) => u.id === userId);
        if (idx >= 0) {
          mockUsersDataset[idx] = {
            ...mockUsersDataset[idx],
            role: template?.roleName ?? roleCode,
            roleCode,
          };
        }
      }
      return { success: true };
    }
    return { success: true, data: { roles: [] } };
  }

  const userAssignmentsMatch = request.path.match(/^\/v1\/users\/([^/]+)\/assignments/);
  if (userAssignmentsMatch) {
    const userId = userAssignmentsMatch[1];
    const allUsers = [...mockUsersDataset, ...COMPANY_INITIAL_USERS, ...BRANCH_INITIAL_USERS];
    const found = allUsers.find((u) => u.id === userId);
    const template = COMPANY_ROLE_TEMPLATES.find(
      (t) =>
        (found && t.roleName.toLowerCase() === found.role.toLowerCase()) ||
        (found && t.id === String(found.roleId ?? '')),
    );
    const roleId = found?.roleId ?? (template?.id ? Number(template.id) || template.id : 4);
    const isCompany =
      found?.scope === 'company' ||
      roleId === 4 ||
      roleId === 5 ||
      roleId === 6 ||
      roleId === 7 ||
      roleId === 8;
    const codes = getEffectiveMockCodes(userId, isCompany);

    return {
      success: true,
      data: [
        {
          id: String(roleId),
          user_role_id: String(roleId),
          userRoleId: String(roleId),
          role_id: roleId,
          roleId,
          role_name: found?.role ?? template?.roleName ?? 'Company Admin',
          roleName: found?.role ?? template?.roleName ?? 'Company Admin',
          scope: isCompany ? 'company' : 'branch',
          permission_codes: codes,
        },
      ],
    };
  }

  const userRolePermsMatch = request.path.match(
    /^\/v1\/users\/([^/]+)\/roles\/([^/]+)\/permissions/,
  );
  if (userRolePermsMatch) {
    const userId = userRolePermsMatch[1];
    const userRoleId = Number(userRolePermsMatch[2]) || 4;
    const isCompany =
      userRoleId === 4 ||
      userRoleId === 5 ||
      userRoleId === 6 ||
      userRoleId === 7 ||
      userRoleId === 8;

    if (request.method === 'PUT') {
      return saveMockPermissions(userId, request.body);
    }

    const codes = getEffectiveMockCodes(userId, isCompany);

    return {
      success: true,
      data: {
        role_id: userRoleId,
        scope_type: isCompany ? 'company' : 'branch',
        inherited_permission_codes: codes,
        permission_codes: codes,
        total_permissions: codes.length,
      },
    };
  }

  const userDirectPermsMatch = request.path.match(/^\/v1\/users\/([^/]+)\/permissions/);
  if (userDirectPermsMatch) {
    const userId = userDirectPermsMatch[1];

    if (request.method === 'PUT') {
      return saveMockPermissions(userId, request.body);
    }

    return {
      success: true,
      data: {
        permission_codes: getEffectiveMockCodes(userId, true),
      },
    };
  }

  const usersMatch = request.path.match(/^\/v1\/users(?:\/([^/]+))?/);
  if (usersMatch) {
    return resolveUsersMock(request, usersMatch[1]);
  }

  const legacyMatch = request.path.match(
    /^\/v1\/(company\/|branch\/)?employees\/user-roles(\/([^/]+))?$/,
  );
  if (legacyMatch) {
    return resolveUsersMock(request, legacyMatch[3]);
  }

  return undefined;
}
