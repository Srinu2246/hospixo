import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';

import { routes } from '@/config/routes';
import { buildCompanyDashboardOverview } from '@/features/dashboard/api/build-company-dashboard-overview';
import {
  loadLiveBranchesWithDiagnostics,
  loadLiveCompaniesWithDiagnostics,
  type BranchLoadResult,
} from '@/features/dashboard/api/organisation-dashboard.server';
import { companyDashboardFallbackData } from '@/features/dashboard/config/company';
import { resolveDashboardScope } from '@/features/dashboard/lib/resolve-dashboard-scope';
import {
  dashboardLoadCopy,
  summarizeUserFacingLoadErrors,
} from '@/features/dashboard/lib/user-facing-load-error';
import type { DashboardBootstrap } from '@/features/dashboard/types/dashboard-bootstrap';

function summarizeLoadErrors(errors: readonly string[]): string | null {
  return summarizeUserFacingLoadErrors(errors);
}

async function resolveCompanyScope(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<{
  orgId: number | string;
  companyId: number | string;
  scopeErrors: string[];
}> {
  const scope = await resolveDashboardScope(searchParams, { mode: 'company' });
  const scopeErrors: string[] = [];

  if (!scope.orgId) {
    scopeErrors.push(dashboardLoadCopy.missingOrganization);
    return { orgId: 0, companyId: 0, scopeErrors };
  }

  if (scope.companyId) {
    return { orgId: scope.orgId, companyId: scope.companyId, scopeErrors };
  }

  const companiesResult = await loadLiveCompaniesWithDiagnostics(scope.orgId);
  scopeErrors.push(...companiesResult.errors);

  const firstCompany = companiesResult.companies[0];
  if (firstCompany?.id) {
    return {
      orgId: scope.orgId,
      companyId: firstCompany.id,
      scopeErrors,
    };
  }

  if (scopeErrors.length === 0) {
    scopeErrors.push(dashboardLoadCopy.noCompanyResolved);
  }
  return { orgId: scope.orgId, companyId: 0, scopeErrors };
}

const loadCompanyBranchesCached = cache(
  async (orgId: string, companyId: string): Promise<BranchLoadResult> =>
    loadLiveBranchesWithDiagnostics({
      orgId,
      companyId,
      scope: 'company',
    }),
);

function searchParamsCacheKey(
  searchParams: Record<string, string | string[] | undefined> = {},
): string {
  const outlet = Array.isArray(searchParams.outlet)
    ? searchParams.outlet[0]
    : (searchParams.outlet ?? 'all');
  const companyId = Array.isArray(searchParams.company_id)
    ? searchParams.company_id[0]
    : searchParams.company_id;
  const orgId = Array.isArray(searchParams.org_id) ? searchParams.org_id[0] : searchParams.org_id;

  return JSON.stringify({
    outlet: outlet ?? 'all',
    companyId: companyId ?? null,
    orgId: orgId ?? null,
  });
}

const getCompanyDashboardCached = cache(async (paramsKey: string): Promise<DashboardBootstrap> => {
  const parsed = JSON.parse(paramsKey) as {
    outlet: string;
    companyId: string | null;
    orgId: string | null;
  };

  const searchParams: Record<string, string | undefined> = {
    outlet: parsed.outlet,
  };
  if (parsed.companyId) searchParams.company_id = parsed.companyId;
  if (parsed.orgId) searchParams.org_id = parsed.orgId;

  const { orgId, companyId, scopeErrors } = await resolveCompanyScope(searchParams);

  if (!orgId || !companyId) {
    return {
      data: companyDashboardFallbackData,
      source: 'fallback',
      loadError: summarizeLoadErrors(scopeErrors),
    };
  }

  try {
    const { branches, errors } = await loadCompanyBranchesCached(String(orgId), String(companyId));

    const outletId = parsed.outlet ?? 'all';

    const data =
      branches.length > 0
        ? buildCompanyDashboardOverview(branches, outletId)
        : companyDashboardFallbackData;

    const allErrors = [...scopeErrors, ...errors];

    return {
      data,
      source: branches.length > 0 ? 'backend' : 'fallback',
      loadError: branches.length > 0 ? null : summarizeLoadErrors(allErrors),
    };
  } catch {
    return {
      data: companyDashboardFallbackData,
      source: 'fallback',
      loadError: dashboardLoadCopy.unableToLoadDashboard,
    };
  }
});

export async function getCompanyDashboard(
  searchParams: Record<string, string | string[] | undefined> = {},
): Promise<DashboardBootstrap> {
  return getCompanyDashboardCached(searchParamsCacheKey(searchParams));
}

/** Redirect org-level users to a concrete company when /company has no ?company_id=. */
export async function ensureCompanyDashboardScope(
  searchParams: Record<string, string | string[] | undefined> = {},
): Promise<void> {
  const explicitCompanyId = searchParams.company_id;
  if (explicitCompanyId) return;

  const scope = await resolveDashboardScope(searchParams, { mode: 'company' });
  if (scope.companyId) {
    redirect(
      `${routes.dashboard.company}?company_id=${encodeURIComponent(String(scope.companyId))}`,
    );
  }

  if (scope.orgId) {
    const companiesResult = await loadLiveCompaniesWithDiagnostics(scope.orgId);
    const firstCompany = companiesResult.companies[0];
    if (firstCompany?.id) {
      redirect(
        `${routes.dashboard.company}?company_id=${encodeURIComponent(String(firstCompany.id))}`,
      );
    }
  }
}
