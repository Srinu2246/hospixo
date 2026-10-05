/**
 * BFF: PATCH user status — ready; Edit Staff “Deactivate” UI not wired yet.
 */

import { updateUserStatus } from '@/lib/api/users';
import { jsonOk, requireAccessToken, usersApiError } from '@/lib/users-api-route';

type RouteContext = { params: Promise<{ userId: string }> };

/** PATCH /api/users/[userId]/status → PATCH /api/v1/users/{id}/status */
export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAccessToken();
  if (auth.error) return auth.error;

  try {
    const { userId } = await context.params;
    const body = await request.json();
    const data = await updateUserStatus(auth.token, userId, body);
    return jsonOk(data);
  } catch (err) {
    return usersApiError(err, 'Unable to update user status.');
  }
}
