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

const INITIAL_USERS_RAW = [
  {
    id: 'usr-1',
    name: 'Marcus Wright',
    email: 'm.marcus@hospixo.com',
    role: 'Branch Manager',
    branch: 'Downtown HQ',
    status: 'active',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-01-15',
  },
  {
    id: 'usr-2',
    name: 'Elena Rodriguez',
    email: 'elena.r@hospixo.com',
    role: 'Inventory',
    branch: 'Westside Cafe',
    status: 'active',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-02-10',
  },
  {
    id: 'usr-3',
    name: 'David Kim',
    email: 'd.kim@hospixo.com',
    role: 'Cashier',
    branch: 'Airport Branch',
    status: 'invited',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-03-01',
  },
  {
    id: 'usr-4',
    name: 'Jamal Washington',
    email: 'j.wash@hospixo.com',
    role: 'Kitchen Staff',
    branch: 'Downtown HQ',
    status: 'active',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-03-12',
  },
  {
    id: 'usr-5',
    name: 'Sophie Miller',
    email: 's.miller@hospixo.com',
    role: 'Staff',
    branch: 'Westside Cafe',
    status: 'disabled',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-01-22',
  },
  {
    id: 'usr-6',
    name: 'Oliver Twist',
    email: 'o.twist@hospixo.com',
    role: 'Kitchen Staff',
    branch: 'Eastgate Outlet',
    status: 'active',
    avatar:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-02-18',
  },
  {
    id: 'usr-7',
    name: 'Maya Patel',
    email: 'm.maya@hospixo.com',
    role: 'Cashier',
    branch: 'Westside Cafe',
    status: 'invited',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-03-05',
  },
  {
    id: 'usr-8',
    name: 'Alex Morgan',
    email: 'a.morgan@hospixo.com',
    role: 'Branch Manager',
    branch: 'Downtown HQ',
    status: 'active',
    avatar:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-01-08',
  },
  {
    id: 'usr-9',
    name: 'Lucas Silva',
    email: 'l.silva@hospixo.com',
    role: 'Head Chef',
    branch: 'Downtown HQ',
    status: 'active',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-01-11',
  },
  {
    id: 'usr-10',
    name: 'Chloe Bennett',
    email: 'c.bennett@hospixo.com',
    role: 'Sommelier',
    branch: 'Westside Cafe',
    status: 'active',
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-01-14',
  },
  {
    id: 'usr-11',
    name: 'Liam Chen',
    email: 'l.chen@hospixo.com',
    role: 'Captain',
    branch: 'Airport Branch',
    status: 'active',
    avatar:
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-01-20',
  },
  {
    id: 'usr-12',
    name: 'Amara Okafor',
    email: 'a.okafor@hospixo.com',
    role: 'Waiter',
    branch: 'Eastgate Outlet',
    status: 'invited',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-02-01',
  },
  {
    id: 'usr-13',
    name: 'Noah Williams',
    email: 'n.williams@hospixo.com',
    role: 'Barista',
    branch: 'Downtown HQ',
    status: 'active',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-02-04',
  },
  {
    id: 'usr-14',
    name: 'Priya Sharma',
    email: 'p.sharma@hospixo.com',
    role: 'Accountant',
    branch: 'Downtown HQ',
    status: 'active',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-02-08',
  },
  {
    id: 'usr-15',
    name: 'Daniel Brooks',
    email: 'd.brooks@hospixo.com',
    role: 'Operations Lead',
    branch: 'Westside Cafe',
    status: 'invited',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-02-15',
  },
  {
    id: 'usr-16',
    name: 'Isabella Rossi',
    email: 'i.rossi@hospixo.com',
    role: 'Shift Supervisor',
    branch: 'Airport Branch',
    status: 'invited',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-02-20',
    company: 'VJITVI',
  },
  {
    id: 'usr-org-1',
    name: 'Alexander Wright',
    email: 'a.wright@hospixo.com',
    role: 'Organization Admin',
    branch: 'Global HQ',
    status: 'active',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-01-01',
    company: 'VJITVI',
  },
] as const;

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
    return {
      ...u,
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

const BRANCH_INITIAL_USERS_RAW = [
  {
    id: 'usr-branch-1',
    name: 'Marco Rossi',
    email: 'marco@email.com',
    role: 'Captain',
    branch: 'Downtown Branch',
    status: 'active',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-01-15',
    company: 'VJITVI',
    scope: 'branch',
  },
  {
    id: 'usr-branch-2',
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    role: 'Captain',
    branch: 'Downtown Branch',
    status: 'invited',
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-02-12',
    company: 'VJITVI',
    scope: 'branch',
  },
  {
    id: 'usr-branch-3',
    name: 'David Kim',
    email: 'd.kim@hospixo.com',
    role: 'POS Counter',
    branch: 'Downtown Branch',
    status: 'active',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-01-20',
    company: 'VJITVI',
    scope: 'branch',
  },
  {
    id: 'usr-branch-4',
    name: 'Elena Rostova',
    email: 'e.rostova@hospixo.com',
    role: 'Kitchen Staff',
    branch: 'Downtown Branch',
    status: 'active',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-02-01',
    company: 'VJITVI',
    scope: 'branch',
  },
  {
    id: 'usr-branch-5',
    name: 'Carlos Mendez',
    email: 'c.mendez@hospixo.com',
    role: 'Waiter',
    branch: 'Downtown Branch',
    status: 'active',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-01-28',
    company: 'VJITVI',
    scope: 'branch',
  },
  {
    id: 'usr-branch-6',
    name: 'Amina Al-Mansoor',
    email: 'a.mansoor@hospixo.com',
    role: 'Barista',
    branch: 'Downtown Branch',
    status: 'disabled',
    avatar:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-02-14',
    company: 'VJITVI',
    scope: 'branch',
  },
] as const;

const BRANCH_INITIAL_USERS: UserRoleItem[] = userRoleListSchema.parse(BRANCH_INITIAL_USERS_RAW);

// ============================================================================
// 4. Role Templates
// ============================================================================

const roleTemplateListSchema = z.array(roleTemplateItemSchema);

export const COMPANY_ROLE_TEMPLATES: RoleTemplateItem[] = roleTemplateListSchema.parse([
  {
    id: '9',
    title: 'Branch Admin',
    description: 'Branch operations and local approvals',
    icon: 'restaurant',
    roleName: 'Branch Admin',
    scope: 'branch',
  },
  {
    id: '12',
    title: 'Cashier',
    description: 'Payments, shifts, billing',
    icon: 'pos',
    roleName: 'Cashier',
    scope: 'branch',
  },
  {
    id: '14',
    title: 'Hotel Manager',
    description: 'Rooms, bookings, front desk',
    icon: 'company',
    roleName: 'Hotel Manager',
    scope: 'branch',
  },
  {
    id: '13',
    title: 'Kitchen Staff',
    description: 'Kitchen order preparation and status updates',
    icon: 'kitchen',
    roleName: 'Kitchen Staff',
    scope: 'branch',
  },
  {
    id: '15',
    title: 'Receptionist',
    description: 'Bookings, check-in/out',
    icon: 'restaurant',
    roleName: 'Receptionist',
    scope: 'branch',
  },
  {
    id: '10',
    title: 'Restaurant Manager',
    description: 'Menu, tables, order visibility',
    icon: 'restaurant',
    roleName: 'Restaurant Manager',
    scope: 'branch',
  },
  {
    id: '11',
    title: 'Waiter / Steward',
    description: 'Creates and updates assigned orders',
    icon: 'captain',
    roleName: 'Waiter / Steward',
    scope: 'branch',
  },
  {
    id: '7',
    title: 'Accountant',
    description: 'Reviews invoices, journals, GST prep',
    icon: 'company',
    roleName: 'Accountant',
    scope: 'company',
  },
  {
    id: '4',
    title: 'Company Admin',
    description: 'Manages one specific company: branches, users, settings',
    icon: 'company',
    roleName: 'Company Admin',
    scope: 'company',
  },
  {
    id: '5',
    title: 'Finance Admin',
    description: 'Invoices, journals, GST, ledgers',
    icon: 'company',
    roleName: 'Finance Admin',
    scope: 'company',
  },
  {
    id: '6',
    title: 'HR Admin',
    description: 'Employees, attendance, payroll',
    icon: 'company',
    roleName: 'HR Admin',
    scope: 'company',
  },
  {
    id: '8',
    title: 'Inventory Manager',
    description: 'Stock, suppliers, PO lifecycle',
    icon: 'company',
    roleName: 'Inventory Manager',
    scope: 'company',
  },
]);

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
    let items = mockUsersDataset;
    const search = request.params?.search;
    if (typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (user) => user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q),
      );
    }
    return items;
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
      const roleIdNum = Number(rolePermissionsMatch[1]) || 12;
      const requestedScope = String(request.params?.scope_type ?? 'branch');
      const isCompanyScope =
        requestedScope === 'company' ||
        roleIdNum === 4 ||
        roleIdNum === 5 ||
        roleIdNum === 6 ||
        roleIdNum === 7 ||
        roleIdNum === 8;

      const permissionCodes = getDefaultPermissionCodes(isCompanyScope);

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
