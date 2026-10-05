import { CreateCustomTemplatePage } from '@/features/user-roles/components/create-template/create-custom-template-page';
import { PermissionCatalogBootstrap } from '@/features/user-roles/components/shared/permission-catalog-bootstrap';
import { resolveAccessLevel } from '@/lib/auth/access-level';
import { getServerAuthSession } from '@/lib/auth/session';
import { loadRoleWizardCatalog } from '@/lib/roles-server';

export async function CreateCustomTemplateRouteView() {
  const session = await getServerAuthSession();
  const level = session ? resolveAccessLevel(session.user) : 'organisation';
  const catalog = await loadRoleWizardCatalog(level);

  return (
    <>
      <PermissionCatalogBootstrap
        permissionCatalog={catalog.permissionGroups}
        mode="full-catalog"
      />
      <CreateCustomTemplatePage roleTemplates={catalog.templates} loadError={catalog.error} />
    </>
  );
}
