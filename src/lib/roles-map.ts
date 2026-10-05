/**
 * Roles API ↔ UI mappers for Users & Roles wizards.
 *
 * - ApiRoleTemplate → UiRoleTemplate (template grid cards)
 * - default_permissions codes → PermissionGroup[] (permissions accordion)
 * - resolveRoleCode for create/invite payloads
 */

import {
  roleTemplates,
  type PermissionGroup,
  type PermissionItem,
  type RoleTemplate,
  type RoleTemplateId,
} from '@/features/user-roles/config/roles';
import type {
  ApiRole,
  ApiRoleTemplate,
  CreateRoleInput,
  UpdateRoleInput,
  ApiPermissionGroup,
} from '@/types/roles';
import type { ScopeType } from '@/types/users';

/** Legacy Figma template ids → backend role_code (config fallback only). */
const TEMPLATE_TO_API_ROLE: Record<RoleTemplateId, string> = {
  'organisation-manager': 'tenant_admin',
  'company-manager': 'tenant_admin',
  'branch-manager': 'branch_manager',
  'store-manager': 'branch_manager',
  procurement: 'staff',
  'finance-approver': 'staff',
  auditor: 'staff',
  cashier: 'cashier',
  'kitchen-staff': 'kitchen_staff',
  'general-staff': 'staff',
};

export type UiRoleTemplate = Readonly<{
  /** Selection key — prefer API `code`. */
  id: string;
  code: string;
  title: string;
  description: string;
  scope?: string;
  icon: RoleTemplate['icon'];
  defaultPermissions: readonly string[];
}>;

