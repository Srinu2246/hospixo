import { z } from 'zod';
import {
  phoneSchema,
  passwordSchema,
  personNameSchema,
  emailSchema,
  usernameSchema,
} from '@/lib/schemas/commonFieldsSchema';
import type { JsonObject, JsonValue } from '@/types/json';

export { phoneSchema, passwordSchema, personNameSchema, emailSchema, usernameSchema };

// ============================================================================
// 1. Primitive Domain Types & Enums
// ============================================================================

export const UserRoleScope = {
  Organization: 'organization',
  Company: 'company',
  Branch: 'branch',
} as const;

export type UserRoleScope = (typeof UserRoleScope)[keyof typeof UserRoleScope];

export const scopeTypeSchema = z.enum([
  UserRoleScope.Organization,
  UserRoleScope.Company,
  UserRoleScope.Branch,
]);
export type ScopeType = z.infer<typeof scopeTypeSchema>;

export function resolveScope(raw?: string | null): ScopeType {
  if (raw === UserRoleScope.Company) return UserRoleScope.Company;
  if (raw === UserRoleScope.Branch || raw === 'branch-manager') return UserRoleScope.Branch;
  return UserRoleScope.Organization;
}

export function resolveScopeFromPathname(
  pathname?: string | null,
  explicitScope?: ScopeType | null,
): ScopeType {
  if (
    explicitScope === UserRoleScope.Company ||
    explicitScope === UserRoleScope.Branch ||
    explicitScope === UserRoleScope.Organization
  ) {
    return explicitScope;
  }
  const path = pathname ?? '';
  if (path.includes('/company')) return UserRoleScope.Company;
  if (path.includes('/branch')) return UserRoleScope.Branch;
  return UserRoleScope.Organization;
}

export function getUsersAndRolesBaseRoute(
  pathname?: string | null,
  scope?: ScopeType | null,
): string {
  const path = pathname ?? '';
  const stripped = path.replace(
    /\/(edit|profile|custom-template|create|permissions|review|success|template)$/,
    '',
  );
  if (stripped) return stripped;
  const resolved = resolveScopeFromPathname(path, scope);
  if (resolved === UserRoleScope.Company) return '/company/employees/users-and-roles';
  if (resolved === UserRoleScope.Branch) return '/branch-manager/employees/users-and-roles';
  return '/organization/employees/users-and-roles';
}

export const userStatusSchema = z.enum(['active', 'invited', 'disabled', 'inactive']);
export type UserStatus = z.infer<typeof userStatusSchema>;

// ============================================================================
// 2. User Role Item & Stats Schemas
// ============================================================================

export const userRoleItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  username: z.string().optional(),
  role: z.string(),
  branch: z.string(),
  status: userStatusSchema,
  avatar: z.string().optional(),
  createdAt: z.string().optional(),
  company: z.string().optional(),
  companyId: z.number().optional(),
  branchId: z.number().optional(),
  scope: scopeTypeSchema.optional(),
  phone: z.string().optional(),
  /** Present when the list API only returns role ids/codes; used to resolve labels from the roles catalog. */
  roleId: z.union([z.string(), z.number()]).optional(),
  roleCode: z.string().optional(),
});

export type UserRoleItem = z.infer<typeof userRoleItemSchema>;

export const userRoleListSchema = z.array(userRoleItemSchema);

export const userRoleStatsDataSchema = z.object({
  totalUsers: z.number(),
  activeNow: z.number(),
  pendingInvites: z.number(),
  userRoles: z.number(),
});

export type UserRoleStatsData = z.infer<typeof userRoleStatsDataSchema>;

// ============================================================================
// 3. Permissions & Role Templates (API / view models)
// ============================================================================

export const permissionItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  enabled: z.boolean(),
  code: z.string().optional(),
});

export type PermissionItem = z.infer<typeof permissionItemSchema>;

export const permissionCategorySchema = z.object({
  id: z.string(),
  title: z.string(),
  permissions: z.array(permissionItemSchema),
});

export type PermissionCategory = z.infer<typeof permissionCategorySchema>;

export const rolePermissionsPayloadSchema = z.object({
  role_id: z.union([z.number(), z.string()]).optional(),
  inherited_permission_codes: z.array(z.string()).default([]),
  permission_codes: z.array(z.string()).default([]),
});

export type RolePermissionsPayload = z.infer<typeof rolePermissionsPayloadSchema>;

function makePermissionCategory(
  id: string,
  title: string,
  items: ReadonlyArray<[code: string, name: string, description: string]>,
): PermissionCategory {
  return {
    id,
    title,
    permissions: items.map(([code, name, description]) => ({
      id: code,
      code,
      name,
      description,
      enabled: false,
    })),
  };
}

export const DEFAULT_STAFF_PROFILE_PERMISSIONS: PermissionCategory[] = [
  makePermissionCategory('dashboard', 'Dashboard', [
    ['dashboard.view', 'View Dashboard', 'Access to the main overview and KPI tiles'],
    ['dashboard.analytics', 'View Analytics', 'Detailed charts and data trends analysis'],
  ]),
  makePermissionCategory('user_management', 'User Management', [
    ['users.view', 'View Users', 'Access and view the team member directory'],
    ['users.create', 'Create Users', 'Invite and add new members to the system'],
    ['users.edit', 'Edit Users', 'Modify existing user details and status'],
    ['users.delete', 'Delete Users', 'Remove users permanently from the organization'],
    ['roles.view', 'View Roles', 'Access and view system roles and permissions'],
  ]),
  makePermissionCategory('company_management', 'Company Management', [
    ['company.view', 'View Company', 'Access company profile, branches, and operational settings'],
    [
      'company.manage',
      'Manage Company',
      'Update company details, policies, and business configurations',
    ],
  ]),
  makePermissionCategory('branch_management', 'Branch Management', [
    ['branches.view', 'View Branches', 'See details of all connected branch locations'],
    ['branches.manage', 'Manage Branches', 'Edit branch info, opening hours, and zones'],
  ]),
  makePermissionCategory('inventory', 'Inventory', [
    ['inventory.view', 'View Inventory', 'Monitor stock levels and tracking'],
    ['inventory.items', 'Manage Items', 'Add or edit items in the product catalog'],
  ]),
  makePermissionCategory('reports', 'Reports', [
    ['reports.view', 'View Reports', 'Financial and operational summary reports'],
    ['reports.export', 'Export Reports', 'Download CSV and PDF reports'],
  ]),
];

export interface UseUserRolesOptions {
  pageSize?: number;
  scope?: ScopeType;
  companyName?: string;
  initialUserList?: UserRoleListResponse;
  companyId?: number | string | null;
  branchId?: number | string | null;
  companies?: readonly { id: number | string; name: string }[];
}

export const roleTemplateItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.enum(['company', 'restaurant', 'pos', 'captain', 'kitchen']),
  roleName: z.string(),
  defaultPermissions: z.record(z.string(), z.boolean()).optional(),
  company: z.string().optional(),
  branch: z.string().optional(),
  scope: scopeTypeSchema.optional(),
});

export type RoleTemplateItem = z.infer<typeof roleTemplateItemSchema>;

// ============================================================================
// 4. Live Backend Contracts, Request Schemas & API Mappers
// ============================================================================

/** POST /v1/users request body (live backend contract). */
export const createUserRequestSchema = z.object({
  /** Required only for branch-scoped roles; must be omitted for company-scoped roles. */
  branch_id: z.number().int().positive().optional(),
  /** Required for company- and branch-scoped roles; omit for organization-scoped roles. */
  company_id: z.number().int().positive().optional(),
  email: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  organization_id: z.number().int().positive(),
  password: z.string().min(6),
  phone: z.string().min(1),
  role_code: z.string().min(1),
  username: z.string().min(1),
  status: z.string().optional(),
  is_active: z.boolean().optional(),
});

export type CreateUserRequest = z.infer<typeof createUserRequestSchema>;

export type RoleScope = 'organization' | 'company' | 'branch';

export type RoleCatalogItem = {
  id: string | number;
  name: string;
  code?: string;
  scope?: RoleScope;
  description?: string;
};

export const scopedRolePermissionsParamsSchema = z.object({
  scope_type: scopeTypeSchema,
  company_id: z.union([z.number(), z.string()]).optional(),
  branch_id: z.union([z.number(), z.string()]).optional(),
  page: z.number().int().min(1).optional(),
  page_size: z.number().int().min(1).max(100).optional(),
});

export type ScopedRolePermissionsParams = z.infer<typeof scopedRolePermissionsParamsSchema>;

export type CreateUserRequestContext = {
  organizationId: number;
  companyId?: number;
  branchId?: number;
  roleCatalog?: readonly RoleCatalogItem[];
  roleCode?: string;
};

// ============================================================================
// User list filters (GET /api/v1/users)
// ============================================================================

