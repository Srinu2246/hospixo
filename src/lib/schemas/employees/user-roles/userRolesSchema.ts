import { z } from 'zod';

// ============================================================================
// 1. Primitive Domain Types & Enums
// ============================================================================

export const scopeTypeSchema = z.enum(['organization', 'company', 'branch']);
export type ScopeType = z.infer<typeof scopeTypeSchema>;

export const userStatusSchema = z.enum(['active', 'invited', 'disabled', 'inactive']);
export type UserStatus = z.infer<typeof userStatusSchema>;

export const createUserStepSchema = z.enum([
  'template',
  'user-form',
  'permissions',
  'review',
  'success',
]);
export type CreateUserStep = z.infer<typeof createUserStepSchema>;

// ============================================================================
// 2. User Role Item & Stats Schemas
// ============================================================================

export const userRoleItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
  branch: z.string(),
  status: userStatusSchema,
  avatar: z.string().optional(),
  createdAt: z.string().optional(),
  company: z.string().optional(),
  scope: scopeTypeSchema.optional(),
  /** Present when the list API only returns role ids/codes; used to resolve labels from the roles catalog. */
  roleId: z.union([z.string(), z.number()]).optional(),
  roleCode: z.string().optional(),
});

export type UserRoleItem = z.infer<typeof userRoleItemSchema>;

export const userRoleStatsDataSchema = z.object({
  totalUsers: z.number(),
  activeNow: z.number(),
  pendingInvites: z.number(),
  userRoles: z.number(),
});

export type UserRoleStatsData = z.infer<typeof userRoleStatsDataSchema>;

export const userRoleFilterValuesSchema = z.object({
  search: z.string(),
  role: z.string(),
  branch: z.string(),
  status: z.string(),
  company: z.string().optional(),
});

export type UserRoleFilterValues = z.infer<typeof userRoleFilterValuesSchema>;

// ============================================================================
// 3. User Role Form Schemas
// ============================================================================

export const userRoleFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  role: z.string().min(1, 'Please select a role'),
  branch: z.string().min(1, 'Please select a branch'),
  status: userStatusSchema,
  company: z.string().optional(),
});

export type UserRoleFormValues = z.infer<typeof userRoleFormSchema>;
export { userRoleFormSchema as userRoleSchema };

// ============================================================================
// 4. Create User Multi-Form Flow Schema
// ============================================================================

const createUserMultiformFieldsSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
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

/** Step-one validation: branch is required only for branch-scoped roles (or branch wizard scope). */
export function buildCreateUserStepOneSchema(
  catalog: readonly RoleCatalogItem[],
  wizardScope?: ScopeType,
) {
  return createUserMultiformFieldsSchema.superRefine((data, ctx) => {
    if (isMissingAssignment(data.company)) {
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

/** Default step-one schema when role catalog / wizard scope are unavailable. */
export const createUserMultiformSchema = buildCreateUserStepOneSchema([], 'branch');

// ============================================================================
// 5. Permissions & Role Templates Schemas
// ============================================================================

export const permissionItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  enabled: z.boolean(),
});

export type PermissionItem = z.infer<typeof permissionItemSchema>;

export const permissionCategorySchema = z.object({
  id: z.string(),
  title: z.string(),
  permissions: z.array(permissionItemSchema),
});

export type PermissionCategory = z.infer<typeof permissionCategorySchema>;

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

export const customTemplateSchema = z.object({
  templateName: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  preset: z.enum(['full_read', 'standard_manager', 'view_only', 'custom']),
});

export type CustomTemplateFormValues = z.infer<typeof customTemplateSchema>;

// ============================================================================
// 6. Staff Profile Schema
// ============================================================================

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

// ============================================================================
// 7. Live Backend Contracts, Request Schemas & API Mappers
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
});

export type CreateUserRequest = z.infer<typeof createUserRequestSchema>;

export type RoleScope = 'organization' | 'company' | 'branch';

