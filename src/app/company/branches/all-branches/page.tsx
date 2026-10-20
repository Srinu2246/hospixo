import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { normalizeRoleKey } from '@/app/sidebar';
import { BranchesPage } from '@/features/organization/branches';
import { homePathForRole } from '@/lib/auth/session';
import { readShellSession } from '@/lib/auth/shell-session';

interface CompanyAllBranchesRouteProps {
  searchParams: { company_id?: string };
}

export default async function CompanyAllBranchesRoute({
  searchParams,
}: Readonly<CompanyAllBranchesRouteProps>) {
  const session = readShellSession(await cookies());
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

  return <BranchesPage scope="company" organizationId={organizationId} companyId={companyId} />;
}