export const USER_LIST_SORT_FIELDS = [
  'created_at',
  'name',
  'email',
  'status',
  'role',
  'company',
  'branch',
  'organization',
  'id',
] as const;

export const USER_LIST_SORT_ORDERS = ['desc', 'asc'] as const;

export const userListSortBySchema = z.enum(USER_LIST_SORT_FIELDS);
export type UserListSortBy = z.infer<typeof userListSortBySchema>;

export const userListSortOrderSchema = z.enum(USER_LIST_SORT_ORDERS);
export type UserListSortOrder = z.infer<typeof userListSortOrderSchema>;

export const userListStatusSchema = z.enum(['active', 'invited', 'inactive']);
export type UserListStatus = z.infer<typeof userListStatusSchema>;

export const USER_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'invited', label: 'Invited' },
  { value: 'inactive', label: 'Inactive' },
] as const;

export const USER_SORT_FIELD_LABELS: Record<UserListSortBy, string> = {
  created_at: 'Date Created',
  name: 'Name',
  email: 'Email',
  role: 'Role',
  status: 'Status',
  company: 'Company',
  branch: 'Branch',
  organization: 'Organization',
  id: 'User ID',
};

/** Summary card totals returned by GET /api/v1/users?include_summary=true */
export const userListSummarySchema = z.object({
  total_users: z.number().int().nonnegative().optional(),
  active_now: z.number().int().nonnegative().optional(),
  active_users: z.number().int().nonnegative().optional(),
  pending_invites: z.number().int().nonnegative().optional(),
  user_roles: z.number().int().nonnegative().optional(),
  total_roles: z.number().int().nonnegative().optional(),
});

export type UserListSummary = z.infer<typeof userListSummarySchema>;

/** Validated query parameters for GET /api/v1/users */
export const userListFilterParamsSchema = z.object({
  search: z.string().trim().optional(),
  status: z.string().trim().optional(),
  role: z.string().trim().optional(),
  company_id: z.number().int().positive().optional(),
  branch_id: z.number().int().positive().optional(),
  organization_id: z.number().int().positive().optional(),
  page: z.number().int().min(1).default(1),
  page_size: z.number().int().min(1).max(100).default(20),
  sort_by: userListSortBySchema.default('created_at'),
  sort_order: userListSortOrderSchema.default('desc'),
  include_summary: z.boolean().default(false),
});

export type UserListFilterParams = z.infer<typeof userListFilterParamsSchema>;

/** Filter state shape used in components and hooks */
export interface UserListFilterState {
  search: string;
  status: string;
  role: string;
  companyId: number | null;
  branchId: number | null;
  organizationId: number | null;
  page: number;
  pageSize: number;
  sortBy: UserListSortBy;
  sortOrder: UserListSortOrder;
  includeSummary: boolean;
}

export const DEFAULT_USER_LIST_FILTERS: UserListFilterState = {
  search: '',
  status: '',
  role: '',
  companyId: null,
  branchId: null,
  organizationId: null,
  page: 1,
  pageSize: 20,
  sortBy: 'created_at',
  sortOrder: 'desc',
  includeSummary: false,
};

/** Serializes filter state into URL query params for GET /api/v1/users */
export function serializeUserListFilterParams(
  filters: Partial<UserListFilterState>,
  extraParams?: Record<string, string | number | boolean | undefined>,
): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {};

  const search = filters.search?.trim();
  if (search) params.search = search;

  const status = filters.status?.trim();
  if (status && status !== 'all' && status !== 'All Statuses') params.status = status;

  const role = filters.role?.trim();
  if (role && role !== 'all' && role !== 'All Roles') params.role = role;

  if (filters.companyId != null && Number.isFinite(filters.companyId)) {
    params.company_id = Number(filters.companyId);
  }

  if (filters.branchId != null && Number.isFinite(filters.branchId)) {
    params.branch_id = Number(filters.branchId);
  }

  if (filters.organizationId != null && Number.isFinite(filters.organizationId)) {
    params.organization_id = Number(filters.organizationId);
  }

  params.page = Math.max(1, Number(filters.page) || 1);
  params.page_size = Math.min(100, Math.max(1, Number(filters.pageSize) || 20));

  if (filters.sortBy) params.sort_by = filters.sortBy;
  if (filters.sortOrder) params.sort_order = filters.sortOrder;
  if (filters.includeSummary) params.include_summary = true;

  if (extraParams) {
    for (const [key, value] of Object.entries(extraParams)) {
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value;
      }
    }
  }

  return params;
}

export type ParsedUserList = {
  items: UserRoleItem[];
  total: number;
  summary?: UserListSummary;
};

export type UserRoleListResponse = ParsedUserList;

export function parseUserList(payload: JsonValue): ParsedUserList {
  const rows = unwrapUsers(payload);
  const items = rows.flatMap((row) => {
    const coerced = coerceUserItem(mapUserRow(row));
    return coerced ? [coerced] : [];
  });
  const summary = readSummary(payload);
  return {
    items,
    total: readTotal(payload, items.length),
    ...(summary ? { summary } : {}),
  };
}

function readSummary(payload: JsonValue): UserListSummary | undefined {
  if (!isRecord(payload)) return undefined;
  const rawSummary =
    payload.summary ??
    payload.counts ??
    payload.totals ??
    (isRecord(payload.data)
      ? ((payload.data as JsonObject).summary ?? (payload.data as JsonObject).counts)
      : undefined);

  if (isRecord(rawSummary)) {
    const parsed = userListSummarySchema.safeParse(rawSummary);
    if (parsed.success) return parsed.data;
  }
  return undefined;
}

/** Fill missing role labels using GET /v1/roles catalog rows. */
export function enrichUserListRoles(
  users: readonly UserRoleItem[],
  catalog: readonly RoleCatalogItem[],
): UserRoleItem[] {
  if (!Array.isArray(users)) return [];
  if (!Array.isArray(catalog) || catalog.length === 0) return [...users];

  return users.map((user) => {
    const fromCatalog = resolveRoleLabelFromCatalog(
      user.roleId,
      user.roleCode ?? (looksLikeRoleCode(user.role) ? user.role : undefined),
      catalog,
    );

    const matched = catalog.find((r) => {
      if (user.roleId != null && user.roleId !== '') return String(r.id) === String(user.roleId);
      if (user.roleCode) return r.code?.toLowerCase() === user.roleCode.toLowerCase();
      if (user.role && user.role !== '—') return r.name.toLowerCase() === user.role.toLowerCase();
      return false;
    });

    const nextRole =
      (!user.role || user.role === '—' || looksLikeRoleCode(user.role)) && fromCatalog
        ? fromCatalog
        : user.role;
    const nextScope = user.scope ?? matched?.scope;
    const nextRoleId = user.roleId ?? matched?.id;
    const nextRoleCode = user.roleCode ?? matched?.code;

    return {
      ...user,
      role: nextRole,
      ...(nextScope ? { scope: nextScope } : {}),
      ...(nextRoleId != null ? { roleId: nextRoleId } : {}),
      ...(nextRoleCode ? { roleCode: nextRoleCode } : {}),
    };
  });
}

function looksLikeRoleCode(value: string | undefined): boolean {
  if (!value || value === '—') return false;
  return /^[a-z0-9]+(?:[_-][a-z0-9]+)+$/i.test(value.trim());
}

export function resolveRoleLabelFromCatalog(
  roleId: string | number | undefined,
  roleCode: string | undefined,
  catalog: readonly RoleCatalogItem[],
): string | undefined {
  if (roleId != null && roleId !== '') {
    const match = catalog.find((role) => String(role.id) === String(roleId));
    if (match?.name) return match.name;
  }
  if (roleCode?.trim()) {
    const normalized = roleCode.trim().toLowerCase();
    const match = catalog.find((role) => {
      const name = role.name.trim().toLowerCase();
      const code = role.code?.trim().toLowerCase();
      return (
        name === normalized || code === normalized || String(role.id).toLowerCase() === normalized
      );
    });
    if (match?.name) return match.name;
    return humanizeRoleCode(roleCode);
  }
  return undefined;
}

export function parseUserRecord(payload: JsonValue): UserRoleItem | null {
  const unwrapped = unwrapEnvelope(payload);
  if (!isRecord(unwrapped)) return null;
  return coerceUserItem(mapUserRow(unwrapped));
}

export function readUserId(payload: JsonValue): string | null {
  const user = parseUserRecord(payload);
  if (user) return user.id;
  const unwrapped = unwrapEnvelope(payload);
  if (isRecord(unwrapped)) {
    const id = unwrapped.id ?? unwrapped.user_id ?? unwrapped.userId;
    if (typeof id === 'string' || typeof id === 'number') return String(id);
  }
  if (!isRecord(payload)) return null;
  const id = payload.id ?? payload.user_id ?? payload.userId;
  return typeof id === 'string' || typeof id === 'number' ? String(id) : null;
}

