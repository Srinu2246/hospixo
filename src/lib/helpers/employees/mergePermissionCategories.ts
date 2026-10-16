import type { PermissionCategory } from '@/lib/schemas/employees/user-roles/userRolesSchema';

/** Keep user toggles when refreshing categories from GET /v1/permissions/grouped. */
export function mergePermissionCategories(
  current: readonly PermissionCategory[],
  incoming: readonly PermissionCategory[],
): PermissionCategory[] {
  if (incoming.length === 0) return [...current];
  if (current.length === 0) return incoming.map((category) => ({ ...category }));

  const enabledByPermissionId = new Map<string, boolean>();
  for (const category of current) {
    for (const permission of category.permissions) {
      enabledByPermissionId.set(permission.id, permission.enabled);
    }
  }

  return incoming.map((category) => ({
    ...category,
    permissions: category.permissions.map((permission) => ({
      ...permission,
      enabled: enabledByPermissionId.get(permission.id) ?? permission.enabled,
    })),
  }));
}
