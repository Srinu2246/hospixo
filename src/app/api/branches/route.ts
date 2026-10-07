import { NextResponse } from 'next/server';

import {
  loadLiveBranchesWithDiagnostics,
  loadLiveCompaniesWithDiagnostics,
} from '@/features/dashboard/api/organisation-dashboard.server';
import { resolveDashboardScope } from '@/features/dashboard/lib/resolve-dashboard-scope';
import { listCompanyBranches } from '@/lib/api/branches';
import { ApiRequestError } from '@/lib/api/errors';
import { getServerAuthSession } from '@/lib/auth/session';
import type { ApiBranch } from '@/types/branches';

/** BFF: branches for dashboard outlet picker and org-wide lists. */
export async function GET(request: Request) {
  const session = await getServerAuthSession();
  if (!session?.accessToken) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const url = request?.url ? new URL(request.url) : null;
  const orgParam = url?.searchParams.get('org_id') ?? null;
  const companyParam = url?.searchParams.get('company_id') ?? null;
  const scopeParam = url?.searchParams.get('scope') ?? null;

  const isExplicitCompanyScope =
    Boolean(companyParam) ||
    (scopeParam === 'company' && Boolean(session.user.company_id && session.user.company_id > 0));

  const targetCompanyId =
    companyParam ??
    (isExplicitCompanyScope && session.user.company_id
      ? String(session.user.company_id)
      : undefined);

  const scope = await resolveDashboardScope(
    {
      org_id: orgParam ?? undefined,
      company_id: targetCompanyId,
    },
    { mode: isExplicitCompanyScope ? 'company' : 'organisation' },
  );

  if (!scope.orgId) {
    return NextResponse.json({ success: true, data: { items: [], total: 0 } });
  }

  try {
    if (isExplicitCompanyScope && scope.companyId) {
      const [branchesResult, companiesResult] = await Promise.all([
        listCompanyBranches(session.accessToken, String(scope.orgId), String(scope.companyId)),
        loadLiveCompaniesWithDiagnostics(scope.orgId),
      ]);

      const companyMap = new Map(companiesResult.companies.map((c) => [String(c.id), c.name]));
      const currentCompanyName = companyMap.get(String(scope.companyId)) ?? null;

      const items = branchesResult.items.map((branch: ApiBranch) => ({
        id: Number(branch.id) || branch.id,
        name: branch.name,
        company_id: Number(branch.company_id) || Number(scope.companyId),
        company_name: currentCompanyName,
        status: branch.status,
        city: branch.city,
        code: branch.code,
      }));

      return NextResponse.json({
        success: true,
        data: { items, total: items.length },
      });
    }

    const { branches, companies, errors } = await loadLiveBranchesWithDiagnostics({
      orgId: scope.orgId,
      scope: 'organisation',
    });

    if (branches.length === 0 && errors.length > 0) {
      return NextResponse.json(
        { success: false, message: errors.join(' '), data: { items: [], total: 0 } },
        { status: 500 },
      );
    }

    const companyMap = new Map(companies.map((c) => [String(c.id), c.name]));

    const items = branches.map((branch) => ({
      id: Number(branch.id) || branch.id,
      name: branch.name,
      company_id: Number(branch.companyId) || branch.companyId,
      company_name: companyMap.get(String(branch.companyId)) ?? null,
      status: branch.status,
      city: branch.city,
      code: branch.code,
    }));

    return NextResponse.json({
      success: true,
      data: { items, total: items.length },
    });
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : 'Unable to load branches.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
