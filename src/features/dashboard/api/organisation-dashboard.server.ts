import 'server-only';

import { cache } from 'react';

import { routes } from '@/config/routes';
import { parseOrganisationDashboardQuery } from '@/features/dashboard/api/organisation-dashboard';
import { buildOrganisationDashboardFallback } from '@/features/dashboard/config/organisation/dashboard';
import { companyDashboardFallbackData } from '@/features/dashboard/config/company';
import {
  buildCompanyChartSeries,
  resolveOrganisationDateRangeLabel,
} from '@/features/dashboard/lib/organisation-dashboard-format';
import { resolveDashboardScope } from '@/features/dashboard/lib/resolve-dashboard-scope';
import {
  dashboardLoadCopy,
  summarizeUserFacingLoadErrors,
} from '@/features/dashboard/lib/user-facing-load-error';
import type { DashboardBootstrap } from '@/features/dashboard/types/dashboard-bootstrap';
import type {
  OrganisationCompanyPerformanceRow,
  OrganisationCompanyStatus,
  OrganisationDashboardOverview,
} from '@/features/dashboard/types/organisation-dashboard';
import { getServerAuthSession } from '@/lib/auth/session';
import { listCompanyBranches, listOrganizationBranches } from '@/lib/api/branches';
import { listOrganizationCompanies } from '@/lib/api/companies';
import { ApiRequestError } from '@/lib/api/errors';
import { logger } from '@/lib/logger';
import type { ApiBranch } from '@/types/branches';

export type LiveBranch = Readonly<{
  id: string;
  name: string;
  companyId: string;
  status: 'active' | 'inactive';
  city?: string | null;
  code?: string | null;
}>;

export type LiveCompany = Readonly<{
  id: string;
  name: string;
  status: string;
  organizationId?: string | null;
}>;

export type BranchLoadResult = Readonly<{
  branches: LiveBranch[];
  companies: LiveCompany[];
  errors: string[];
}>;

function resolveBranchStatus(status: string | null | undefined): 'active' | 'inactive' {
  const raw = String(status ?? 'active')
    .toLowerCase()
    .trim();
  if (
    raw === 'inactive' ||
    raw === 'disabled' ||
    raw === 'suspended' ||
    raw === 'closed' ||
    raw === 'archived'
  ) {
    return 'inactive';
  }

  return 'active';
}

function mapApiBranchToLive(branch: ApiBranch): LiveBranch {
  return {
    id: String(branch.id),
    name: branch.name,
    companyId: String(branch.company_id),
    status: resolveBranchStatus(branch.status),
    city: branch.city,
    code: branch.code,
  };
}

function mapApiCompanyToLive(company: {
  id: string | number;
  name: string;
  status?: string | null;
  organization_id: string | number;
}): LiveCompany {
  return {
    id: String(company.id),
    name: company.name,
    status: String(company.status ?? 'active'),
    organizationId: String(company.organization_id),
  };
}

function formatApiError(error: unknown, label: string, fallback: string): string {
  if (error instanceof ApiRequestError) {
    logger.api.warn(label, { status: error.status, message: error.message });
    return fallback;
  }

  if (error instanceof Error) {
    logger.api.warn(label, { message: error.message });
    return fallback;
  }

  logger.api.warn(label, { error });
  return fallback;
}

type LoadLiveBranchesOptions = Readonly<{
  orgId?: number | string | null;
  companyId?: number | string | null;
  companies?: readonly LiveCompany[];
  scope?: 'organisation' | 'company';
}>;

export async function loadLiveCompanies(orgId?: number | string | null): Promise<LiveCompany[]> {
  const result = await loadLiveCompaniesWithDiagnostics(orgId);
  return result.companies;
}

export async function loadLiveCompaniesWithDiagnostics(
  orgId?: number | string | null,
): Promise<BranchLoadResult> {
  const session = await getServerAuthSession();
  const errors: string[] = [];

  if (!session?.accessToken) {
    return {
      branches: [],
      companies: [],
      errors: [dashboardLoadCopy.signInRequired],
    };
  }

  const effectiveOrgId =
    orgId != null && orgId !== 0 && orgId !== ''
      ? String(orgId)
      : session.user.org_id > 0
        ? String(session.user.org_id)
        : null;

  if (!effectiveOrgId) {
    return {
      branches: [],
      companies: [],
      errors: [dashboardLoadCopy.missingOrganization],
    };
  }

  try {
    const response = await listOrganizationCompanies(session.accessToken, effectiveOrgId);
    const companies = response.items.map(mapApiCompanyToLive);
    if (companies.length === 0) {
      logger.api.warn('dashboard companies empty', { orgId: effectiveOrgId });
      errors.push(dashboardLoadCopy.noCompanies);
    }
    return { branches: [], companies, errors };
  } catch (error) {
    errors.push(
      formatApiError(
        error,
        'dashboard companies request failed',
        dashboardLoadCopy.unableToLoadCompanies,
      ),
    );
    return { branches: [], companies: [], errors };
  }
}