export function parseRoleCatalog(payload: JsonValue): RoleCatalogItem[] {
  return unwrapRoles(payload).flatMap((row) => {
    const code = text(row.code) ?? text(row.role_code);
    const id = row.id ?? row.role_id ?? row.roleId ?? code;
    const name = readRoleLabel(row) ?? (code ? humanizeRoleCode(code) : undefined);
    if (id === undefined || !name) return [];
    const scope = readRoleScope(row.scope) ?? readRoleScope(row.scope_type);
    const description =
      text(row.description) ??
      text(row.role_description) ??
      text(row.roleDescription) ??
      text(row.desc);
    return [
      {
        id: typeof id === 'number' || typeof id === 'string' ? id : String(id),
        name,
        ...(code ? { code } : {}),
        ...(scope ? { scope } : {}),
        ...(description ? { description } : {}),
      },
    ];
  });
}

export function parseRoleTemplates(payload: JsonValue): RoleTemplateItem[] {
  return unwrapRoles(payload).flatMap((row) => {
    const mapped = mapRoleTemplateRow(row);
    const parsed = roleTemplateItemSchema.safeParse(mapped);
    if (parsed.success) return [parsed.data];
    if (!mapped.id || !mapped.roleName) return [];
    return [
      {
        id: String(mapped.id),
        title: mapped.title || mapped.roleName,
        description: mapped.description || '',
        icon: mapped.icon ?? 'restaurant',
        roleName: mapped.roleName,
      },
    ];
  });
}

export function parseGroupedPermissions(payload: JsonValue): PermissionCategory[] {
  const unwrapped = unwrapEnvelope(payload);
  const groups = extractPermissionGroups(unwrapped);

  if (
    groups.length > 0 &&
    groups.every(
      (g) => isRecord(g) && !('permissions' in g) && !('items' in g) && !('children' in g),
    )
  ) {
    const map = new Map<string, JsonValue[]>();
    groups.forEach((item) => {
      if (!isRecord(item)) return;
      const moduleName =
        text(item.module) ?? text(item.resource) ?? text(item.code)?.split('.')[0] ?? 'Other';
      const existing = map.get(moduleName) ?? [];
      existing.push(item);
      map.set(moduleName, existing);
    });
    const synthesizedGroups = Array.from(map.entries()).map(([moduleName, items]) => ({
      title: moduleName,
      permissions: items,
    }));
    const categories = synthesizedGroups.flatMap((group, groupIndex) => {
      const mapped = mapPermissionGroup(group, groupIndex);
      const parsed = permissionCategorySchema.safeParse(mapped);
      return parsed.success ? [parsed.data] : [];
    });
    return ensureUniqueCategoryIds(categories);
  }

  const categories = groups.flatMap((group, groupIndex) => {
    if (!isRecord(group)) return [];
    const mapped = mapPermissionGroup(group, groupIndex);
    const parsed = permissionCategorySchema.safeParse(mapped);
    return parsed.success ? [parsed.data] : [];
  });
  return ensureUniqueCategoryIds(categories);
}

const RESOURCE_TITLE_OVERRIDES: Record<string, string> = {
  dashboard: 'Dashboard',
  users: 'User Management',
  user: 'User Management',
  user_management: 'User Management',
  company: 'Company Management',
  company_management: 'Company Management',
  branches: 'Branch Management',
  branch: 'Branch Management',
  branch_management: 'Branch Management',
  inventory: 'Inventory',
  inventory_management: 'Inventory',
  reports: 'Reports',
  report: 'Reports',
};

const PERMISSION_LABEL_OVERRIDES: Record<string, string> = {
  'dashboard.view': 'View Dashboard',
  'dashboard.analytics': 'View Analytics',
  'users.view': 'View Users',
  'users.create': 'Create Users',
  'users.edit': 'Edit Users',
  'users.delete': 'Delete Users',
  'roles.view': 'View Roles',
  'company.view': 'View Company',
  'company.manage': 'Manage Company',
  'branches.view': 'View Branches',
  'branches.manage': 'Manage Branches',
  'inventory.view': 'View Inventory',
  'inventory.items': 'Manage Items',
  'reports.view': 'View Reports',
  'reports.export': 'Export Reports',
};

const PERMISSION_DESCRIPTION_OVERRIDES: Record<string, string> = {
  'dashboard.view': 'Access to the main overview and KPI tiles',
  'dashboard.analytics': 'Detailed charts and data trends analysis',
  'users.view': 'Access and view the team member directory',
  'users.create': 'Invite and add new members to the system',
  'users.edit': 'Modify existing user details and status',
  'users.delete': 'Remove users permanently from the organization',
  'roles.view': 'Access and view system roles and permissions',
  'company.view': 'Access company profile, branches, and operational settings',
  'company.manage': 'Update company details, policies, and business configurations',
  'branches.view': 'See details of all connected branch locations',
  'branches.manage': 'Edit branch info, opening hours, and zones',
  'inventory.view': 'Monitor stock levels and tracking',
  'inventory.items': 'Add or edit items in the product catalog',
  'reports.view': 'Financial and operational summary reports',
  'reports.export': 'Download CSV and PDF reports',
};

/** Maps GET /v1/roles/{roleId}/permissions into display categories (no grouped catalog required). */
export function parseRolePermissionsToCategories(payload: JsonValue): PermissionCategory[] {
  if (payload == null) return [];

  const unwrapped = unwrapEnvelope(payload);
  if (unwrapped == null) return [];

  const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

  const str = (v: unknown): string | undefined =>
    typeof v === 'string' && v.trim() ? v.trim() : undefined;

  const extractCode = (item: unknown): string | undefined => {
    if (typeof item === 'string' && item.trim()) return item.trim();
    if (!isObjectRecord(item)) return undefined;
    const directCode =
      str(item.code) ??
      str(item.permission_code) ??
      str(item.permissionCode) ??
      str(item.slug) ??
      str(item.key);
    if (directCode) return directCode;
    if (isObjectRecord(item.permission)) {
      const nested = str(item.permission.code) ?? str(item.permission.slug);
      if (nested) return nested;
    }
    return undefined;
  };

  const extractItem = (item: unknown): PermissionItem | undefined => {
    const code = extractCode(item);
    if (!code) return undefined;
    const itemRecord = isObjectRecord(item) ? item : null;
    const nestedRecord =
      itemRecord && isObjectRecord(itemRecord.permission) ? itemRecord.permission : null;
    const name =
      str(itemRecord?.name) ??
      str(nestedRecord?.name) ??
      str(itemRecord?.label) ??
      PERMISSION_LABEL_OVERRIDES[code.toLowerCase()] ??
      toTitleCase(code.replace(/[._]/g, ' '));
    const description =
      str(itemRecord?.description) ??
      str(nestedRecord?.description) ??
      PERMISSION_DESCRIPTION_OVERRIDES[code.toLowerCase()] ??
      '';

    const enabled =
      itemRecord?.enabled !== undefined
        ? Boolean(itemRecord.enabled)
        : itemRecord?.is_granted !== undefined
          ? Boolean(itemRecord.is_granted)
          : itemRecord?.isGranted !== undefined
            ? Boolean(itemRecord.isGranted)
            : itemRecord?.granted !== undefined
              ? Boolean(itemRecord.granted)
              : itemRecord?.is_active !== undefined
                ? Boolean(itemRecord.is_active)
                : itemRecord?.isActive !== undefined
                  ? Boolean(itemRecord.isActive)
                  : true;

    return {
      id: code,
      code,
      name,
      description,
      enabled,
    };
  };

  // 1. Check if the payload is already grouped categories: [{ title: '...', permissions: [...] }]
  if (Array.isArray(unwrapped)) {
    if (
      unwrapped.length > 0 &&
      isObjectRecord(unwrapped[0]) &&
      ('permissions' in unwrapped[0] || 'items' in unwrapped[0])
    ) {
      const grouped = parseGroupedPermissions(unwrapped as JsonValue);
      return grouped
        .map((cat) => ({
          ...cat,
          permissions: cat.permissions.filter((p) => p.enabled),
        }))
        .filter((cat) => cat.permissions.length > 0);
    }
  } else if (isObjectRecord(unwrapped)) {
    const groupKeys = ['groups', 'categories'] as const;
    for (const key of groupKeys) {
      const val = unwrapped[key];
      if (
        Array.isArray(val) &&
        val.length > 0 &&
        isObjectRecord(val[0]) &&
        ('permissions' in val[0] || 'items' in val[0])
      ) {
        const grouped = parseGroupedPermissions(val as JsonValue);
        return grouped
          .map((cat) => ({
            ...cat,
            permissions: cat.permissions.filter((p) => p.enabled),
          }))
          .filter((cat) => cat.permissions.length > 0);
      }
    }
  }

  // 2. Identify role-specific permission codes or items
  const rawList: unknown[] = [];

  if (Array.isArray(unwrapped)) {
    rawList.push(...unwrapped);
  } else if (isObjectRecord(unwrapped)) {
    const specificKeys = [
      'permission_codes',
      'permissionCodes',
      'inherited_permission_codes',
      'inheritedPermissionCodes',
      'effective_permission_codes',
      'effectivePermissionCodes',
      'role_permissions',
      'rolePermissions',
      'assigned_permissions',
      'assignedPermissions',
    ] as const;

    let foundSpecific = false;
    for (const key of specificKeys) {
      const val = unwrapped[key];
      if (Array.isArray(val) && val.length > 0) {
        rawList.push(...val);
        foundSpecific = true;
      }
    }

    if (!foundSpecific) {
      for (const key of ['permissions', 'codes', 'items', 'data'] as const) {
        const val = unwrapped[key];
        if (Array.isArray(val) && val.length > 0) {
          rawList.push(...val);
          break;
        }
      }
    }
  }

  if (rawList.length > 0) {
    const byModule = new Map<string, PermissionCategory['permissions']>();
    const seenCodes = new Set<string>();

    rawList.forEach((entry) => {
      if (isObjectRecord(entry) && Array.isArray(entry.permissions)) {
        return;
      }
      const item = extractItem(entry);
      // Only include permissions that are enabled/granted for this role
      if (!item || !item.code || !item.enabled || seenCodes.has(item.code)) return;
      seenCodes.add(item.code);

      const moduleCandidate =
        (isObjectRecord(entry) ? (str(entry.module) ?? str(entry.resource)) : undefined) ??
        (item.code.includes('.') ? item.code.split('.')[0] : 'permissions');
      const moduleKey = moduleCandidate.toLowerCase();
      const list = byModule.get(moduleKey) ?? [];
      list.push(item);
      byModule.set(moduleKey, list);
    });

    if (byModule.size > 0) {
      return Array.from(byModule.entries()).map(([moduleKey, permissions], index) => ({
        id: `${moduleKey}-${index}`,
        title: RESOURCE_TITLE_OVERRIDES[moduleKey] ?? toTitleCase(moduleKey.replace(/_/g, ' ')),
        permissions,
      }));
    }
  }

  const grouped = parseGroupedPermissions(unwrapped);
  if (grouped.length === 0) return [];

  return grouped
    .map((category) => ({
      ...category,
      permissions: category.permissions.filter((permission) => permission.enabled),
    }))
    .filter((category) => category.permissions.length > 0);
}