export type RoleCatalogItem = {
  id: string | number;
  name: string;
  code?: string;
  scope?: RoleScope;
};

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

    if (!fromCatalog) return user;
    if (!user.role || user.role === '—' || looksLikeRoleCode(user.role)) {
      return { ...user, role: fromCatalog };
    }
    return user;
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
    return [
      {
        id: typeof id === 'number' || typeof id === 'string' ? id : String(id),
        name,
        ...(code ? { code } : {}),
        ...(scope ? { scope } : {}),
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
  return groups.flatMap((group) => {
    if (!isRecord(group)) return [];
    const mapped = mapPermissionGroup(group);
    const parsed = permissionCategorySchema.safeParse(mapped);
    return parsed.success ? [parsed.data] : [];
  });
}

function mapPermissionGroup(raw: Record<string, unknown>): PermissionCategory {
  const permissionsRaw = raw.permissions ?? raw.items ?? raw.children ?? [];
  const permissions = Array.isArray(permissionsRaw)
    ? permissionsRaw.flatMap((entry) => {
        if (!isRecord(entry)) return [];
        return [
          {
            id: String(entry.id ?? entry.key ?? entry.code ?? entry.name ?? 'permission'),
            name:
              text(entry.display_name) ??
              text(entry.displayName) ??
              text(entry.name) ??
              text(entry.label) ??
              text(entry.title) ??
              'Permission',
            description: text(entry.description) ?? '',
            enabled: Boolean(entry.enabled ?? entry.granted ?? entry.active ?? false),
          },
        ];
      })
    : [];

  return {
    id: String(raw.id ?? raw.key ?? raw.code ?? raw.title ?? 'group'),
    title: text(raw.title) ?? text(raw.name) ?? text(raw.label) ?? 'Permissions',
    permissions,
  };
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
  return match?.code?.trim().toLowerCase() ?? undefined;
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
  if (!role?.scope) return false;
  return role.scope === 'branch';
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
      ...(needsBranch ? { branch_id: context.branchId } : {}),
      company_id: context.companyId,
      organization_id: context.organizationId,
      email: values.email.trim().toLowerCase(),
      first_name: values.firstName.trim(),
      last_name: values.lastName.trim(),
      password: values.password,
      phone: values.phoneNumber.trim(),
      role_code: roleCode,
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

export function toUpdateUserBody(values: StaffProfileFormValues): Record<string, unknown> {
  return compact({
    first_name: values.firstName.trim(),
    last_name: values.lastName.trim(),
    email: values.email.trim().toLowerCase(),
    username: values.username.trim(),
    phone: values.phoneNumber,
    ...(values.password ? { password: values.password } : {}),
  });
}

export function toUserStatusBody(status: UserStatus): Record<string, unknown> {
  return { status };
}

export function toReplaceRolesBody(roleIds: readonly (string | number)[]): Record<string, unknown> {
  return { role_ids: roleIds.map(String) };
}

export function toAssignRoleBody(roleId: string | number): Record<string, unknown> {
  return { role_id: String(roleId) };
}

export function toCreateRoleBody(name: string, description?: string): Record<string, unknown> {
  return compact({ name, description });
}

export function staffProfileFromUser(user: UserRoleItem): StaffProfileFormValues {
  const { firstName, lastName } = splitName(user.name);
  return {
    firstName,
    lastName,
    email: user.email,
    phoneNumber: '',
    countryCode: '+1',
    username: user.email.split('@')[0] ?? user.email,
    password: '',
    userStatus: user.status === 'active',
    roleName: user.role,
    roleDescription: '',
  };
}

export function resolveRoleId(
  roleName: string,
  catalog: readonly RoleCatalogItem[],
): string | number | null {
  const normalized = roleName.trim().toLowerCase();
  if (!normalized) return null;
  const match = catalog.find((role) => role.name.trim().toLowerCase() === normalized);
  return match?.id ?? null;
}

export function readPrimaryUserRoleId(assignmentsPayload: unknown): string | null {
  const rows = unwrapAssignments(assignmentsPayload);
  const first = rows[0];
  if (!first) return null;
  const id = first.id ?? first.user_role_id ?? first.userRoleId;
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
    avatar:
      text(source.avatar) ??
      text(source.avatar_url) ??
      text(source.avatarUrl) ??
      text(source.profile_image) ??
      undefined,
    createdAt: text(source.created_at) ?? text(source.createdAt) ?? undefined,
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
  return {
    id: typeof id === 'number' || typeof id === 'string' ? String(id) : String(id ?? roleName),
    title: roleName,
    description: text(raw.description) ?? '',
    icon: inferTemplateIcon(iconSource),
    roleName,
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
  if (value.includes('pos') || value.includes('cashier')) return 'pos';
  if (value.includes('captain') || value.includes('waiter')) return 'captain';
  if (value.includes('company')) return 'company';
  return 'restaurant';
}

function extractPermissionGroups(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) return [];
  for (const key of ['groups', 'categories', 'items', 'data', 'permissions'] as const) {
    const value = payload[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

function unwrapAssignments(payload: unknown): Record<string, unknown>[] {
  const unwrapped = unwrapEnvelope(payload);
  if (Array.isArray(unwrapped)) return unwrapped.filter(isRecord);
  if (!isRecord(unwrapped)) return [];
  for (const key of ['items', 'assignments', 'roles', 'data'] as const) {
    const value = unwrapped[key];
    if (Array.isArray(value)) return value.filter(isRecord);
  }
  return [];
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
  const directRole = source.role;
  if (typeof directRole === 'string' && directRole.trim()) {
    return { label: directRole.trim() };
  }

  const label =
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
    readRoleIdFromCollection(source.roles) ??
    readRoleIdFromCollection(source.user_roles) ??
    readRoleIdFromCollection(source.assignments);

  const roleCode =
    text(source.role_code) ??
    text(source.roleCode) ??
    text(source.primary_role_code) ??
    readRoleCodeFromCollection(source.roles) ??
    readRoleCodeFromCollection(source.user_roles);

  return { label, roleId, roleCode };
}

function readRoleId(value: unknown): string | number | undefined {
  if (typeof value === 'number' || typeof value === 'string') return value;
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
    return 'disabled';
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
  if (status === 'disabled' || status === 'suspended' || status === 'deactivated') {
    return 'disabled';
  }
  if (status === 'inactive') return 'inactive';
  return 'active';
}

function unwrapUsers(payload: unknown): Record<string, unknown>[] {
  const unwrapped = unwrapEnvelope(payload);
  if (Array.isArray(unwrapped)) return unwrapped.filter(isRecord);
  if (!isRecord(unwrapped)) return [];
  for (const key of [
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
  ] as const) {
    const value = unwrapped[key];
    if (Array.isArray(value)) return value.filter(isRecord);
    if (isRecord(value)) {
      const nested = unwrapUsers(value);
      if (nested.length > 0) return nested;
    }
  }
  return [];
}

function unwrapRoles(payload: unknown): Record<string, unknown>[] {
  const unwrapped = unwrapEnvelope(payload);
  if (Array.isArray(unwrapped)) return unwrapped.filter(isRecord);
  if (!isRecord(unwrapped)) return [];
  for (const key of ['items', 'roles', 'templates', 'results', 'rows', 'data'] as const) {
    const value = unwrapped[key];
    if (Array.isArray(value)) return value.filter(isRecord);
    if (isRecord(value)) {
      const nested = unwrapRoles(value);
      if (nested.length > 0) return nested;
    }
  }
  return [];
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

function unwrapEnvelope(payload: unknown): unknown {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
