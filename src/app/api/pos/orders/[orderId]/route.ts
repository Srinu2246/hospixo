import { patchBranchOrder } from '@/lib/api/restaurant-branch-pos';
import {
  floorOptionsFromSearchParams,
  jsonOk,
  posApiError,
  resolvePosBranchContext,
} from '@/lib/pos-api-route';

type RouteContext = Readonly<{ params: Promise<{ orderId: string }> }>;

export async function PATCH(request: Request, context: RouteContext) {
  const { orderId } = await context.params;
  const { searchParams } = new URL(request.url);
  const options = floorOptionsFromSearchParams({
    outlet: searchParams.get('outlet'),
    branch_id: searchParams.get('branch_id'),
  });
  const scope = await resolvePosBranchContext(options);
  if (scope.error) return scope.error;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    await patchBranchOrder(scope.token, scope.branchId, orderId, body);
    return jsonOk({ orderId });
  } catch (error) {
    return posApiError(error, 'Unable to update order.');
  }
}