function toTitleCase(value: string): string {
  return value
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function resolvePermissionCategoryTitle(raw: JsonObject, groupIndex: number): string {
  const explicit = text(raw.title) ?? text(raw.name) ?? text(raw.label);
  if (
    explicit &&
    explicit.toLowerCase() !== 'permissions' &&
    explicit.toLowerCase() !== 'permission'
  ) {
    return explicit;
  }

  const resource = text(raw.resource);
  if (resource) {
    const normalized = resource.trim().toLowerCase();
    if (RESOURCE_TITLE_OVERRIDES[normalized]) {
      return RESOURCE_TITLE_OVERRIDES[normalized];
    }
    return toTitleCase(resource);
  }

  const moduleName = text(raw.module);
  if (moduleName) {
    const normalized = moduleName.trim().toLowerCase();
    if (RESOURCE_TITLE_OVERRIDES[normalized]) {
      return RESOURCE_TITLE_OVERRIDES[normalized];
    }
    return toTitleCase(moduleName);
  }

  if (explicit) return explicit;
  return `Group ${groupIndex + 1}`;
}

function resolvePermissionItemName(
  entry: JsonObject,
  categoryTitle: string,
  permissionIndex: number,
): string {
  const code =
    text(entry.code) ?? text(entry.permission_code) ?? text(entry.permissionCode) ?? text(entry.id);
  if (code) {
    const normalized = code.trim().toLowerCase();
    if (PERMISSION_LABEL_OVERRIDES[normalized]) {
      return PERMISSION_LABEL_OVERRIDES[normalized];
    }
  }

  const explicit =
    text(entry.display_name) ??
    text(entry.displayName) ??
    text(entry.name) ??
    text(entry.label) ??
    text(entry.title) ??
    text(entry.permission_name) ??
    text(entry.permissionName);

  if (
    explicit &&
    explicit.toLowerCase() !== 'permission' &&
    explicit.toLowerCase() !== 'permissions'
  ) {
    return explicit;
  }

  const action = text(entry.action);
  if (action && code) {
    const actionTitle = toTitleCase(action);
    const codeParts = code.split('.');
    const entity = codeParts.length > 1 ? toTitleCase(codeParts[0]) : categoryTitle;
    return `${actionTitle} ${entity}`;
  }

  if (action) {
    return `${toTitleCase(action)} ${categoryTitle}`;
  }

  if (code) {
    const parts = code.split(/[._-]+/);
    if (parts.length >= 2) {
      return `${toTitleCase(parts[1])} ${toTitleCase(parts[0])}`;
    }
    return toTitleCase(code);
  }

  if (explicit) return explicit;
  return `Permission ${permissionIndex + 1}`;
}

function resolvePermissionItemDescription(entry: JsonObject, name: string): string {
  const desc = text(entry.description);
  if (desc) return desc;

  const code =
    text(entry.code) ?? text(entry.permission_code) ?? text(entry.permissionCode) ?? text(entry.id);
  if (code && PERMISSION_DESCRIPTION_OVERRIDES[code.trim().toLowerCase()]) {
    return PERMISSION_DESCRIPTION_OVERRIDES[code.trim().toLowerCase()];
  }

  return `Allows user to ${name.toLowerCase()}`;
}

function mapPermissionGroup(raw: JsonObject, groupIndex: number): PermissionCategory {
  const title = resolvePermissionCategoryTitle(raw, groupIndex);
  const categoryId = readPermissionGroupId(raw, title, groupIndex);

  const permissionsRaw = raw.permissions ?? raw.items ?? raw.children ?? [];
  const permissions = Array.isArray(permissionsRaw)
    ? permissionsRaw.flatMap((entry, permissionIndex) => {
        if (typeof entry === 'string') {
          const name = resolvePermissionItemName({ code: entry }, title, permissionIndex);
          const description = resolvePermissionItemDescription({ code: entry }, name);
          return [
            {
              id: entry,
              code: entry,
              name,
              description,
              enabled: false,
            },
          ];
        }
        if (!isRecord(entry)) return [];
        const name = resolvePermissionItemName(entry, title, permissionIndex);
        const description = resolvePermissionItemDescription(entry, name);
        const code = text(entry.code) ?? text(entry.permission_code);
        const isGranted =
          entry.enabled ??
          entry.is_granted ??
          entry.isGranted ??
          entry.granted ??
          entry.is_active ??
          entry.isActive ??
          entry.active;
        return [
          {
            id: readPermissionItemId(entry, name, categoryId, permissionIndex),
            ...(code ? { code } : {}),
            name,
            description,
            enabled: isGranted !== undefined ? Boolean(isGranted) : false,
          },
        ];
      })
    : [];

  return {
    id: categoryId,
    title,
    permissions,
  };
}

function readPermissionGroupId(raw: JsonObject, title: string, groupIndex: number): string {
  for (const key of ['id', 'key', 'code', 'name', 'title', 'label', 'group_key', 'groupKey']) {
    const value = raw[key];
    if (value == null || !String(value).trim()) continue;
    const id = String(value);
    if (!isPlaceholderPermissionId(id)) return id;
  }
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  return slug ? `${slug}-${groupIndex}` : `group-${groupIndex}`;
}

function ensureUniqueCategoryIds(categories: PermissionCategory[]): PermissionCategory[] {
  const seen = new Map<string, number>();
  return categories.map((category, index) => {
    const base = category.id.trim() || `group-${index}`;
    const used = seen.get(base) ?? 0;
    seen.set(base, used + 1);
    if (used === 0) return category;
    return { ...category, id: `${base}-${used}` };
  });
}

function isPlaceholderPermissionId(id: string): boolean {
  const normalized = id.trim().toLowerCase();
  return (
    normalized === 'group' ||
    normalized === 'groups' ||
    normalized === 'permission' ||
    normalized === 'permissions' ||
    normalized === 'category' ||
    normalized === 'categories' ||
    normalized === 'item' ||
    normalized === 'items'
  );
}

function readPermissionItemId(
  entry: JsonObject,
  name: string,
  categoryId: string,
  permissionIndex: number,
): string {
  for (const key of ['id', 'key', 'code', 'name', 'permission_key', 'permissionKey']) {
    const value = entry[key];
    if (value != null && String(value).trim()) return String(value);
  }
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  return slug ? `${categoryId}-${slug}` : `${categoryId}-permission-${permissionIndex}`;
}

export function resolveRoleCode(
  roleLabel: string,
  catalog: readonly RoleCatalogItem[],
): string | undefined {
  const trimmed = roleLabel.trim();
  if (!trimmed) return undefined;
  if (looksLikeRoleCode(trimmed)) return trimmed.toLowerCase();

  const normalized = trimmed.toLowerCase();
  const match = catalog.find(
    (role) =>
      role.name.trim().toLowerCase() === normalized ||
      role.code?.trim().toLowerCase() === normalized,
  );
  if (match?.code?.trim()) return match.code.trim().toLowerCase();
  if (/^[a-z0-9\s_-]+$/i.test(trimmed)) {
    return trimmed.toLowerCase().replace(/[\s-]+/g, '_');
  }
  return undefined;
}

export function findRoleInCatalog(
  roleCode: string,
  catalog: readonly RoleCatalogItem[],
): RoleCatalogItem | undefined {
  const normalized = roleCode.trim().toLowerCase();
  return catalog.find((role) => role.code?.trim().toLowerCase() === normalized);
}

/** Branch-scoped roles require branch_id on POST /v1/users; company/org roles must omit it. */
export function roleRequiresBranchId(
  roleCode: string,
  catalog: readonly RoleCatalogItem[],
): boolean {
  const role = findRoleInCatalog(roleCode, catalog);
  if (role?.scope) return role.scope === 'branch';
  const normalized = roleCode.trim().toLowerCase();
  return (
    normalized.startsWith('branch') ||
    normalized.includes('branch_') ||
    normalized.includes('branch-') ||
    normalized === 'branch_admin' ||
    normalized === 'branch_manager'
  );
}

/** Organization-scoped roles omit company_id on POST /v1/users. */
export function roleRequiresCompanyId(
  roleCode: string,
  catalog: readonly RoleCatalogItem[],
): boolean {
  const role = findRoleInCatalog(roleCode, catalog);
  if (role?.scope) return role.scope !== 'organization';
  const normalized = roleCode.trim().toLowerCase();
  return !(
    normalized.includes('org') ||
    normalized.includes('organization') ||
    normalized.includes('tenant') ||
    normalized === 'super_admin'
  );
}

export type RoleAssignmentRequirements = {
  roleScope: RoleScope | undefined;
  showCompany: boolean;
  showBranch: boolean;
  requireCompany: boolean;
  requireBranch: boolean;
};

function resolveRoleScopeFromSelection(
  roleLabel: string,
  catalog: readonly RoleCatalogItem[],
): RoleScope | undefined {
  const trimmed = roleLabel.trim();
  if (!trimmed) return undefined;

  const byName = catalog.find((role) => role.name.trim().toLowerCase() === trimmed.toLowerCase());
  if (byName?.scope) return byName.scope;

  const roleCode = resolveRoleCode(trimmed, catalog);
  if (!roleCode) return undefined;
  return findRoleInCatalog(roleCode, catalog)?.scope;
}

/** Drives create-user company/branch fields from role catalog scope (Swagger-aligned). */
export function resolveRoleAssignmentRequirements(
  roleLabel: string,
  catalog: readonly RoleCatalogItem[],
  wizardScope?: ScopeType,
): RoleAssignmentRequirements {
  const trimmed = roleLabel.trim();
  if (!trimmed) {
    return {
      roleScope: undefined,
      showCompany: false,
      showBranch: false,
      requireCompany: false,
      requireBranch: false,
    };
  }

  const roleScope = resolveRoleScopeFromSelection(trimmed, catalog);
  const roleCode = resolveRoleCode(trimmed, catalog);
  const requireBranch = roleCode
    ? roleRequiresBranchId(roleCode, catalog)
    : wizardScope === 'branch';

  if (roleScope === 'organization') {
    return {
      roleScope,
      showCompany: false,
      showBranch: false,
      requireCompany: false,
      requireBranch: false,
    };
  }

  if (roleScope === 'company') {
    return {
      roleScope,
      showCompany: wizardScope === 'organization',
      showBranch: false,
      requireCompany: wizardScope === 'organization',
      requireBranch: false,
    };
  }

  if (roleScope === 'branch' || requireBranch) {
    return {
      roleScope: roleScope ?? 'branch',
      showCompany: wizardScope === 'organization',
      showBranch: wizardScope !== 'branch',
      requireCompany: wizardScope === 'organization',
      requireBranch: true,
    };
  }

  return {
    roleScope,
    showCompany: wizardScope === 'organization',
    showBranch: wizardScope === 'organization',
    requireCompany: wizardScope === 'organization',
    requireBranch: wizardScope === 'branch',
  };
}

// ============================================================================
// Form validations (React Hook Form / Zod)
// ============================================================================

export const createUserStepSchema = z.enum([
  'template',
  'user-form',
  'permissions',
  'review',
  'success',
]);
export type CreateUserStep = z.infer<typeof createUserStepSchema>;

export const userRoleFormSchema = z.object({
  name: personNameSchema.min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  role: z.string().min(1, 'Please select a role'),
  branch: z.string().min(1, 'Please select a branch'),
  status: userStatusSchema,
  company: z.string().optional(),
});

export type UserRoleFormValues = z.infer<typeof userRoleFormSchema>;

const createUserMultiformFieldsSchema = z.object({
  firstName: personNameSchema,
  lastName: personNameSchema,
  countryCode: z.string().optional(),
  phoneNumber: phoneSchema,
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  company: z.string(),
  branch: z.string(),
  role: z.string(),
  sendInviteImmediately: z.boolean(),
  personalMessage: z.string().max(500, 'Personal message cannot exceed 500 characters'),
});

function isMissingAssignment(value: string): boolean {
  return !value.trim() || value.trim() === '—';
}

export function buildCreateUserStepOneSchema(
  catalog: readonly RoleCatalogItem[],
  wizardScope?: ScopeType,
) {
  return createUserMultiformFieldsSchema.superRefine((data, ctx) => {
    if (isMissingAssignment(data.role)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Please select a role',
        path: ['role'],
      });
    }

    const assignment = resolveRoleAssignmentRequirements(data.role, catalog, wizardScope);

    if (assignment.requireCompany && isMissingAssignment(data.company)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Please select a company',
        path: ['company'],
      });
    }

    if (assignment.requireBranch && isMissingAssignment(data.branch)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Please select a branch',
        path: ['branch'],
      });
    }
  });
}

