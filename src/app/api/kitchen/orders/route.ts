import { loadKitchenOrdersData } from '@/features/kitchen/api/kitchen-orders.server';
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
    const data = await loadKitchenOrdersData(options);
    return jsonOk(data);
  } catch (error) {
    return posApiError(error, 'Unable to load kitchen orders.');
  }
}
