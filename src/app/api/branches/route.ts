import { NextResponse } from 'next/server';

import { loadLiveBranchesWithDiagnostics } from '@/features/dashboard/api/organisation-dashboard.server';
import { resolveDashboardScope } from '@/features/dashboard/lib/resolve-dashboard-scope';
import { listCompanyBranches } from '@/lib/api/branches';
import { ApiRequestError } from '@/lib/api/errors';
import { getServerAuthSession } from '@/lib/auth/session';

/** BFF: branches for dashboard outlet picker and org-wide lists. */
export async function GET(request: Request) {
  const session = await getServerAuthSession();
  if (!session?.accessToken) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const url = request?.url ? new URL(request.url) : null;
  const orgParam = url?.searchParams.get('org_id') ?? null;
  const companyParam = url?.searchParams.get('company_id') ?? null;

  const hasCompanyScope =
    Boolean(companyParam) ||
    Boolean(!orgParam && session.user.company_id && session.user.company_id > 0);

  const scope = await resolveDashboardScope(
    {
      org_id: orgParam ?? undefined,
      company_id: companyParam ?? undefined,
    },
    { mode: hasCompanyScope ? 'company' : 'organisation' },
  );

  if (!scope.orgId) {
    return NextResponse.json({ success: true, data: { items: [], total: 0 } });
  }

  try {
    if (scope.companyId) {
      const data = await listCompanyBranches(
        session.accessToken,
        String(scope.orgId),
        String(scope.companyId),
      );
      return NextResponse.json({ success: true, data });
    }

    const { branches, errors } = await loadLiveBranchesWithDiagnostics({
      orgId: scope.orgId,
      scope: 'organisation',
    });

    if (branches.length === 0 && errors.length > 0) {
      return NextResponse.json(
        { success: false, message: errors.join(' '), data: { items: [], total: 0 } },
        { status: 500 },
      );
    }

    const items = branches.map((branch) => ({
      id: Number(branch.id) || branch.id,
      name: branch.name,
      company_id: Number(branch.companyId) || branch.companyId,
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