export type CreateUserMultiformValues = z.infer<typeof createUserMultiformFieldsSchema>;
export type CreateUserFormValues = CreateUserMultiformValues;

/** Default wizard form state (client UI only — not API mock data). */
export const DEFAULT_CREATE_USER_FORM_VALUES: CreateUserFormValues = {
  firstName: '',
  lastName: '',
  countryCode: '+91',
  phoneNumber: '',
  email: '',
  username: '',
  password: '',
  company: '',
  branch: '',
  role: '',
  sendInviteImmediately: true,
  personalMessage: 'Welcome to the team! Here is your access to Hospixo.',
};

/** Default fallback role titles when role catalog is empty or pending. */
export const DEFAULT_FALLBACK_ROLES = ['Captain', 'Cashier', 'Kitchen Staff'] as const;

const customRoleCodeSchema = z
  .string()
  .trim()
  .min(1, 'Role code is required')
  .max(64, 'Role code cannot exceed 64 characters')
  .regex(/^[a-z][a-z0-9_]*$/, 'Use lowercase letters, numbers, and underscores (e.g. floor_lead)');

export const customTemplateSchema = z.object({
  templateName: z
    .string()
    .trim()
    .min(1, 'Template name is required')
    .max(100, 'Template name cannot exceed 100 characters'),
  code: customRoleCodeSchema,
  description: z.string().trim().max(500, 'Description cannot exceed 500 characters').optional(),
  preset: z.enum(['full_read', 'standard_manager', 'view_only', 'custom']),
});

export type CustomTemplateFormValues = z.infer<typeof customTemplateSchema>;

export const staffProfileSchema = z.object({
  firstName: personNameSchema,
  lastName: personNameSchema,
  email: emailSchema,
  phoneNumber: phoneSchema,
  countryCode: z.string(),
  username: usernameSchema,
  password: passwordSchema.optional().or(z.literal('')),
  userStatus: z.boolean(),
  roleName: z
    .string()
    .trim()
    .min(1, 'Role name is required')
    .max(100, 'Role name cannot exceed 100 characters'),
  roleDescription: z
    .string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
});

export type StaffProfileFormValues = z.infer<typeof staffProfileSchema>;

