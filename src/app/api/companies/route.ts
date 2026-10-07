import { NextResponse } from 'next/server';

import { listOrganizationBranches } from '@/lib/api/branches';
import { listOrganizationCompanies } from '@/lib/api/companies';
import { ApiRequestError } from '@/lib/api/errors';
import { getServerAuthSession } from '@/lib/auth/session';

/** BFF: companies list for organisation dashboards and topbar picker. */
export async function GET(request: Request) {
  const session = await getServerAuthSession();
  if (!session?.accessToken) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const orgParam = searchParams.get('org_id');
  const orgId = orgParam || (session.user.org_id ? String(session.user.org_id) : null);

  if (!orgId) {
    return NextResponse.json(
      { success: false, message: 'Organization ID is required' },
      { status: 400 },
    );
  }

  try {
    const data = await listOrganizationCompanies(session.accessToken, orgId);

    let enrichedItems = data.items;
    try {
      const branchesResult = await listOrganizationBranches(
        session.accessToken,
        orgId,
        data.items.map((c) => ({ id: c.id, name: c.name })),
      );

      const branchCountMap = new Map<string, number>();
      for (const branch of branchesResult.items) {
        const cid = String(branch.company_id);
        branchCountMap.set(cid, (branchCountMap.get(cid) ?? 0) + 1);
      }

      enrichedItems = data.items.map((company) => ({
        ...company,
        branch_count: branchCountMap.get(String(company.id)) ?? company.branch_count ?? 0,
      }));
    } catch {
      // Fallback to un-enriched if branches fetch fails
    }

    return NextResponse.json({
      success: true,
      data: {
        items: enrichedItems,
        total: enrichedItems.length,
      },
    });
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof ApiRequestError && (error.status === 404 || error.status === 403)) {
      return NextResponse.json({ success: true, data: { items: [], total: 0 } });
    }

    const message = error instanceof Error ? error.message : 'Unable to load companies.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