export async function loadLiveBranches(
  options: LoadLiveBranchesOptions = {},
): Promise<LiveBranch[]> {
  const result = await loadLiveBranchesWithDiagnostics(options);
  return result.branches;
}

export async function loadLiveBranchesWithDiagnostics(
  options: LoadLiveBranchesOptions = {},
): Promise<BranchLoadResult> {
  const session = await getServerAuthSession();
  const errors: string[] = [];

  if (!session?.accessToken) {
    return {
      branches: [],
      companies: [],
      errors: [dashboardLoadCopy.signInRequired],
    };
  }

  const orgId =
    options.orgId != null && options.orgId !== 0 && options.orgId !== ''
      ? String(options.orgId)
      : session.user.org_id > 0
        ? String(session.user.org_id)
        : null;

  if (!orgId) {
    return {
      branches: [],
      companies: [],
      errors: [dashboardLoadCopy.missingOrganization],
    };
  }

  const explicitCompanyId =
    options.scope === 'company' &&
    options.companyId != null &&
    options.companyId !== 0 &&
    options.companyId !== ''
      ? String(options.companyId)
      : null;

  try {
    if (explicitCompanyId) {
      const response = await listCompanyBranches(session.accessToken, orgId, explicitCompanyId);
      const branches = response.items.map(mapApiBranchToLive);

      if (branches.length === 0) {
        logger.api.warn('dashboard company branches empty', {
          orgId,
          companyId: explicitCompanyId,
        });
        errors.push(dashboardLoadCopy.noBranches);
      }

      return { branches, companies: [], errors };
    }

    const companiesResult =
      options.companies && options.companies.length > 0
        ? { companies: [...options.companies], errors: [] as string[] }
        : await loadLiveCompaniesWithDiagnostics(orgId);

    errors.push(...companiesResult.errors);
    const companies = companiesResult.companies;

    const response = await listOrganizationBranches(
      session.accessToken,
      orgId,
      companies.map((company) => ({ id: company.id, name: company.name })),
    );
    const branches = response.items.map(mapApiBranchToLive);

    if (branches.length === 0) {
      logger.api.warn('dashboard organization branches empty', {
        orgId,
        companyCount: companies.length,
      });
      errors.push(
        companies.length === 0 ? dashboardLoadCopy.noCompanies : dashboardLoadCopy.noBranches,
      );
    }

    return { branches, companies, errors };
  } catch (error) {
    errors.push(
      formatApiError(
        error,
        'dashboard branches request failed',
        dashboardLoadCopy.unableToLoadBranches,
      ),
    );
    return { branches: [], companies: [], errors };
  }
}

function countBranchesForCompany(branches: readonly LiveBranch[], companyId: string) {
  return branches.filter((branch) => branch.companyId === companyId).length;
}

export function enrichOrganisationDashboardWithLiveBranches(
  base: OrganisationDashboardOverview,
  companies: readonly LiveCompany[],
  branches: readonly LiveBranch[],
): OrganisationDashboardOverview {
  const performanceRows: OrganisationCompanyPerformanceRow[] = companies.map((company) => {
    const branchCount = countBranchesForCompany(branches, company.id);
    const existing = base.allPerformanceRows.find((row) => row.id === company.id);
    const normalizedStatus = company.status.toLowerCase();
    const status: OrganisationCompanyStatus =
      normalizedStatus === 'inactive' || normalizedStatus === 'suspended'
        ? 'inactive'
        : normalizedStatus === 'warning'
          ? 'warning'
          : 'active';

    return {
      id: company.id,
      companyName: company.name,
      branches: branchCount,
      revenue: existing?.revenue ?? 0,
      orders: existing?.orders ?? 0,
      expenses: existing?.expenses ?? 0,
      profit: existing?.profit ?? 0,
      status,
      href: `${routes.dashboard.company}?company_id=${encodeURIComponent(company.id)}`,
    };
  });

  const page = base.performancePage ?? 1;
  const pageSize = base.performancePageSize ?? 6;
  const start = (page - 1) * pageSize;

  const topBranches = branches.slice(0, 5).map((branch, index) => {
    const company = companies.find((item) => item.id === branch.companyId);
    return {
      id: branch.id,
      rank: index + 1,
      branchName: branch.name,
      companyName: company?.name ?? 'Company',
      revenue: 0,
      growthPercent: 0,
    };
  });

  const kpis = base.kpis.map((kpi) => {
    if (kpi.id === 'companies') {
      return {
        ...kpi,
        value: String(companies.length),
        helperText: 'Active',
      };
    }

    if (kpi.id === 'branches') {
      return {
        ...kpi,
        value: String(branches.length),
        helperText: 'Total',
      };
    }

    return kpi;
  });

  const usage = base.subscription.usage.map((item) => {
    if (item.id === 'companies') {
      return { ...item, used: companies.length };
    }
    if (item.id === 'branches') {
      return { ...item, used: branches.length };
    }
    return item;
  });

  return {
    ...base,
    kpis,
    allPerformanceRows: performanceRows,
    performanceRows: performanceRows.slice(start, start + pageSize),
    performanceTotal: performanceRows.length,
    companySeries: buildCompanyChartSeries(
      performanceRows,
      base.performanceMetric ?? 'total-sales',
    ),
    topBranches: topBranches.length > 0 ? topBranches : [],
    subscription: {
      ...base.subscription,
      usage,
    },
  };
}