function humanize(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\./g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function normalizeGroupKey(value: string): string {
  return value.trim().toLowerCase().replace(/[_-]+/g, ' ');
}

/** Avoid duplicated titles like "Orders Order" when module/resource overlap. */
export function permissionGroupTitle(module: string, resource: string): string {
  const moduleKey = normalizeGroupKey(module);
  const resourceKey = normalizeGroupKey(resource);

  if (!moduleKey) return humanize(resource);
  if (!resourceKey || moduleKey === resourceKey) return humanize(module);

  if (moduleKey === `${resourceKey}s` || `${moduleKey}s` === resourceKey) {
    return humanize(moduleKey.length >= resourceKey.length ? module : resource);
  }

  if (moduleKey.endsWith(resourceKey) || resourceKey.endsWith(moduleKey)) {
    return humanize(moduleKey.length >= resourceKey.length ? module : resource);
  }

  return humanize(`${module} ${resource}`);
}

/** Auth/system permissions are not assignable in the Users & Roles UI. */
export function isSystemPermissionCode(code: string): boolean {
  const normalized = code.trim().toLowerCase();
  return normalized.startsWith('auth.') || normalized.startsWith('auth_');
}

export function isSystemPermissionGroup(group: ApiPermissionGroup): boolean {
  const moduleKey = group.module.trim().toLowerCase();
  return moduleKey === 'auth' || group.permissions.every((p) => isSystemPermissionCode(p.code));
}

/** Drop auth modules and subscription-gated (unavailable) permissions. */
export function filterSelectablePermissionCatalog(
  catalog: readonly ApiPermissionGroup[],
): ApiPermissionGroup[] {
  return catalog
    .filter((group) => !isSystemPermissionGroup(group))
    .map((group) => ({
      ...group,
      permissions: group.permissions.filter(
        (permission) => permission.available !== false && !isSystemPermissionCode(permission.code),
      ),
    }))
    .filter((group) => group.permissions.length > 0);
}

function iconForCode(code: string): RoleTemplate['icon'] {
  const c = code.toLowerCase();
  if (c.includes('admin') || c.includes('tenant')) return 'shield';
  if (c.includes('store')) return 'store';
  if (c.includes('branch') || c.includes('manager')) return 'building';
  if (c.includes('cashier') || c.includes('card')) return 'card';
  if (c.includes('kitchen')) return 'utensils';
  if (c.includes('financ') || c.includes('bank') || c.includes('payment')) return 'banknote';
  if (c.includes('audit') || c.includes('search')) return 'search';
  if (c.includes('procur') || c.includes('inventory') || c.includes('order')) return 'clipboard';
  return 'user';
}

/** Build accordion groups from API permission codes (e.g. `orders.view`). */
export function permissionGroupsFromCodes(codes: readonly string[]): PermissionGroup[] {
  if (!codes.length) return [];

  const byGroup = new Map<string, PermissionItem[]>();

  for (const code of codes) {
    const [rawGroup, ...rest] = code.split('.');
    const groupId = rawGroup || 'general';
    const action = rest.join('.') || code;
    const list = byGroup.get(groupId) ?? [];
    list.push({
      id: code,
      label: humanize(action),
      description: code,
      enabled: true,
    });
    byGroup.set(groupId, list);
  }

  return [...byGroup.entries()].map(([id, permissions]) => ({
    id,
    title: humanize(id),
    permissions,
  }));
}

export function mapApiRoleTemplate(template: ApiRoleTemplate): UiRoleTemplate {
  return {
    id: template.code,
    code: template.code,
    title: template.display_name,
    description: template.description?.trim() || template.display_name,
    scope: template.scope,
    icon: iconForCode(template.code),
    defaultPermissions: template.default_permissions ?? [],
  };
}

/** Config templates as UI shape when API is unavailable. */
export function configTemplatesAsUi(): UiRoleTemplate[] {
  return roleTemplates.map((template) => ({
    id: TEMPLATE_TO_API_ROLE[template.id],
    code: TEMPLATE_TO_API_ROLE[template.id],
    title: template.title,
    description: template.description,
    icon: template.icon,
    defaultPermissions: [],
  }));
}

export function mapApiRoleTemplates(templates: readonly ApiRoleTemplate[]): UiRoleTemplate[] {
  if (!templates.length) return configTemplatesAsUi();
  return templates.map(mapApiRoleTemplate);
}

function findTemplateForRole(
  roleCode: string,
  templates: readonly ApiRoleTemplate[],
): ApiRoleTemplate | undefined {
  const exact = templates.find((template) => template.code === roleCode);
  if (exact) return exact;
  // e.g. role `cashier` may only have template `cashier_custom`
  return templates.find((template) => template.code.startsWith(`${roleCode}_`));
}

/**
 * Add User / invite picker — only **active** roles from GET /api/v1/roles.
 * Permissions prefer GET /roles/{id} `permission_codes`, then matching template defaults.
 */
export function mapAssignableRolesAsUi(
  roles: readonly ApiRole[],
  templates: readonly ApiRoleTemplate[] = [],
  permissionCodesByRoleCode: ReadonlyMap<string, readonly string[]> = new Map(),
): UiRoleTemplate[] {
  const active = roles.filter((role) => role.status === 'active');
  if (!active.length) return configTemplatesAsUi();

  return active.map((role) => {
    const template = findTemplateForRole(role.code, templates);
    const fromDetail = permissionCodesByRoleCode.get(role.code);
    return {
      id: role.code,
      code: role.code,
      title: role.display_name,
      description: role.description?.trim() || template?.description?.trim() || role.display_name,
      scope: role.scope,
      icon: iconForCode(role.code),
      defaultPermissions: fromDetail?.length ? fromDetail : (template?.default_permissions ?? []),
    };
  });
}

export function findUiTemplate(
  templates: readonly UiRoleTemplate[],
  id: string | null | undefined,
): UiRoleTemplate | undefined {
  if (!id) return undefined;
  return templates.find((template) => template.id === id || template.code === id);
}

/**
 * Resolve backend role_code from selected template id.
 * Prefer codes from the assignable roles list (already snake_case).
 */
export function resolveRoleCode(
  templateId: string | null | undefined,
  assignableCodes?: ReadonlySet<string> | readonly string[],
): string {
  if (!templateId) return 'staff';

  const mapped =
    templateId in TEMPLATE_TO_API_ROLE
      ? TEMPLATE_TO_API_ROLE[templateId as RoleTemplateId]
      : templateId;

  if (!assignableCodes) return mapped;

  const allowed = assignableCodes instanceof Set ? assignableCodes : new Set(assignableCodes);

  if (allowed.has(mapped)) return mapped;
  if (allowed.has('staff')) return 'staff';
  return [...allowed][0] ?? 'staff';
}

const ROLE_CODE_ALIAS_GROUPS: readonly (readonly string[])[] = [
  ['branch_manager', 'branch_admin', 'store_manager'],
  ['org_admin', 'organisation_admin', 'organization_admin', 'tenant_admin'],
  ['company_admin', 'company_manager'],
  ['kitchen_staff', 'kitchen'],
  ['staff', 'general_staff'],
];

function normalizeRoleKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

function aliasesForRoleCode(code: string): string[] {
  const key = normalizeRoleKey(code);
  const group = ROLE_CODE_ALIAS_GROUPS.find((aliases) => aliases.includes(key));
  return group ? [...group] : [key];
}

type LiveRoleRef = Pick<ApiRole, 'code' | 'status'> & {
  display_name?: string | null;
};

function isActiveRole(role: LiveRoleRef) {
  return !role.status || role.status === 'active';
}

/**
 * Map a UI/template role code onto an **active** org role from GET /api/v1/roles.
 * Exact code wins, then aliases (`branch_manager` ↔ `branch_admin`), then display name.
 */
export function matchLiveRoleCode(requested: string, roles: readonly LiveRoleRef[]): string | null {
  const active = roles.filter(isActiveRole);
  if (!active.length) return null;

  const requestedKey = normalizeRoleKey(requested);
  if (!requestedKey) return null;

  const exact = active.find((role) => normalizeRoleKey(role.code) === requestedKey);
  if (exact) return exact.code;

  const aliases = aliasesForRoleCode(requestedKey);
  const aliasHit = active.find((role) => aliases.includes(normalizeRoleKey(role.code)));
  if (aliasHit) return aliasHit.code;

  const prefixHit = active.find((role) => {
    const code = normalizeRoleKey(role.code);
    return aliases.some((alias) => code.startsWith(`${alias}_`));
  });
  if (prefixHit) return prefixHit.code;

  const nameHit = active.find((role) => {
    const name = normalizeRoleKey(role.display_name ?? '');
    return name.length > 0 && aliases.includes(name);
  });
  return nameHit?.code ?? null;
}

/** Convert a display name to a role code (snake_case). */
export function toRoleCode(displayName: string): string {
  return displayName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 50);
}

