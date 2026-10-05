/**
 * BFF: User by id
 * - GET /api/users/[userId] → GET /api/v1/users/{user_id}  (Edit Staff — integrated)
 * - PUT /api/users/[userId] → PUT /api/v1/users/{user_id}  (update helper ready; UI save not wired yet)
 */

import { getUser, updateUser } from '@/lib/api/users';
import { jsonOk, requireAccessToken, usersApiError } from '@/lib/users-api-route';

type RouteContext = { params: Promise<{ userId: string }> };

/** GET /api/users/[userId] → GET /api/v1/users/{id} */
export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAccessToken();
  if (auth.error) return auth.error;

  try {
    const { userId } = await context.params;
    const data = await getUser(auth.token, userId);
    return jsonOk(data);
  } catch (err) {
    return usersApiError(err, 'Unable to load user.');
  }
}

/** PUT /api/users/[userId] → PUT /api/v1/users/{id} */
export async function PUT(request: Request, context: RouteContext) {
  const auth = await requireAccessToken();
  if (auth.error) return auth.error;

  try {
    const { userId } = await context.params;
    const body = await request.json();
    const data = await updateUser(auth.token, userId, body);
    return jsonOk(data);
  } catch (err) {
    return usersApiError(err, 'Unable to update user.');
  }
}