export function formatPhoneNumberWithCountryCode(phoneNumber: string, countryCode = '+91'): string {
  const trimmed = phoneNumber.trim();
  if (!trimmed) return '';
  const cleanCode = countryCode.trim().startsWith('+')
    ? countryCode.trim()
    : `+${countryCode.trim()}`;
  if (trimmed.startsWith('+')) {
    return trimmed;
  }
  const digitsOnly = trimmed.replace(/\D/g, '');
  const codeDigits = cleanCode.replace(/\D/g, '');
  if (digitsOnly.startsWith(codeDigits) && digitsOnly.length > 10) {
    return `+${digitsOnly}`;
  }
  return `${cleanCode}${digitsOnly}`;
}

export function buildCreateUserRequest(
  values: CreateUserMultiformValues,
  context: CreateUserRequestContext,
): CreateUserRequest {
  const catalog = context.roleCatalog ?? [];
  const roleCandidate = values.role?.trim() || 'Branch Admin';
  const roleCode =
    context.roleCode ??
    resolveRoleCode(roleCandidate, catalog) ??
    roleCandidate.toLowerCase().replace(/[\s-]+/g, '_');

  const needsCompany = roleRequiresCompanyId(roleCode, catalog);
  const branchId = context.branchId;
  const companyId = context.companyId;
  const organizationId = context.organizationId ?? 1;

  const email = values.email?.trim().toLowerCase() || `user_${Date.now()}@hospixo.com`;
  const firstName = values.firstName?.trim() || 'New';
  const lastName = values.lastName?.trim() || 'User';
  const password =
    values.password && values.password.trim().length >= 6 ? values.password.trim() : 'Hospixo@2026';
  const phone = values.phoneNumber?.trim()
    ? formatPhoneNumberWithCountryCode(values.phoneNumber, values.countryCode || '+91')
    : '+919876543210';
  const username = values.username?.trim() || email;

  return createUserRequestSchema.parse(
    compact({
      ...(branchId != null ? { branch_id: branchId } : {}),
      ...(needsCompany && companyId != null ? { company_id: companyId } : {}),
      organization_id: organizationId,
      email,
      first_name: firstName,
      last_name: lastName,
      password,
      phone,
      role_code: roleCode,
      username,
      status: 'active',
      is_active: true,
    }),
  );
}

function readRoleScope(value: JsonValue): RoleScope | undefined {
  const token = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (token === 'organization' || token === 'company' || token === 'branch') {
    return token;
  }
  return undefined;
}

export function toCreateUserBody(
  values: UserRoleFormValues | CreateUserMultiformValues,
  context?: CreateUserRequestContext,
): CreateUserRequest | JsonObject {
  if ('firstName' in values) {
    if (!context) {
      throw new Error('Create user requires organization, company, and branch context.');
    }
    return buildCreateUserRequest(values, context);
  }

  const { firstName, lastName } = splitName(values.name);
  return compact({
    first_name: firstName,
    last_name: lastName,
    email: values.email.trim().toLowerCase(),
    username: values.email.trim().toLowerCase(),
    status: values.status,
    branch_name: values.branch,
    company_name: values.company ?? '',
  });
}

export function parsePhoneNumberAndCountryCode(phone?: string | null): {
  phoneNumber: string;
  countryCode: string;
} {
  if (!phone) return { phoneNumber: '', countryCode: '+91' };
  const trimmed = phone.trim();
  if (trimmed.startsWith('+')) {
    const knownCodes = ['+971', '+91', '+44', '+49', '+65', '+61', '+1'];
    for (const code of knownCodes) {
      if (trimmed.startsWith(code)) {
        return {
          countryCode: code,
          phoneNumber: trimmed.slice(code.length).trim(),
        };
      }
    }
    const match = trimmed.match(/^(\+\d{1,4})\s*(.*)$/);
    if (match) {
      return { countryCode: match[1], phoneNumber: match[2].trim() };
    }
  }
  return { phoneNumber: trimmed, countryCode: '+91' };
}

export function isUserEditDisabled(
  userRoleScope: ScopeType | string | undefined | null,
  currentScope: ScopeType | string,
): boolean {
  const normUserScope = userRoleScope ? String(userRoleScope).toLowerCase().trim() : undefined;
  const normCurrentScope = String(currentScope).toLowerCase().trim();

  if (normCurrentScope === 'company') {
    return normUserScope === 'organization';
  }
  if (normCurrentScope === 'branch') {
    return normUserScope === 'organization' || normUserScope === 'company';
  }
  return false;
}

export function toUpdateUserBody(values: StaffProfileFormValues): JsonObject {
  const formattedPhone = formatPhoneNumberWithCountryCode(
    values.phoneNumber,
    values.countryCode || '+91',
  );
  return compact({
    first_name: values.firstName.trim(),
    last_name: values.lastName.trim(),
    email: values.email.trim().toLowerCase(),
    username: values.username.trim(),
    phone: formattedPhone,
    phone_number: formattedPhone,
    ...(values.roleDescription ? { description: values.roleDescription.trim() } : {}),
    ...(values.password ? { password: values.password } : {}),
  });
}

export function toUserStatusBody(status: UserStatus): JsonObject {
  const normalized = status === 'disabled' ? 'inactive' : status;
  return { status: normalized };
}

export type RoleAssignmentHints = {
  companyId?: number | string | null;
  branchId?: number | string | null;
  scope?: ScopeType | string | null;
};

function toRoleEntry(roleCode: string, hints?: RoleAssignmentHints): JsonObject {
  const branchId =
    hints?.branchId != null && hints.branchId !== '' ? Number(hints.branchId) : undefined;
  const companyId =
    hints?.companyId != null && hints.companyId !== '' ? Number(hints.companyId) : undefined;

  return compact({
    role_code: String(roleCode).trim(),
    ...(companyId != null && Number.isFinite(companyId) ? { company_id: companyId } : {}),
    ...(branchId != null && Number.isFinite(branchId) ? { branch_id: branchId } : {}),
  });
}

export function toReplaceRolesBody(
  roleCodeOrCodes: string | readonly string[],
  hints?: RoleAssignmentHints,
): JsonObject {
  const codes = Array.isArray(roleCodeOrCodes) ? roleCodeOrCodes : [roleCodeOrCodes];
  const roles = codes
    .map((code) => String(code).trim())
    .filter(Boolean)
    .map((role_code) => toRoleEntry(role_code, hints));

  return { roles };
}

export function toAssignRoleBody(roleCode: string, hints?: RoleAssignmentHints): JsonObject {
  return toRoleEntry(roleCode, hints);
}

export type CreateRoleBodyInput = {
  code: string;
  displayName: string;
  description?: string;
  scope: ScopeType | string;
  permissionCodes: string[];
};

export function toCreateRoleBody(input: CreateRoleBodyInput): JsonObject {
  const description = input.description?.trim();
  return compact({
    code: input.code.trim(),
    display_name: input.displayName.trim(),
    description: description ?? '',
    scope: input.scope,
    permission_codes: input.permissionCodes,
  });
}

export function staffProfileFromUser(
  user: UserRoleItem,
  raw?: JsonValue,
  catalog?: readonly RoleCatalogItem[],
): StaffProfileFormValues {
  const rawRecord = isRecord(raw)
    ? flattenUserRecord(unwrapEnvelope(raw) as JsonObject)
    : undefined;
  const { firstName: splitFirst, lastName: splitLast } = splitName(user.name);
  const firstName =
    (rawRecord ? (text(rawRecord.first_name) ?? text(rawRecord.firstName)) : undefined) ??
    splitFirst;
  const lastName =
    (rawRecord ? (text(rawRecord.last_name) ?? text(rawRecord.lastName)) : undefined) ?? splitLast;

  const rawPhone =
    (rawRecord
      ? (textOrNumber(rawRecord.phone) ??
        textOrNumber(rawRecord.phone_number) ??
        textOrNumber(rawRecord.phoneNumber) ??
        textOrNumber(rawRecord.mobile) ??
        textOrNumber(rawRecord.mobile_number) ??
        textOrNumber(rawRecord.mobileNumber) ??
        textOrNumber(rawRecord.contact) ??
        textOrNumber(rawRecord.contact_number) ??
        textOrNumber(rawRecord.contactNumber))
      : undefined) ?? user.phone;
  const { phoneNumber, countryCode } = parsePhoneNumberAndCountryCode(rawPhone);

  const username =
    (rawRecord ? text(rawRecord.username) : undefined) ??
    user.username ??
    user.email.split('@')[0] ??
    user.email;

  const roleName =
    user.role && user.role !== '—'
      ? user.role
      : ((rawRecord ? (text(rawRecord.role_name) ?? text(rawRecord.role)) : undefined) ?? '');

  const matchedRole = catalog?.find(
    (r) =>
      r.name.toLowerCase() === roleName.toLowerCase() ||
      (user.roleId && String(r.id) === String(user.roleId)) ||
      (user.roleCode && r.code?.toLowerCase() === user.roleCode.toLowerCase()),
  );

  const roleDescription =
    (rawRecord
      ? (text(rawRecord.role_description) ??
        text(rawRecord.roleDescription) ??
        text(rawRecord.description))
      : undefined) ??
    matchedRole?.description ??
    '';

  return {
    firstName,
    lastName,
    email: user.email,
    phoneNumber,
    countryCode,
    username,
    password: '',
    userStatus: user.status === 'active',
    roleName,
    roleDescription,
  };
}

