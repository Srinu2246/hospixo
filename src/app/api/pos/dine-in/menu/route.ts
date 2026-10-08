import { loadDineInMenuData } from '@/features/pos/api/dine-in-menu.server';
import {
  floorOptionsFromSearchParams,
  jsonOk,
  posApiError,
  resolvePosBranchContext,
} from '@/lib/pos-api-route';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scope = await resolvePosBranchContext(
    floorOptionsFromSearchParams({
      outlet: searchParams.get('outlet'),
      branch_id: searchParams.get('branch_id'),
    }),
  );
  if (scope.error) return scope.error;

  try {
    const data = await loadDineInMenuData(
      floorOptionsFromSearchParams({
        outlet: searchParams.get('outlet'),
        branch_id: searchParams.get('branch_id'),
      }),
    );
    return jsonOk(data);
  } catch (error) {
    return posApiError(error, 'Unable to load dine-in menu.');
  }
}
