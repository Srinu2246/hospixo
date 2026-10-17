import { z } from 'zod';

import {
  permissionCategorySchema,
  roleTemplateItemSchema,
  userRoleListSchema,
  type UserRoleItem,
  type RoleTemplateItem,
  type PermissionCategory,
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
] as const;

export const INITIAL_USERS: UserRoleItem[] = userRoleListSchema.parse(INITIAL_USERS_RAW);

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
    id: 'tpl-restaurant-mgr',
    title: 'Restaurant Manager',
    description: 'Daily store operations and staff',
    icon: 'restaurant',
    roleName: 'Restaurant Manager',
    scope: 'company',
  },
  {
    id: 'tpl-pos-counter',
    title: 'POS Counter',
    description: 'Financial approvals and reports',
    icon: 'pos',
    roleName: 'POS Counter',
    scope: 'company',
  },
  {
    id: 'tpl-captain',
    title: 'Captain',
    description: 'Read-only access to all system data',
    icon: 'captain',
    roleName: 'Captain',
    scope: 'company',
  },
  {
    id: 'tpl-kitchen-staff',
    title: 'Kitchen Staff',
    description: 'Kitchen display and order prep',
    icon: 'kitchen',
    roleName: 'Kitchen Staff',
    scope: 'company',
  },
]);

// ============================================================================
// 5. Permission Categories
// ============================================================================

const permissionCategoryListSchema = z.array(permissionCategorySchema);

const DEFAULT_STAFF_PROFILE_PERMISSIONS: PermissionCategory[] = permissionCategoryListSchema.parse([
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
]);

// ============================================================================
// 6. Mock Request Resolver (for serverClient / handler.ts)
// ============================================================================

type MockRequest = {
  method: HttpMethod;
  path: string;
  params?: QueryParams;
  body?: unknown;
};

function resolveUsersMock(request: MockRequest, itemId?: string): unknown {
  const dataset = [...INITIAL_USERS];

  if (request.method === 'GET') {
    if (itemId) {
      return dataset.find((user) => user.id === itemId) ?? dataset[0];
    }
    let items = dataset;
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
    return {
      id: `usr-${Date.now()}`,
      name: `${body.first_name ?? body.firstName ?? ''} ${body.last_name ?? body.lastName ?? ''}`.trim(),
      email: body.email,
      role: body.role ?? 'Staff',
      branch: body.branch_name ?? body.branch ?? 'Downtown Branch',
      status: 'active',
    };
  }

  if (request.method === 'PUT' && itemId) {
    return { id: itemId, ...(request.body as object) };
  }

  if (request.method === 'PATCH') {
    return {
      id: itemId ?? 'usr-1',
      status: (request.body as { status?: string })?.status ?? 'active',
    };
  }

  if (request.method === 'DELETE') {
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

  if (request.path.startsWith('/v1/roles') && request.method === 'GET') {
    return INITIAL_USERS.map((user, index) => ({ id: index + 1, name: user.role }));
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
      return found ?? getDataset()[0];
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
    const body = (
      request.body && typeof request.body === 'object' ? request.body : {}
    ) as Partial<UserRoleItem>;
    return {
      id: itemId,
      name: body.name || 'Updated User',
      email: body.email || 'user@hospixo.com',
      role: body.role || 'Staff',
      branch: body.branch || 'Downtown Branch',
      status: body.status || 'active',
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