export function isMatch(
  current: string | number | null | undefined,
  expected: string | number | null | undefined,
  options?: { caseSensitive?: boolean },
): boolean {
  if (current == null || expected == null) return false;
  const currentStr = String(current).trim();
  const expectedStr = String(expected).trim();
  return options?.caseSensitive
    ? currentStr === expectedStr
    : currentStr.toLowerCase() === expectedStr.toLowerCase();
}

export function resolveRoleId(
  roleName: string,
  catalog: readonly RoleCatalogItem[],
): string | number | null {
  const normalized = roleName.trim().toLowerCase();
  if (!normalized) return null;

  // 1. Exact match by name, id, or code
  const exactMatch = catalog.find(
    (role) =>
      isMatch(role.name, normalized) ||
      isMatch(role.id, normalized) ||
      isMatch(role.code, normalized),
  );
  if (exactMatch) return exactMatch.id;

  // 2. Normalized alphanumeric match
  const clean = normalized.replace(/[^a-z0-9]/g, '');
  const tokenMatch = catalog.find((role) => {
    const roleClean = role.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const codeClean = role.code ? role.code.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
    return roleClean === clean || (codeClean && codeClean === clean);
  });
  if (tokenMatch) return tokenMatch.id;

  // 3. Known role alias / keyword matching
  const aliasMatch = catalog.find((role) => {
    const roleLower = role.name.toLowerCase();
    if (normalized.includes('company') && roleLower.includes('company')) return true;
    if (normalized.includes('finance') && roleLower.includes('finance')) return true;
    if (normalized.includes('accountant') && roleLower.includes('accountant')) return true;
    if (normalized.includes('hr') && roleLower.includes('hr')) return true;
    if (normalized.includes('inventory') && roleLower.includes('inventory')) return true;
    if (
      normalized.includes('branch') &&
      (roleLower.includes('branch admin') || roleLower.includes('branch manager'))
    ) {
      return true;
    }
    if (normalized.includes('restaurant') && roleLower.includes('restaurant')) return true;
    if (
      (normalized.includes('cashier') || normalized.includes('pos')) &&
      roleLower.includes('cashier')
    ) {
      return true;
    }
    if (
      (normalized.includes('waiter') || normalized.includes('captain')) &&
      (roleLower.includes('waiter') || roleLower.includes('captain'))
    ) {
      return true;
    }
    if (normalized.includes('kitchen') && roleLower.includes('kitchen')) return true;
    return false;
  });
  if (aliasMatch) return aliasMatch.id;

  return null;
}

export function readPrimaryUserRoleId(assignmentsPayload: JsonValue): string | null {
  const rows = unwrapAssignments(assignmentsPayload);
  const first = rows[0];
  if (!first) return null;
  const id = first.user_role_id ?? first.userRoleId ?? first.id ?? first.role_id ?? first.roleId;
  return typeof id === 'string' || typeof id === 'number' ? String(id) : null;
}

/** Role template id for GET /v1/roles/{roleId}/permissions. */
export function readPrimaryRoleTemplateId(assignmentsPayload: JsonValue): string | null {
  const rows = unwrapAssignments(assignmentsPayload);
  const first = rows[0];
  if (!first) return null;
  const id = first.role_id ?? first.roleId ?? first.id;
  return typeof id === 'string' || typeof id === 'number' ? String(id) : null;
}

function coerceUserItem(mapped: UserRoleItem): UserRoleItem | null {
  let id = mapped.id?.trim();
  if (!id) {
    const emailCandidate = mapped.email?.trim();
    if (emailCandidate && emailCandidate.includes('@')) {
      id = emailCandidate.toLowerCase();
    } else if (mapped.name?.trim()) {
      id = mapped.name.trim().toLowerCase().replace(/\s+/g, '-');
    } else {
      return null;
    }
  }

  const email =
    mapped.email && mapped.email.includes('@')
      ? mapped.email
      : `user+${id.replace(/[^\dA-Za-z]/g, '')}@hospixo.local`;

  const parsed = userRoleItemSchema.safeParse({
    ...mapped,
    id,
    name: mapped.name?.trim() || email,
    email,
    role: mapped.role?.trim() || '—',
    branch: mapped.branch?.trim() || '—',
  });

  return parsed.success ? parsed.data : null;
}

function isNumericEntityLabel(value: string): boolean {
  const trimmed = value.trim();
  return /^\d+$/.test(trimmed) || /^(company|branch)\s*#\s*\d+$/i.test(trimmed);
}

function readCompanyDisplayName(source: JsonObject): string | undefined {
  const candidates = [
    text(source.company),
    text(source.company_name),
    text(source.companyName),
    readNestedName(source.company),
  ].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    if (!isNumericEntityLabel(candidate)) {
      return candidate;
    }
  }
  return undefined;
}

function mapUserRow(raw: JsonObject): UserRoleItem {
  const source = flattenUserRecord(raw);
  const id =
    source.id ??
    source.user_id ??
    source.userId ??
    source.uuid ??
    source.uid ??
    source.member_id ??
    source.memberId ??
    source.account_id ??
    source.accountId;
  const firstName = text(source.first_name) ?? text(source.firstName);
  const lastName = text(source.last_name) ?? text(source.lastName);
  const joinedName = [firstName, lastName].filter(Boolean).join(' ').trim();
  const name =
    text(source.name) ??
    text(source.full_name) ??
    text(source.fullName) ??
    (joinedName || undefined) ??
    text(source.email) ??
    text(source.username) ??
    'User';

  const roleMeta = readUserRoleFields(source);

  return {
    id: typeof id === 'number' || typeof id === 'string' ? String(id) : String(id ?? ''),
    name,
    email: text(source.email) ?? text(source.username) ?? '',
    role: roleMeta.label ?? '—',
    roleId: roleMeta.roleId,
    roleCode: roleMeta.roleCode,
    branch:
      text(source.branch) ??
      text(source.branch_name) ??
      text(source.branchName) ??
      readNestedName(source.branch) ??
      readNestedName(source.location) ??
      '—',
    company: readCompanyDisplayName(source),
    status: normalizeStatus(source),
    username: text(source.username) ?? undefined,
    avatar:
      text(source.avatar) ??
      text(source.avatar_url) ??
      text(source.avatarUrl) ??
      text(source.profile_image) ??
      undefined,
    createdAt: text(source.created_at) ?? text(source.createdAt) ?? undefined,
    phone:
      textOrNumber(source.phone) ??
      textOrNumber(source.phone_number) ??
      textOrNumber(source.phoneNumber) ??
      textOrNumber(source.mobile) ??
      textOrNumber(source.mobile_number) ??
      textOrNumber(source.mobileNumber) ??
      textOrNumber(source.contact) ??
      textOrNumber(source.contact_number) ??
      textOrNumber(source.contactNumber),
    scope: readRoleScope(source.scope) ?? readRoleScope(source.scope_type),
    companyId:
      typeof source.company_id === 'number'
        ? source.company_id
        : typeof source.companyId === 'number'
          ? source.companyId
          : undefined,
    branchId:
      typeof source.branch_id === 'number'
        ? source.branch_id
        : typeof source.branchId === 'number'
          ? source.branchId
          : undefined,
  };
}

function flattenUserRecord(raw: JsonObject): JsonObject {
  const nestedKeys = ['user', 'profile', 'account', 'member', 'staff'] as const;
  let merged: JsonObject = { ...raw };

  for (const key of nestedKeys) {
    const nested = raw[key];
    if (isRecord(nested)) {
      merged = { ...nested, ...merged, ...raw };
    }
  }

  return merged;
}

function mapRoleTemplateRow(raw: JsonObject): RoleTemplateItem {
  const id = raw.id ?? raw.template_id ?? raw.role_id;
  const roleName = readRoleLabel(raw) ?? 'Role';
  const iconSource = `${roleName} ${text(raw.code) ?? ''}`;
  const scope = readRoleScope(raw.scope);
  return {
    id: typeof id === 'number' || typeof id === 'string' ? String(id) : String(id ?? roleName),
    title: roleName,
    description:
      text(raw.description) ??
      text(raw.role_description) ??
      text(raw.roleDescription) ??
      text(raw.desc) ??
      '',
    icon: inferTemplateIcon(iconSource),
    roleName,
    ...(scope ? { scope } : {}),
  };
}

