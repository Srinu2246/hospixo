/**
 * Server-only Roles & Permissions data loaders.
 */

import { getGroupedPermissions } from '@/lib/api/permissions';
import { createRole, getRole, getRoleTemplates, listRoles } from '@/lib/api/roles';
import { getUserFriendlyErrorMessage } from '@/lib/api/errors';
import { getServerAuthSession } from '@/lib/auth/session';
import { getServerToken } from '@/server/auth';
import type { AccessLevel } from '@/lib/auth/access-level';
import {
  configTemplatesAsUi,
  mapApiRoleTemplates,
  mapAssignableRolesAsUi,
  selectablePermissionGroupsFromCatalog,
  type UiRoleTemplate,
} from '@/lib/roles-map';
import type { ApiPermissionGroup, ApiRole, CreateRoleInput } from '@/types/roles';
import type { PermissionGroup } from '@/features/user-roles/config/roles';

export type RolesListPageData = Readonly<{
  roles: readonly ApiRole[];
  error: string | null;
}>;

export type RoleWizardCatalog = Readonly<{
  templates: readonly UiRoleTemplate[];
  permissionCatalog: readonly ApiPermissionGroup[];
  permissionGroups: readonly PermissionGroup[];
  error: string | null;
}>;

function filterTemplatesForLevel(
  templates: readonly UiRoleTemplate[],
  level: AccessLevel,
): UiRoleTemplate[] {
  if (level === 'organisation') {
    return [...templates];
  }

  if (level === 'company') {
    return templates.filter(
      (template) =>
        template.scope !== 'organisation' &&
        !template.code.includes('org_admin') &&
        !template.code.includes('tenant_admin') &&
        !template.code.includes('company_manager'),
    );
  }

  return templates.filter((template) => {
    const scope = template.scope ?? 'branch';
    if (scope === 'organisation' || scope === 'company') return false;
    const code = template.code.toLowerCase();
    return (
      !code.includes('branch_manager') &&
      !code.includes('org_admin') &&
      !code.includes('tenant_admin') &&
      !code.includes('company_manager')
    );
  });
}

async function resolveToken() {
  const session = await getServerAuthSession().catch(() => null);
  return session?.accessToken ?? (await getServerToken());
}

/** Roles index — GET /api/v1/roles */
export async function loadRolesListPageData(): Promise<RolesListPageData> {
  const token = await resolveToken();
  if (!token) {
    return { roles: [], error: 'Sign in required.' };
  }

  try {
    const result = await listRoles(token);
    return { roles: result.items, error: null };
  } catch (error) {
    return {
      roles: [],
      error: getUserFriendlyErrorMessage(error, 'Unable to load roles.'),
    };
  }
}

/** Template grid + permissions catalog for create-role / add-user wizards. */
export async function loadRoleWizardCatalog(
  level: AccessLevel = 'organisation',
): Promise<RoleWizardCatalog> {
  const token = await resolveToken();
  if (!token) {
    return {
      templates: [],
      permissionCatalog: [],
      permissionGroups: [],
      error: 'Sign in required.',
    };
  }

  try {
    const [rolesResult, templatesResult, permissionsResult] = await Promise.all([
      listRoles(token),
      getRoleTemplates(token).catch(() => ({ templates: [] })),
      getGroupedPermissions(token).catch(() => ({ groups: [] })),
    ]);

    const permissionCatalog = permissionsResult.groups ?? [];
    const permissionGroups = selectablePermissionGroupsFromCatalog(permissionCatalog);

    const permissionCodesByRoleCode = new Map<string, readonly string[]>();
    await Promise.all(
      rolesResult.items
        .filter((role) => role.status === 'active' && role.id != null)
        .map(async (role) => {
          try {
            const detail = await getRole(token, role.id!);
            if (detail.permission_codes?.length) {
              permissionCodesByRoleCode.set(role.code, detail.permission_codes);
            }
          } catch {
            /* skip roles that fail detail fetch */
          }
        }),
    );

    const fromAssignable = mapAssignableRolesAsUi(
      rolesResult.items,
      templatesResult.templates ?? [],
      permissionCodesByRoleCode,
    );
    const fromTemplates = mapApiRoleTemplates(templatesResult.templates ?? []);
    const merged = fromAssignable.length > 0 ? fromAssignable : fromTemplates;
    const templates = filterTemplatesForLevel(merged, level);

    return {
      templates,
      permissionCatalog,
      permissionGroups,
      error: templates.length === 0 ? 'No assignable roles returned from the API.' : null,
    };
  } catch (error) {
    return {
      templates: configTemplatesAsUi(),
      permissionCatalog: [],
      permissionGroups: [],
      error: getUserFriendlyErrorMessage(error, 'Unable to load roles catalog.'),
    };
  }
}

export async function createRoleOnServer(input: CreateRoleInput) {
  const token = await resolveToken();
  if (!token) {
    throw new Error('Sign in required.');
  }

  return createRole(token, input);
}

export async function loadRolePermissionCodes(roleId: number | string) {
  const token = await resolveToken();
  if (!token) return [];

  try {
    const role = await getRole(token, roleId);
    return role.permission_codes ?? [];
  } catch {
    return [];
  }
}