function summarizeLoadErrors(errors: readonly string[]): string | null {
  return summarizeUserFacingLoadErrors(errors);
}

export const getOrganisationDashboard = cache(
  async (
    searchParams: Record<string, string | string[] | undefined> = {},
  ): Promise<{
    data: OrganisationDashboardOverview;
    source: 'fallback' | 'backend';
    loadError?: string | null;
  }> => {
    const query = parseOrganisationDashboardQuery(searchParams);
    const fallback = buildOrganisationDashboardFallback(query);
    const range = query.range ?? 'last-7-days';
    const customRange =
      range === 'custom' && query.from && query.to ? { from: query.from, to: query.to } : undefined;
    const dateRangeLabel = resolveOrganisationDateRangeLabel(range, customRange);

    try {
      const scope = await resolveDashboardScope(searchParams, { mode: 'organisation' });

      if (!scope.orgId) {
        return {
          data: { ...fallback, dateRangeLabel },
          source: 'fallback',
          loadError: dashboardLoadCopy.missingOrganization,
        };
      }

      const companiesResult = await loadLiveCompaniesWithDiagnostics(scope.orgId);
      const branchFilterCompanyId = searchParams?.company_id
        ? Array.isArray(searchParams.company_id)
          ? searchParams.company_id[0]
          : searchParams.company_id
        : undefined;

      const branchesResult = await loadLiveBranchesWithDiagnostics({
        orgId: scope.orgId,
        companyId: branchFilterCompanyId,
        companies: companiesResult.companies,
        scope: branchFilterCompanyId ? 'company' : 'organisation',
      });

      const companies = companiesResult.companies;
      const branches = branchesResult.branches;
      const errors = [...companiesResult.errors, ...branchesResult.errors];

      const hasLiveData = companies.length > 0 || branches.length > 0;
      const data = enrichOrganisationDashboardWithLiveBranches(
        { ...fallback, dateRangeLabel },
        companies,
        branches,
      );

      return {
        data,
        source: hasLiveData ? 'backend' : 'fallback',
        loadError: hasLiveData ? null : summarizeLoadErrors(errors),
      };
    } catch {
      return {
        data: { ...fallback, dateRangeLabel },
        source: 'fallback',
        loadError: dashboardLoadCopy.unableToLoadDashboard,
      };
    }
  },
);

/** SSR bootstrap for workspace topbar (company picker + outlets). */
export const loadDashboardShellData = cache(async (): Promise<DashboardBootstrap> => {
  const session = await getServerAuthSession();

  if (!session) {
    return {
      data: companyDashboardFallbackData,
      source: 'fallback',
      loadError: dashboardLoadCopy.signInRequired,
    };
  }

  const scope = await resolveDashboardScope({}, { mode: 'organisation' });

  if (!scope.orgId) {
    return {
      data: companyDashboardFallbackData,
      source: 'fallback',
      loadError: dashboardLoadCopy.missingOrganization,
    };
  }

  try {
    const companiesResult = await loadLiveCompaniesWithDiagnostics(scope.orgId);

    return {
      data: companyDashboardFallbackData,
      companies: companiesResult.companies.map((company) => ({
        id: company.id,
        name: company.name,
      })),
      source: companiesResult.companies.length > 0 ? 'backend' : 'fallback',
      loadError:
        companiesResult.companies.length > 0
          ? null
          : summarizeUserFacingLoadErrors(companiesResult.errors),
    };
  } catch {
    return {
      data: companyDashboardFallbackData,
      source: 'fallback',
      loadError: dashboardLoadCopy.unableToLoadCompanies,
    };
  }
});
