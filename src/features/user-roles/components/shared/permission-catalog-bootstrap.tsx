'use client';

import { useEffect, useMemo, useRef } from 'react';

import type { PermissionGroup } from '@/features/user-roles/config/roles';
import { useAddUser } from '@/features/user-roles/components/add-user/add-user-context';
import { useCreateRole } from '@/features/user-roles/components/create-role/create-role-context';

function permissionCatalogSignature(groups: readonly PermissionGroup[]): string {
  return groups
    .map((group) => `${group.id}:${group.permissions.map((permission) => permission.id).join(',')}`)
    .join('|');
}

type PermissionCatalogBootstrapProps = Readonly<{
  permissionCatalog: readonly PermissionGroup[];
  /**
   * - `catalog-only`: store catalog; role bootstrap sets displayed groups.
   * - `full-catalog`: also populate permissionGroups with the full selectable catalog (custom template).
   */
  mode?: 'catalog-only' | 'full-catalog';
}>;

export function PermissionCatalogBootstrap({
  permissionCatalog,
  mode = 'catalog-only',
}: PermissionCatalogBootstrapProps) {
  const { setPermissionCatalog: setAddUserCatalog, setPermissionGroups: setAddUserGroups } =
    useAddUser();
  const { setPermissionCatalog: setCreateRoleCatalog, setPermissionGroups: setCreateRoleGroups } =
    useCreateRole();
  const catalogSignature = useMemo(
    () => permissionCatalogSignature(permissionCatalog),
    [permissionCatalog],
  );
  const appliedCreateRoleRef = useRef<string | null>(null);
  const appliedAddUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (permissionCatalog.length === 0) return;
    if (appliedCreateRoleRef.current === catalogSignature) return;
    appliedCreateRoleRef.current = catalogSignature;
    setCreateRoleCatalog([...permissionCatalog]);
    if (mode === 'full-catalog') {
      setCreateRoleGroups(
        permissionCatalog.map((group) => ({
          ...group,
          permissions: group.permissions.map((permission) => ({
            ...permission,
            enabled: false,
          })),
        })),
      );
    }
  }, [catalogSignature, mode, permissionCatalog, setCreateRoleCatalog, setCreateRoleGroups]);

  useEffect(() => {
    if (permissionCatalog.length === 0) return;
    if (appliedAddUserRef.current === catalogSignature) return;
    appliedAddUserRef.current = catalogSignature;
    setAddUserCatalog([...permissionCatalog]);
    if (mode === 'full-catalog') {
      setAddUserGroups(
        permissionCatalog.map((group) => ({
          ...group,
          permissions: group.permissions.map((permission) => ({
            ...permission,
            enabled: false,
          })),
        })),
      );
    }
  }, [catalogSignature, mode, permissionCatalog, setAddUserCatalog, setAddUserGroups]);

  return null;
}
