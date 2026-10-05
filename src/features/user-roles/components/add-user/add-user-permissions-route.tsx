import { AddUserPermissionsStep } from '@/features/user-roles/components/add-user/step-permissions';
import { PermissionCatalogBootstrap } from '@/features/user-roles/components/shared/permission-catalog-bootstrap';
import { RolePermissionCodesBootstrap } from '@/features/user-roles/components/shared/role-permission-codes-bootstrap';
import { resolveAccessLevel } from '@/lib/auth/access-level';
import { getServerAuthSession } from '@/lib/auth/session';
import { loadRoleWizardCatalog } from '@/lib/roles-server';

export async function AddUserPermissionsRouteView() {
  const session = await getServerAuthSession();
  const level = session ? resolveAccessLevel(session.user) : 'organisation';
  const catalog = await loadRoleWizardCatalog(level);

  return (
    <>
      <PermissionCatalogBootstrap permissionCatalog={catalog.permissionGroups} />
      <RolePermissionCodesBootstrap />
      <AddUserPermissionsStep loadError={catalog.error} />
    </>
  );
}
