import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { normalizeRoleKey } from '@/app/sidebar';
import { CompaniesPage } from '@/features/organization/companies';
import { homePathForRole } from '@/lib/auth/session';
import { readShellSession } from '@/lib/auth/shell-session';
import { loadOrganizationCompanies } from '@/lib/helpers/organizationCompanies';
import type { CompanyListItem } from '@/lib/schemas/organization/companies/companyListSchema';
import { serverApi } from '@/services/api/serverClient';

interface ScopedCompaniesRouteProps {
  params: Promise<{ scope: string }>;
}

export default async function ScopedCompaniesRoute({
  params,
}: Readonly<ScopedCompaniesRouteProps>) {
  await params;
  const session = readShellSession(await cookies());
  const role = session?.role ?? '';
  const roleKey = normalizeRoleKey(role);
  const authScope = session?.account?.scope ?? '';
  const isPlatformScope = authScope.trim().toLowerCase() === 'platform';

  if (
    role &&
    roleKey !== 'organization' &&
    roleKey !== 'super_admin' &&
    roleKey !== 'platform_support' &&
    !isPlatformScope
  ) {
    redirect(homePathForRole(role));
  }

  const organizationId = session?.account?.org_id ?? session?.context?.organizationId;
  const initialCompanies = await readCompanies(organizationId, role, authScope);

  return <CompaniesPage initialCompanies={initialCompanies} organizationId={organizationId} />;
}

async function readCompanies(
  organizationId: number | undefined,
  role: string,
  authScope: string,
): Promise<CompanyListItem[] | undefined> {
  try {
    return await loadOrganizationCompanies(
      organizationId,
      (path, params) => serverApi.get(path, params),
      { role, authScope, scope: 'organization' },
    );
  } catch {
    return undefined;
  }
}