export function enabledPermissionCodes(groups: readonly PermissionGroup[]): string[] {
  return groups.flatMap((group) => group.permissions.filter((p) => p.enabled).map((p) => p.id));
}

/** Build RoleCreateRequest from Create Role wizard state. */
export function buildCreateRoleInput(input: {
  roleName: string;
  description: string;
  scope?: ScopeType;
  permissionGroups: readonly PermissionGroup[];
  templateCode?: string | null;
}): CreateRoleInput {
  const display_name = input.roleName.trim();
  const permission_codes = enabledPermissionCodes(input.permissionGroups);

  return {
    display_name,
    code: toRoleCode(display_name) || 'custom_role',
    scope: input.scope ?? 'branch',
    permission_codes,
    description: input.description.trim() || null,
    template_code: input.templateCode ?? null,
  };
}

/** Build RoleUpdateRequest from Edit Role form state. */
export function buildUpdateRoleInput(input: {
  roleName?: string;
  description?: string;
  scope?: ScopeType | null;
  permissionGroups: readonly PermissionGroup[];
  code?: string | null;
  templateCode?: string | null;
}): UpdateRoleInput {
  return {
    permission_codes: enabledPermissionCodes(input.permissionGroups),
    display_name: input.roleName?.trim() || null,
    description: input.description?.trim() || null,
    scope: input.scope ?? null,
    code: input.code ?? null,
    template_code: input.templateCode ?? null,
  };
}

