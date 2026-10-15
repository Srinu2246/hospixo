import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { normalizeRoleKey } from '@/app/sidebar';
import { BranchesPage } from '@/features/organization/branches';
import { loadBranchDirectory } from '@/lib/helpers/organizationBranches';
import { homePathForRole } from '@/lib/auth/session';
import { readShellSession } from '@/lib/auth/shell-session';
import type { BranchListItem } from '@/lib/schemas/organization/branches/branchListSchema';
import { serverApi } from '@/services/api/serverClient';

interface CompanyAllBranchesRouteProps {
  searchParams: { company_id?: string };
}

export default async function CompanyAllBranchesRoute({
  searchParams,
}: Readonly<CompanyAllBranchesRouteProps>) {
  const session = readShellSession(cookies());
  const role = session?.role ?? '';
  const roleKey = normalizeRoleKey(role);

  if (role && roleKey !== 'company' && roleKey !== 'organization' && roleKey !== 'super_admin') {
    redirect(homePathForRole(role));
  }

  const organizationId = session?.account?.org_id ?? session?.context.organizationId;
  const queryCompanyId = Number(searchParams.company_id);
  const companyId =
    Number.isFinite(queryCompanyId) && queryCompanyId > 0
      ? queryCompanyId
      : (session?.account?.company_id ?? session?.context.companyId);
  // Organisation users drill in from the sidebar company; that id lives in the client store.
  const authScope = session?.account?.scope ?? '';
  const initialBranches =
    companyId != null ? await readBranches(organizationId, companyId, role, authScope) : undefined;

  return (
    <BranchesPage
      scope="company"
      initialBranches={initialBranches}
      organizationId={organizationId}
      companyId={companyId}
    />
  );
}

async function readBranches(
  organizationId: number | undefined,
  companyId: number,
  role: string,
  authScope: string,
): Promise<BranchListItem[] | undefined> {
  try {
    return await loadBranchDirectory(
      organizationId,
      companyId,
      (path, params) => serverApi.get(path, params),
      { role, authScope, scope: 'company' },
    );
  } catch {
    return undefined;
  }
}
