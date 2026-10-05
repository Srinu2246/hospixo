import type { Metadata } from 'next';

import { PermissionsAccordion } from '@/features/user-roles/components/create-role/permissions-accordion';
import { PermissionCatalogBootstrap } from '@/features/user-roles/components/shared/permission-catalog-bootstrap';
import { CreateRolePermissionCodesBootstrap } from '@/features/user-roles/components/shared/role-permission-codes-bootstrap';
import { resolveAccessLevel } from '@/lib/auth/access-level';
import { getServerAuthSession } from '@/lib/auth/session';
import { loadRoleWizardCatalog } from '@/lib/roles-server';

export const metadata: Metadata = { title: 'Create Role — Permissions' };

export default async function CreateRolePermissionsRoute() {
  const session = await getServerAuthSession();
  const level = session ? resolveAccessLevel(session.user) : 'organisation';
  const catalog = await loadRoleWizardCatalog(level);

  return (
    <>
      <PermissionCatalogBootstrap permissionCatalog={catalog.permissionGroups} />
      <CreateRolePermissionCodesBootstrap />
      <PermissionsAccordion loadError={catalog.error} />
    </>
  );
}
