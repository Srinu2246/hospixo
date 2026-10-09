import { loadOpenOrdersData } from '@/features/pos/api/branch-orders.server';
import {
  floorOptionsFromSearchParams,
  jsonOk,
  posApiError,
  resolvePosBranchContext,
} from '@/lib/pos-api-route';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const options = floorOptionsFromSearchParams({
    outlet: searchParams.get('outlet'),
    branch_id: searchParams.get('branch_id'),
  });
  const scope = await resolvePosBranchContext(options);
  if (scope.error) return scope.error;

  try {
    const data = await loadOpenOrdersData(options);
    return jsonOk(data);
  } catch (error) {
    return posApiError(error, 'Unable to load orders.');
  }
}
