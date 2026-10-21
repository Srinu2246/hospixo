import { z } from 'zod';

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
  company_id: z.number().int().positive(),
  email: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  organization_id: z.number().int().positive(),
  password: z.string().min(6),
  phone: z.string().min(1),
  role_code: z.string().min(1),
  username: z.string().min(1),
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
  companyId: number;
  branchId?: number;
  roleCatalog?: readonly RoleCatalogItem[];
  roleCode?: string;
};

export type ParsedUserList = {
  items: UserRoleItem[];
  total: number;
};

export type UserRoleListResponse = ParsedUserList;

export function parseUserList(payload: unknown): ParsedUserList {
  const rows = unwrapUsers(payload);
  const items = rows.flatMap((row) => {
    const coerced = coerceUserItem(mapUserRow(row));
    return coerced ? [coerced] : [];
  });
  return { items, total: readTotal(payload, items.length) };
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

export function parseUserRecord(payload: unknown): UserRoleItem | null {
  const unwrapped = unwrapEnvelope(payload);
  if (!isRecord(unwrapped)) return null;
  return coerceUserItem(mapUserRow(unwrapped));
}

export function readUserId(payload: unknown): string | null {
  const user = parseUserRecord(payload);
  if (user) return user.id;
  if (!isRecord(payload)) return null;
  const id = payload.id ?? payload.user_id ?? payload.userId;
  return typeof id === 'string' || typeof id === 'number' ? String(id) : null;
}

export function parseRoleCatalog(payload: unknown): RoleCatalogItem[] {
  return unwrapRoles(payload).flatMap((row) => {
    const id = row.id ?? row.role_id ?? row.roleId;
    const name = readRoleLabel(row);
    if (id === undefined || !name) return [];
    const code = text(row.code) ?? text(row.role_code);
    const scope = readRoleScope(row.scope);
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

export function parseRoleTemplates(payload: unknown): RoleTemplateItem[] {
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

export function parseGroupedPermissions(payload: unknown): PermissionCategory[] {
  const unwrapped = unwrapEnvelope(payload);
  const groups = extractPermissionGroups(unwrapped);

  if (
    groups.length > 0 &&
    groups.every(
      (g) => isRecord(g) && !('permissions' in g) && !('items' in g) && !('children' in g),
    )
  ) {
    const map = new Map<string, unknown[]>();
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

function toTitleCase(value: string): string {
  return value
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function resolvePermissionCategoryTitle(raw: Record<string, unknown>, groupIndex: number): string {
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
  entry: Record<string, unknown>,
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

function resolvePermissionItemDescription(entry: Record<string, unknown>, name: string): string {
  const desc = text(entry.description);
  if (desc) return desc;

  const code =
    text(entry.code) ?? text(entry.permission_code) ?? text(entry.permissionCode) ?? text(entry.id);
  if (code && PERMISSION_DESCRIPTION_OVERRIDES[code.trim().toLowerCase()]) {
    return PERMISSION_DESCRIPTION_OVERRIDES[code.trim().toLowerCase()];
  }

  return `Allows user to ${name.toLowerCase()}`;
}

function mapPermissionGroup(raw: Record<string, unknown>, groupIndex: number): PermissionCategory {
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
        return [
          {
            id: readPermissionItemId(entry, name, categoryId, permissionIndex),
            ...(code ? { code } : {}),
            name,
            description,
            enabled: Boolean(entry.enabled ?? entry.granted ?? entry.active ?? false),
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

function readPermissionGroupId(
  raw: Record<string, unknown>,
  title: string,
  groupIndex: number,
): string {
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
  entry: Record<string, unknown>,
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
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  role: z.string().min(1, 'Please select a role'),
  branch: z.string().min(1, 'Please select a branch'),
  status: userStatusSchema,
  company: z.string().optional(),
});

export type UserRoleFormValues = z.infer<typeof userRoleFormSchema>;

const createUserMultiformFieldsSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  countryCode: z.string().optional(),
  phoneNumber: z.string().min(6, 'Please enter a valid phone number'),
  email: z.string().email('Please enter a valid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  company: z.string(),
  branch: z.string(),
  role: z.string(),
  sendInviteImmediately: z.boolean(),
  personalMessage: z.string(),
});

function isMissingAssignment(value: string): boolean {
  return !value.trim() || value.trim() === '—';
}

export function buildCreateUserStepOneSchema(
  catalog: readonly RoleCatalogItem[],
  wizardScope?: ScopeType,
) {
  return createUserMultiformFieldsSchema.superRefine((data, ctx) => {
    if (wizardScope !== 'branch' && isMissingAssignment(data.company)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Please select a company',
        path: ['company'],
      });
    }
    if (isMissingAssignment(data.role)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Please select a role',
        path: ['role'],
      });
    }

    const roleCode = resolveRoleCode(data.role, catalog);
    const needsBranch = roleCode
      ? roleRequiresBranchId(roleCode, catalog)
      : wizardScope === 'branch';

    if (needsBranch && isMissingAssignment(data.branch)) {
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

export const customTemplateSchema = z.object({
  templateName: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  preset: z.enum(['full_read', 'standard_manager', 'view_only', 'custom']),
});

export type CustomTemplateFormValues = z.infer<typeof customTemplateSchema>;

export const staffProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().min(6, 'Please enter a valid phone number'),
  countryCode: z.string(),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().optional(),
  userStatus: z.boolean(),
  roleName: z.string().min(1, 'Role name is required'),
  roleDescription: z.string().optional(),
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
  const roleCode = context.roleCode ?? resolveRoleCode(values.role, catalog);
  if (!roleCode) {
    throw new Error('Unable to resolve role_code for the selected role.');
  }

  const needsBranch = roleRequiresBranchId(roleCode, catalog);
  if (needsBranch && context.branchId == null) {
    throw new Error('Branch is required for branch-scoped roles.');
  }

  return createUserRequestSchema.parse(
    compact({
      ...(context.branchId != null ? { branch_id: context.branchId } : {}),
      company_id: context.companyId,
      organization_id: context.organizationId,
      email: values.email.trim().toLowerCase(),
      first_name: values.firstName.trim(),
      last_name: values.lastName.trim(),
      password: values.password,
      phone: formatPhoneNumberWithCountryCode(values.phoneNumber, values.countryCode || '+91'),
      role_code: roleCode,
      username: values.username?.trim() || values.email.trim().toLowerCase(),
    }),
  );
}

function readRoleScope(value: unknown): RoleScope | undefined {
  const token = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (token === 'organization' || token === 'company' || token === 'branch') {
    return token;
  }
  return undefined;
}

export function toCreateUserBody(
  values: UserRoleFormValues | CreateUserMultiformValues,
  context?: CreateUserRequestContext,
): CreateUserRequest | Record<string, unknown> {
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
    company_name: values.company,
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

export function toUpdateUserBody(values: StaffProfileFormValues): Record<string, unknown> {
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

export function toUserStatusBody(status: UserStatus): Record<string, unknown> {
  const normalized = status === 'disabled' ? 'inactive' : status;
  return { status: normalized };
}

export type RoleAssignmentHints = {
  companyId?: number | string | null;
  branchId?: number | string | null;
  scope?: ScopeType | string | null;
};

function toRoleEntry(roleCode: string, hints?: RoleAssignmentHints): Record<string, unknown> {
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
): Record<string, unknown> {
  const codes = Array.isArray(roleCodeOrCodes) ? roleCodeOrCodes : [roleCodeOrCodes];
  const roles = codes
    .map((code) => String(code).trim())
    .filter(Boolean)
    .map((role_code) => toRoleEntry(role_code, hints));

  return { roles };
}

export function toAssignRoleBody(
  roleCode: string,
  hints?: RoleAssignmentHints,
): Record<string, unknown> {
  return toRoleEntry(roleCode, hints);
}

export function toCreateRoleBody(name: string, description?: string): Record<string, unknown> {
  return compact({ name, description });
}

export function staffProfileFromUser(
  user: UserRoleItem,
  raw?: unknown,
  catalog?: readonly RoleCatalogItem[],
): StaffProfileFormValues {
  const rawRecord = isRecord(raw)
    ? flattenUserRecord(unwrapEnvelope(raw) as Record<string, unknown>)
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

export function readPrimaryUserRoleId(assignmentsPayload: unknown): string | null {
  const rows = unwrapAssignments(assignmentsPayload);
  const first = rows[0];
  if (!first) return null;
  const id = first.user_role_id ?? first.userRoleId ?? first.id ?? first.role_id ?? first.roleId;
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

function mapUserRow(raw: Record<string, unknown>): UserRoleItem {
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
    company:
      text(source.company) ??
      text(source.company_name) ??
      text(source.companyName) ??
      readNestedName(source.company) ??
      undefined,
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

function flattenUserRecord(raw: Record<string, unknown>): Record<string, unknown> {
  const nestedKeys = ['user', 'profile', 'account', 'member', 'staff'] as const;
  let merged: Record<string, unknown> = { ...raw };

  for (const key of nestedKeys) {
    const nested = raw[key];
    if (isRecord(nested)) {
      merged = { ...nested, ...merged, ...raw };
    }
  }

  return merged;
}

function mapRoleTemplateRow(raw: Record<string, unknown>): RoleTemplateItem {
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

function readRoleLabel(raw: Record<string, unknown>): string | undefined {
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

function extractPermissionGroups(payload: unknown): unknown[] {
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
  payload: unknown,
  keys: readonly string[],
  fallbackToRecord = false,
): Record<string, unknown>[] {
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

function unwrapAssignments(payload: unknown): Record<string, unknown>[] {
  return unwrapRecords(payload, ASSIGNMENT_KEYS, true);
}

function readPrimaryRoleName(value: unknown): string | undefined {
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

function readNestedName(value: unknown): string | undefined {
  if (!isRecord(value)) return undefined;
  return readRoleLabel(value) ?? text(value.title);
}

type UserRoleFields = {
  label?: string;
  roleId?: string | number;
  roleCode?: string;
};

function readUserRoleFields(source: Record<string, unknown>): UserRoleFields {
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

function readRoleId(value: unknown): string | number | undefined {
  if (typeof value === 'number' || typeof value === 'string') return value;
  if (isRecord(value)) {
    const id = value.id ?? value.role_id ?? value.roleId;
    if (typeof id === 'number' || typeof id === 'string') return id;
  }
  return undefined;
}

function readRoleIdFromCollection(value: unknown): string | number | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const first = value[0];
  if (!isRecord(first)) return undefined;
  return (
    readRoleId(first.role_id) ??
    readRoleId(first.roleId) ??
    (isRecord(first.role) ? readRoleId(first.role.id) : undefined)
  );
}

function readRoleCodeFromCollection(value: unknown): string | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const first = value[0];
  if (!isRecord(first)) return undefined;
  return (
    text(first.code) ??
    text(first.role_code) ??
    (isRecord(first.role) ? text(first.role.code) : undefined)
  );
}

function normalizeStatus(raw: Record<string, unknown> | string): UserStatus {
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

function unwrapUsers(payload: unknown): Record<string, unknown>[] {
  return unwrapRecords(payload, USER_KEYS);
}

function unwrapRoles(payload: unknown): Record<string, unknown>[] {
  return unwrapRecords(payload, ROLE_KEYS);
}

function readTotal(payload: unknown, fallback: number): number {
  let node: unknown = payload;
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

export function unwrapEnvelope(payload: unknown): unknown {
  let current: unknown = payload;

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

function compact(record: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined));
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function textOrNumber(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && !Number.isNaN(value)) return String(value);
  return undefined;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
