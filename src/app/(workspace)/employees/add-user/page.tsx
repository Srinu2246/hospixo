import type { Metadata } from 'next';

import { AddUserTemplateStep } from '@/features/user-roles/components/add-user/step-template';
import { PermissionCatalogBootstrap } from '@/features/user-roles/components/shared/permission-catalog-bootstrap';
import { resolveAccessLevel } from '@/lib/auth/access-level';
import { getServerAuthSession } from '@/lib/auth/session';
import { loadRoleWizardCatalog } from '@/lib/roles-server';

export const metadata: Metadata = { title: 'Add User — Select Template' };

export default async function AddUserTemplateRoute() {
  const session = await getServerAuthSession();
  const level = session ? resolveAccessLevel(session.user) : 'organisation';
  const catalog = await loadRoleWizardCatalog(level);

  return (
    <>
      <PermissionCatalogBootstrap permissionCatalog={catalog.permissionGroups} />
      <AddUserTemplateStep liveTemplates={catalog.templates} loadError={catalog.error} />
    </>
  );
}