function humanizeRoleCode(code: string): string {
  return code
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function readRoleLabel(raw: JsonObject): string | undefined {
  return (
    text(raw.display_name) ??
    text(raw.displayName) ??
    text(raw.role_name) ??
    text(raw.roleName) ??
    text(raw.name) ??
    text(raw.title)
  );
}

function inferTemplateIcon(roleName: string): RoleTemplateItem['icon'] {
  const value = roleName.toLowerCase();
  if (value.includes('kitchen')) return 'kitchen';
  if (value.includes('pos') || value.includes('cashier') || value.includes('billing')) return 'pos';
  if (value.includes('captain') || value.includes('waiter') || value.includes('steward'))
    return 'captain';
  if (
    value.includes('company') ||
    value.includes('admin') ||
    value.includes('hotel') ||
    value.includes('hr') ||
    value.includes('accountant') ||
    value.includes('finance') ||
    value.includes('inventory')
  ) {
    return 'company';
  }
  return 'restaurant';
}

function extractPermissionGroups(payload: JsonValue): JsonValue[] {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) return [];
  for (const key of ['groups', 'categories', 'items', 'data', 'permissions'] as const) {
    const value = payload[key];
    if (Array.isArray(value)) return value;
  }
  const entries = Object.entries(payload);
  if (entries.length > 0 && entries.every(([, v]) => Array.isArray(v))) {
    return entries.map(([category, items]) => ({
      title: category,
      permissions: items,
    }));
  }
  return [];
}

function unwrapRecords(
  payload: JsonValue,
  keys: readonly string[],
  fallbackToRecord = false,
): JsonObject[] {
  const root = unwrapEnvelope(payload);
  if (Array.isArray(root)) return root.filter(isRecord);
  if (!isRecord(root)) return [];

  for (let idx = 0; idx < keys.length; idx += 1) {
    const candidate = root[keys[idx]];
    if (Array.isArray(candidate)) return candidate.filter(isRecord);
    if (isRecord(candidate)) {
      const nested = unwrapRecords(candidate, keys, false);
      if (nested.length > 0) return nested;
    }
  }

  return fallbackToRecord ? [root] : [];
}

const ASSIGNMENT_KEYS = ['items', 'assignments', 'roles', 'data'] as const;

function unwrapAssignments(payload: JsonValue): JsonObject[] {
  return unwrapRecords(payload, ASSIGNMENT_KEYS, true);
}

function readPrimaryRoleName(value: JsonValue): string | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const first = value[0];
  if (typeof first === 'string') return first;
  if (!isRecord(first)) return undefined;
  if (isRecord(first.role)) {
    const nested = readRoleLabel(first.role);
    if (nested) return nested;
  }

  return (
    text(first.display_name) ??
    text(first.displayName) ??
    text(first.role_display_name) ??
    text(first.roleDisplayName) ??
    text(first.name) ??
    text(first.role_name) ??
    text(first.title) ??
    text(first.code)
  );
}

function readNestedName(value: JsonValue): string | undefined {
  if (!isRecord(value)) return undefined;
  return readRoleLabel(value) ?? text(value.title);
}

type UserRoleFields = {
  label?: string;
  roleId?: string | number;
  roleCode?: string;
};

function readUserRoleFields(source: JsonObject): UserRoleFields {
  const directRole =
    typeof source.role === 'string' && source.role.trim() ? source.role.trim() : undefined;

  const label =
    directRole ??
    text(source.role_name) ??
    text(source.roleName) ??
    text(source.primary_role_name) ??
    text(source.primaryRoleName) ??
    (isRecord(source.role) ? readRoleLabel(source.role) : undefined) ??
    (isRecord(source.primary_role) ? readRoleLabel(source.primary_role) : undefined) ??
    (isRecord(source.primaryRole) ? readRoleLabel(source.primaryRole) : undefined) ??
    readPrimaryRoleName(source.roles) ??
    readPrimaryRoleName(source.user_roles) ??
    readPrimaryRoleName(source.role_assignments) ??
    readPrimaryRoleName(source.assignments) ??
    readPrimaryRoleName(source.assigned_roles);

  const roleId =
    readRoleId(source.role_id) ??
    readRoleId(source.roleId) ??
    readRoleId(source.primary_role_id) ??
    readRoleId(source.primaryRoleId) ??
    (isRecord(source.role) ? readRoleId(source.role) : undefined) ??
    readRoleIdFromCollection(source.roles) ??
    readRoleIdFromCollection(source.user_roles) ??
    readRoleIdFromCollection(source.assignments);

  const roleCode =
    text(source.role_code) ??
    text(source.roleCode) ??
    text(source.primary_role_code) ??
    (isRecord(source.role) ? text(source.role.code) : undefined) ??
    readRoleCodeFromCollection(source.roles) ??
    readRoleCodeFromCollection(source.user_roles);

  return { label, roleId, roleCode };
}

function readRoleId(value: JsonValue): string | number | undefined {
  if (typeof value === 'number' || typeof value === 'string') return value;
  if (isRecord(value)) {
    const id = value.id ?? value.role_id ?? value.roleId;
    if (typeof id === 'number' || typeof id === 'string') return id;
  }
  return undefined;
}

function readRoleIdFromCollection(value: JsonValue): string | number | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const first = value[0];
  if (!isRecord(first)) return undefined;
  return (
    readRoleId(first.role_id) ??
    readRoleId(first.roleId) ??
    (isRecord(first.role) ? readRoleId(first.role.id) : undefined)
  );
}

function readRoleCodeFromCollection(value: JsonValue): string | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const first = value[0];
  if (!isRecord(first)) return undefined;
  return (
    text(first.code) ??
    text(first.role_code) ??
    (isRecord(first.role) ? text(first.role.code) : undefined)
  );
}

function normalizeStatus(raw: JsonObject | string): UserStatus {
  if (typeof raw === 'string') {
    return normalizeStatusToken(raw);
  }

  if (raw.is_active === false || raw.isActive === false || raw.active === false) {
    return 'inactive';
  }
  if (raw.is_active === true || raw.isActive === true || raw.active === true) {
    return 'active';
  }

  const token = String(
    raw.status ?? raw.user_status ?? raw.membership_status ?? raw.account_status ?? 'active',
  );
  return normalizeStatusToken(token);
}

function normalizeStatusToken(value: string): UserStatus {
  const status = value.toLowerCase().trim();
  if (status === 'invited' || status === 'pending' || status === 'invite') return 'invited';
  if (
    status === 'disabled' ||
    status === 'suspended' ||
    status === 'deactivated' ||
    status === 'inactive'
  ) {
    return 'inactive';
  }
  return 'active';
}

const USER_KEYS = [
  'items',
  'users',
  'results',
  'result',
  'rows',
  'list',
  'data',
  'records',
  'content',
  'members',
  'staff',
  'team',
  'employees',
] as const;

const ROLE_KEYS = ['items', 'roles', 'templates', 'results', 'rows', 'data'] as const;

function unwrapUsers(payload: JsonValue): JsonObject[] {
  return unwrapRecords(payload, USER_KEYS);
}

function unwrapRoles(payload: JsonValue): JsonObject[] {
  return unwrapRecords(payload, ROLE_KEYS);
}

function readTotal(payload: JsonValue, fallback: number): number {
  let node: JsonValue = payload;
  for (let depth = 0; depth < 4; depth += 1) {
    node = unwrapEnvelope(node);
    if (!isRecord(node)) break;

    for (const key of ['total', 'total_count', 'totalCount', 'count', 'total_items'] as const) {
      if (typeof node[key] === 'number') return node[key] as number;
    }
    if (isRecord(node.meta)) {
      for (const key of ['total', 'total_count', 'totalCount', 'count'] as const) {
        if (typeof node.meta[key] === 'number') return node.meta[key] as number;
      }
    }
    if (isRecord(node.pagination) && typeof node.pagination.total === 'number') {
      return node.pagination.total;
    }
  }
  return fallback;
}

export function unwrapEnvelope(payload: JsonValue): JsonValue {
  let current: JsonValue = payload;

  for (let depth = 0; depth < 5; depth += 1) {
    if (!isRecord(current)) break;

    if ('data' in current && current.data !== undefined) {
      current = current.data;
      continue;
    }

    if (
      current.success === true &&
      'result' in current &&
      current.result !== undefined &&
      !('data' in current)
    ) {
      current = current.result;
      continue;
    }

    break;
  }

  return current;
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

function compact(record: JsonObject): JsonObject {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined));
}

function text(value: JsonValue | undefined): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function textOrNumber(value: JsonValue | undefined): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && !Number.isNaN(value)) return String(value);
  return undefined;
}

export function isRecord(value: JsonValue | undefined): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
