import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { normalizeRoleKey } from '@/app/sidebar';
import { BranchesPage } from '@/features/organization/branches';
import { homePathForRole } from '@/lib/auth/session';
import { readShellSession } from '@/lib/auth/shell-session';

export default async function OrganizationBranchesRoute() {
  const session = readShellSession(await cookies());
  const role = session?.role ?? '';
  const roleKey = normalizeRoleKey(role);

  if (role && roleKey !== 'organization' && roleKey !== 'super_admin') {
    redirect(homePathForRole(role));
  }

  const organizationId = session?.account?.org_id ?? session?.context.organizationId;

  return <BranchesPage scope="organization" organizationId={organizationId} />;
}
