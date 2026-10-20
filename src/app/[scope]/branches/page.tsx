import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { normalizeRoleKey } from '@/app/sidebar';
import { BranchesPage } from '@/features/organization/branches';
import { homePathForRole } from '@/lib/auth/session';
import { readShellSession } from '@/lib/auth/shell-session';
import { resolveScopedBranchList } from '@/lib/helpers';

interface ScopedBranchesRouteProps {
  params: Promise<{ scope: string }>;
}

export default async function ScopedBranchesRoute({ params }: Readonly<ScopedBranchesRouteProps>) {
  const { scope } = await params;
  const session = readShellSession(await cookies());
  const role = session?.role ?? '';
  const roleKey = normalizeRoleKey(role);
  const { listScope, companyId } = resolveScopedBranchList(scope, session);

  if (listScope === 'organization') {
    if (role && roleKey !== 'organization' && roleKey !== 'super_admin') {
      redirect(homePathForRole(role));
    }
  } else if (
    role &&
    roleKey !== 'company' &&
    roleKey !== 'organization' &&
    roleKey !== 'super_admin'
  ) {
    redirect(homePathForRole(role));
  }

  const organizationId = session?.account?.org_id ?? session?.context?.organizationId;

  return (
    <BranchesPage
      scope={listScope}
      organizationId={organizationId}
      companyId={listScope === 'company' ? companyId : undefined}
    />
  );
}
