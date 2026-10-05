import { listOrganizationCompanies } from '@/lib/api/companies';
import { getServerAuthSession } from '@/lib/auth/session';

export type DashboardScope = Readonly<{
  orgId: number | string | null;
  companyId: number | string | null;
}>;

export type DashboardScopeMode = 'organisation' | 'company';

function parseScopeId(val: string | string[] | undefined): number | string | null {
  if (!val) return null;
  const str = Array.isArray(val) ? val[0] : val;
  if (!str) return null;
  const num = Number(str);
  return Number.isFinite(num) && num > 0 ? num : str;
}

type ResolveDashboardScopeOptions = Readonly<{
  /** Organisation dashboards load all org branches; company dashboards require a company. */
  mode?: DashboardScopeMode;
}>;

async function resolveCompanyFromApi(
  orgId: number | string,
  token: string,
): Promise<number | string | null> {
  try {
    const companiesResult = await listOrganizationCompanies(token, orgId);
    if (companiesResult.items.length > 0 && companiesResult.items[0]?.id != null) {
      return companiesResult.items[0].id;
    }
  } catch {
    // Company cannot be resolved from companies API.
  }

  return null;
}

export async function resolveDashboardScope(
  searchParams?: Record<string, string | string[] | undefined> | URLSearchParams,
  options: ResolveDashboardScopeOptions = {},
): Promise<DashboardScope> {
  const mode = options.mode ?? 'company';
  const session = await getServerAuthSession();
  const params: Record<string, string | string[] | undefined> =
    searchParams instanceof URLSearchParams
      ? Object.fromEntries(searchParams.entries())
      : (searchParams ?? {});
  const searchOrgId = parseScopeId(params.org_id ?? params.organization_id);
  const searchCompanyId = parseScopeId(params.company_id);

  const orgId: number | string | null =
    searchOrgId ?? (session?.user.org_id && session.user.org_id > 0 ? session.user.org_id : null);

  let companyId: number | string | null =
    searchCompanyId ??
    (session?.user.company_id && session.user.company_id > 0 ? session.user.company_id : null);

  if (mode === 'company' && orgId && !companyId && session?.accessToken) {
    companyId = await resolveCompanyFromApi(orgId, session.accessToken);
  }

  return {
    orgId,
    companyId: mode === 'organisation' ? searchCompanyId : companyId,
  };
}
