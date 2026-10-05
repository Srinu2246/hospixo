import { NextResponse } from 'next/server';

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
    return NextResponse.json({ success: true, data });
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
