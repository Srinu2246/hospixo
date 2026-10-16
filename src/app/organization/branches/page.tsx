import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { normalizeRoleKey } from '@/app/sidebar';
import { BranchesPage } from '@/features/organization/branches';
import { loadBranchDirectory } from '@/lib/helpers/organizationBranches';
import { homePathForRole } from '@/lib/auth/session';
import { readShellSession } from '@/lib/auth/shell-session';
import type { BranchListItem } from '@/lib/schemas/organization/branches/branchListSchema';
import { serverApi } from '@/services/api/serverClient';

export default async function OrganizationBranchesRoute() {
  const session = readShellSession(await cookies());
  const role = session?.role ?? '';
  const roleKey = normalizeRoleKey(role);

  if (role && roleKey !== 'organization' && roleKey !== 'super_admin') {
    redirect(homePathForRole(role));
  }

  const organizationId = session?.account?.org_id ?? session?.context.organizationId;
  const authScope = session?.account?.scope ?? '';
  const initialBranches = await readBranches(organizationId, role, authScope);

  return (
    <BranchesPage
      scope="organization"
      initialBranches={initialBranches}
      organizationId={organizationId}
    />
  );
}

async function readBranches(
  organizationId: number | undefined,
  role: string,
  authScope: string,
): Promise<BranchListItem[] | undefined> {
  try {
    return await loadBranchDirectory(
      organizationId,
      undefined,
      (path, params) => serverApi.get(path, params),
      { role, authScope, scope: 'organization' },
    );
  } catch {
    return undefined;
  }
}
