import { patchBranchOrder } from '@/lib/api/restaurant-branch-pos';
import {
  floorOptionsFromSearchParams,
  jsonOk,
  posApiError,
  resolvePosBranchContext,
} from '@/lib/pos-api-route';

type RouteContext = Readonly<{ params: Promise<{ paymentId: string }> }>;

export async function POST(request: Request, context: RouteContext) {
  const { paymentId } = await context.params;
  const { searchParams } = new URL(request.url);
  const options = floorOptionsFromSearchParams({
    outlet: searchParams.get('outlet'),
    branch_id: searchParams.get('branch_id'),
  });
  const scope = await resolvePosBranchContext(options);
  if (scope.error) return scope.error;

  try {
    await patchBranchOrder(scope.token, scope.branchId, paymentId, {
      payment_status: 'paid',
    });
    return jsonOk({ paymentId, status: 'paid' });
  } catch (error) {
    return posApiError(error, 'Unable to settle due payment.');
  }
}
