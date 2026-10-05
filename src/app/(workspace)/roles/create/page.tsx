import type { Metadata } from 'next';

import { TemplateGrid } from '@/features/user-roles/components/create-role/template-grid';
import { PermissionCatalogBootstrap } from '@/features/user-roles/components/shared/permission-catalog-bootstrap';
import { resolveAccessLevel } from '@/lib/auth/access-level';
import { getServerAuthSession } from '@/lib/auth/session';
import { loadRoleWizardCatalog } from '@/lib/roles-server';

export const metadata: Metadata = { title: 'Create Role' };

export default async function CreateRoleRoute() {
  const session = await getServerAuthSession();
  const level = session ? resolveAccessLevel(session.user) : 'organisation';
  const catalog = await loadRoleWizardCatalog(level);

  return (
    <>
      <PermissionCatalogBootstrap permissionCatalog={catalog.permissionGroups} />
      <TemplateGrid liveTemplates={catalog.templates} loadError={catalog.error} />
    </>
  );
}
