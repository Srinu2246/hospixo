import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { normalizeRoleKey } from '@/app/sidebar';
import { CompaniesPage } from '@/features/organization/companies';
import { loadOrganizationCompanies } from '@/lib/helpers/organizationCompanies';
import { homePathForRole } from '@/lib/auth/session';
import { readShellSession } from '@/lib/auth/shell-session';
import type { CompanyListItem } from '@/lib/schemas/organization/companies/companyListSchema';
import { serverApi } from '@/services/api/serverClient';

export default async function OrganizationCompaniesRoute() {
  const session = readShellSession(cookies());
  const role = session?.role ?? '';
  const roleKey = normalizeRoleKey(role);

  if (role && roleKey !== 'organization' && roleKey !== 'super_admin') {
    redirect(homePathForRole(role));
  }

  const organizationId = session?.account?.org_id ?? session?.context.organizationId;
  const initialCompanies = await readCompanies(organizationId);

  return <CompaniesPage initialCompanies={initialCompanies} organizationId={organizationId} />;
}

async function readCompanies(
  organizationId: number | undefined,
): Promise<CompanyListItem[] | undefined> {
  try {
    return await loadOrganizationCompanies(organizationId, (path, params) =>
      serverApi.get(path, params),
    );
  } catch {
    return undefined;
  }
}
