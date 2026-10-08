import { NextResponse } from 'next/server';

import { loadPosTablesData } from '@/features/pos/api/pos-tables.server';
import { parseBranchRouteSearchParams } from '@/lib/api/branch-tenancy';
import { jsonOk } from '@/lib/api/route-response';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const branchId = parseBranchRouteSearchParams({
    outlet: searchParams.get('outlet') ?? undefined,
    branch_id: searchParams.get('branch_id') ?? undefined,
  });

  try {
    const data = await loadPosTablesData(
      branchId != null ? { activeBranchId: branchId, preferredBranchId: branchId } : {},
    );
    return jsonOk(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load POS tables.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
