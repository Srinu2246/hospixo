import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { normalizeRoleKey } from '@/app/sidebar';
import { BranchesPage } from '@/features/organization/branches';
import { homePathForRole } from '@/lib/auth/session';
import { readShellSession } from '@/lib/auth/shell-session';
import { loadBranchDirectory } from '@/lib/helpers/organizationBranches';
import { resolveScopedBranchList } from '@/lib/helpers';
import type { BranchListItem } from '@/lib/schemas/organization/branches/branchListSchema';
import { serverApi } from '@/services/api/serverClient';

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
  const authScope = session?.account?.scope ?? '';
  const initialBranches = await readBranches(
    organizationId,
    listScope === 'company' ? companyId : undefined,
    role,
    authScope,
    listScope,
  );

  return (
    <BranchesPage
      scope={listScope}
      initialBranches={initialBranches}
      organizationId={organizationId}
      companyId={listScope === 'company' ? companyId : undefined}
    />
  );
}

async function readBranches(
  organizationId: number | undefined,
  companyId: number | undefined,
  role: string,
  authScope: string,
  listScope: 'organization' | 'company',
): Promise<BranchListItem[] | undefined> {
  try {
    return await loadBranchDirectory(
      organizationId,
      companyId,
      (path, params) => serverApi.get(path, params),
      { role, authScope, scope: listScope },
    );
  } catch {
    return undefined;
  }
}
