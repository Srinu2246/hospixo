'use client';

import { useEffect, useRef } from 'react';

import type { PermissionGroup } from '@/features/user-roles/config/roles';
import { useAddUser } from '@/features/user-roles/components/add-user/add-user-context';
import { useCreateRole } from '@/features/user-roles/components/create-role/create-role-context';
import { filterPermissionGroupsToCodes, matchLiveRoleCode } from '@/lib/roles-map';
import { fetchRole, fetchRolesList } from '@/lib/roles';

function catalogKey(catalog: readonly PermissionGroup[]): string {
  return catalog.map((group) => group.id).join('|');
}

function roleScopedGroups(catalog: readonly PermissionGroup[], permissionCodes: readonly string[]) {
  if (!catalog.length || !permissionCodes.length) return [];

  return filterPermissionGroupsToCodes(catalog, permissionCodes).map((group) => ({
    ...group,
    permissions: group.permissions.map((permission) => ({
      ...permission,
      enabled: true,
    })),
  }));
}

/** Sync permission accordion with the selected backend role's permission_codes. */
export function RolePermissionCodesBootstrap() {
  const { user, permissionCatalog, setPermissionGroups } = useAddUser();
  const lastAppliedRef = useRef<string | null>(null);

  useEffect(() => {
    const roleId = user.roleId;
    if (!roleId || permissionCatalog.length === 0) return;

    const applyKey = `${roleId}:${catalogKey(permissionCatalog)}`;
    if (lastAppliedRef.current === applyKey) return;

    let cancelled = false;

    void fetchRole(roleId)
      .then((role) => {
        if (cancelled) return;
        lastAppliedRef.current = applyKey;
        setPermissionGroups(roleScopedGroups(permissionCatalog, role.permission_codes ?? []));
      })
      .catch(() => {
        if (cancelled) return;
        lastAppliedRef.current = applyKey;
        setPermissionGroups([]);
      });

    return () => {
      cancelled = true;
    };
  }, [permissionCatalog, setPermissionGroups, user.roleId]);

  return null;
}

/** Create-role flow — filter permissions by the selected template's backend role. */
export function CreateRolePermissionCodesBootstrap() {
  const { selectedTemplateId, permissionCatalog, setPermissionGroups, flow } = useCreateRole();
  const lastAppliedRef = useRef<string | null>(null);

  useEffect(() => {
    if (flow === 'create-template') return;
    if (!selectedTemplateId || permissionCatalog.length === 0) return;

    const applyKey = `${selectedTemplateId}:${catalogKey(permissionCatalog)}`;
    if (lastAppliedRef.current === applyKey) return;

    let cancelled = false;

    void (async () => {
      try {
        const roles = await fetchRolesList();
        const liveCode = matchLiveRoleCode(selectedTemplateId, roles.items);
        const match = roles.items.find(
          (role) =>
            role.code === liveCode ||
            role.code === selectedTemplateId ||
            role.code.startsWith(`${selectedTemplateId}_`),
        );
        if (!match?.id) {
          if (!cancelled) {
            lastAppliedRef.current = applyKey;
            setPermissionGroups([]);
          }
          return;
        }

        const role = await fetchRole(match.id);
        if (cancelled) return;
        lastAppliedRef.current = applyKey;
        setPermissionGroups(roleScopedGroups(permissionCatalog, role.permission_codes ?? []));
      } catch {
        if (!cancelled) {
          lastAppliedRef.current = applyKey;
          setPermissionGroups([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [flow, permissionCatalog, selectedTemplateId, setPermissionGroups]);

  return null;
}