/** Map API grouped catalog → UI PermissionGroup[]. */
export function mapGroupedPermissionsAsUi(
  groups: readonly ApiPermissionGroup[],
  enabledCodes: ReadonlySet<string> | readonly string[] = [],
): PermissionGroup[] {
  if (!groups.length) return [];

  const enabled = enabledCodes instanceof Set ? enabledCodes : new Set(enabledCodes);

  return groups
    .map((group) => ({
      id: `${group.module}.${group.resource}`,
      title: permissionGroupTitle(group.module, group.resource),
      permissions: group.permissions.map((permission) => ({
        id: permission.code,
        label: humanize(permission.action),
        description: permission.description?.trim() || permission.code,
        enabled: enabled.has(permission.code),
        available: permission.available !== false,
      })),
    }))
    .filter((group) => group.permissions.length > 0);
}

/** Keep only permissions whose codes appear in `allowedCodes`. */
export function filterPermissionGroupsToCodes(
  groups: readonly PermissionGroup[],
  allowedCodes: readonly string[],
): PermissionGroup[] {
  if (!allowedCodes.length) return [];

  const allowed = new Set(allowedCodes);
  return groups
    .map((group) => ({
      ...group,
      permissions: group.permissions.filter((permission) => allowed.has(permission.id)),
    }))
    .filter((group) => group.permissions.length > 0);
}

/**
 * Full selectable catalog for custom templates — all available permissions, none enabled.
 */
export function selectablePermissionGroupsFromCatalog(
  catalog: readonly ApiPermissionGroup[],
): PermissionGroup[] {
  return mapGroupedPermissionsAsUi(filterSelectablePermissionCatalog(catalog));
}

/**
 * Role-scoped view — only permissions assigned to the role, all marked enabled.
 */
export function permissionGroupsForRole(
  catalog: readonly ApiPermissionGroup[],
  rolePermissionCodes: readonly string[],
): PermissionGroup[] {
  if (!rolePermissionCodes.length) return [];

  const selectable = selectablePermissionGroupsFromCatalog(catalog);
  return filterPermissionGroupsToCodes(selectable, rolePermissionCodes).map((group) => ({
    ...group,
    permissions: group.permissions.map((permission) => ({
      ...permission,
      enabled: true,
    })),
  }));
}

/**
 * Apply enabled toggles on a catalog subset (custom template presets).
 */
export function applyEnabledOnCatalog(
  catalogGroups: readonly PermissionGroup[],
  enabledCodes: readonly string[],
): PermissionGroup[] {
  const enabled = new Set(enabledCodes);
  return catalogGroups.map((group) => ({
    ...group,
    permissions: group.permissions.map((permission) => ({
      ...permission,
      enabled: enabled.has(permission.id),
    })),
  }));
}

/** Enable permission toggles that match backend permission codes. */
export function applyEnabledPermissionCodes(
  groups: readonly PermissionGroup[],
  enabledCodes: readonly string[],
): PermissionGroup[] {
  if (groups.length === 0 || enabledCodes.length === 0) {
    return [...groups];
  }

  const enabled = new Set(enabledCodes);
  return groups.map((group) => ({
    ...group,
    permissions: group.permissions.map((permission) => ({
      ...permission,
      enabled: enabled.has(permission.id),
    })),
  }));
}

/**
 * Map filtered API catalog to UI groups with optional enabled codes.
 * Returns empty when catalog is unavailable — callers should show empty/error states.
 */
export function permissionGroupsFromCatalog(
  catalog: readonly ApiPermissionGroup[],
  enabledCodes: readonly string[] = [],
): PermissionGroup[] {
  const filtered = filterSelectablePermissionCatalog(catalog);
  if (filtered.length > 0) {
    return mapGroupedPermissionsAsUi(filtered, enabledCodes);
  }
  if (enabledCodes.length > 0) {
    return permissionGroupsFromCodes(enabledCodes);
  }
  return [];
}
