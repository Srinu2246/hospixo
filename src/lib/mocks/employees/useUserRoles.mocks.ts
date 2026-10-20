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

function resolveUsersMock(request: MockRequest, itemId?: string): unknown {
  if (request.method === 'GET') {
    if (itemId) {
      const found = mockUsersDataset.find((user) => user.id === itemId) ?? mockUsersDataset[0];
      const template = COMPANY_ROLE_TEMPLATES.find(
        (t) => t.roleName.toLowerCase() === found.role.toLowerCase(),
      );
      return {
        ...found,
        first_name: found.name.split(' ')[0] ?? 'User',
        last_name: found.name.split(' ').slice(1).join(' ') ?? '',
        phone: found.phone ?? '',
        phone_number: found.phone ?? '',
        username: found.email.split('@')[0] ?? 'user',
        description: template?.description ?? `Operations for ${found.role}.`,
        role_description: template?.description ?? `Operations for ${found.role}.`,
        role_id: template?.id ? Number(template.id) || template.id : 10,
        scope: found.scope ?? template?.scope ?? 'branch',
        is_active: found.status === 'active',
      };
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
    const newUser: UserRoleItem = {
      id: `usr-${Date.now()}`,
      name: joinedName,
      email,
      role: String(body.role ?? 'Staff'),
      branch: String(body.branch_name ?? body.branch ?? 'Downtown Branch'),
      status: 'active',
      phone: body.phone
        ? String(body.phone)
        : body.phone_number
          ? String(body.phone_number)
          : undefined,
      scope: 'branch',
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
      return {
        success: true,
        data: {
          role_id: roleIdNum,
          scope_type: 'branch',
          organization_id: 1,
          inherited_permission_codes: [],
          permission_codes: [
            'dashboard.view',
            'dashboard.analytics',
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
            'roles.view',
            'branches.view',
            'branches.manage',
          ],
          total_permissions: 7,
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
    return { success: true, data: [] };
  }

  const usersMatch = request.path.match(/^\/v1\/users(?:\/([^/]+))?/);
  if (usersMatch) {
    return resolveUsersMock(request, usersMatch[1]);
  }

  const match = request.path.match(
    /^\/v1\/(company\/|branch\/)?employees\/user-roles(\/([^/]+))?$/,
  );
  if (!match) return undefined;

  const scopePrefix = match[1];
  const itemId = match[3];

  const getDataset = () => {
    if (scopePrefix === 'branch/') return [...BRANCH_INITIAL_USERS];
    if (scopePrefix === 'company/') return [...COMPANY_INITIAL_USERS];
    return [...INITIAL_USERS];
  };

  if (request.method === 'GET') {
    if (itemId) {
      const found = getDataset().find((u) => u.id === itemId);
      const user = found ?? getDataset()[0];
      return {
        ...user,
        first_name: user?.name.split(' ')[0] ?? 'User',
        last_name: user?.name.split(' ').slice(1).join(' ') ?? '',
        phone: user?.phone ?? '',
        phone_number: user?.phone ?? '',
        username: user?.email.split('@')[0] ?? 'user',
        description: `Operations for ${user?.role}.`,
        role_description: `Operations for ${user?.role}.`,
        role_id: 12,
        is_active: user?.status === 'active',
      };
    }

    let items = getDataset();
    const search = request.params?.search;
    if (typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      );
    }
    const role = request.params?.role;
    if (typeof role === 'string' && role) {
      items = items.filter((u) => u.role === role);
    }
    const branch = request.params?.branch;
    if (typeof branch === 'string' && branch) {
      items = items.filter((u) => u.branch === branch);
    }
    const status = request.params?.status;
    if (typeof status === 'string' && status) {
      items = items.filter((u) => u.status === status);
    }

    return items;
  }

  if (request.method === 'POST') {
    const body = (request.body && typeof request.body === 'object' ? request.body : {}) as Record<
      string,
      unknown
    >;
    const newUser: UserRoleItem = {
      id: `usr-${Date.now()}`,
      name:
        (body.name as string) ||
        `${body.firstName || ''} ${body.lastName || ''}`.trim() ||
        'New User',
      email: (body.email as string) || 'user@hospixo.com',
      role: (body.role as string) || 'Staff',
      branch: (body.branch as string) || 'Downtown Branch',
      status: (body.status as UserRoleItem['status']) || 'invited',
      company: (body.company as string) || 'VJITVI',
      createdAt: new Date().toISOString().split('T')[0],
    };
    return newUser;
  }

  if (request.method === 'PUT' && itemId) {
    const body = (request.body && typeof request.body === 'object' ? request.body : {}) as Record<
      string,
      unknown
    >;
    const firstName = (body.first_name as string) || '';
    const lastName = (body.last_name as string) || '';
    const name = `${firstName} ${lastName}`.trim() || (body.name as string) || 'Updated User';
    return {
      id: itemId,
      name,
      first_name: firstName,
      last_name: lastName,
      email: (body.email as string) || 'user@hospixo.com',
      phone: (body.phone as string) || (body.phone_number as string) || '',
      phone_number: (body.phone as string) || (body.phone_number as string) || '',
      username: (body.username as string) || 'user',
      role: (body.role as string) || 'Staff',
      role_description: (body.description as string) || '',
      description: (body.description as string) || '',
      branch: (body.branch as string) || 'Downtown Branch',
      status: (body.status as string) || 'active',
      createdAt: '2024-01-01',
    };
  }

  if (request.method === 'PATCH' && itemId) {
    const body = (request.body && typeof request.body === 'object' ? request.body : {}) as Record<
      string,
      unknown
    >;
    return {
      id: itemId,
      status: body.status || 'active',
    };
  }

  if (request.method === 'DELETE' && itemId) {
    return { success: true, message: `User ${itemId} deleted successfully.` };
  }

  return undefined;
}
