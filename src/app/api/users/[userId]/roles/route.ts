/**
 * BFF: assign / replace user roles — ready; Add/Edit Staff role picker not wired to these yet.
 */

import { assignUserRoles, replaceUserRoles } from '@/lib/api/users';
import { jsonOk, requireAccessToken, usersApiError } from '@/lib/users-api-route';

type RouteContext = { params: Promise<{ userId: string }> };

/** POST /api/users/[userId]/roles → POST /api/v1/users/{id}/roles */
export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAccessToken();
  if (auth.error) return auth.error;

  try {
    const { userId } = await context.params;
    const body = await request.json();
    const data = await assignUserRoles(auth.token, userId, body);
    return jsonOk(data);
  } catch (err) {
    return usersApiError(err, 'Unable to assign role.');
  }
}

/** PUT /api/users/[userId]/roles → PUT /api/v1/users/{id}/roles */
export async function PUT(request: Request, context: RouteContext) {
  const auth = await requireAccessToken();
  if (auth.error) return auth.error;

  try {
    const { userId } = await context.params;
    const body = await request.json();
    const data = await replaceUserRoles(auth.token, userId, body);
    return jsonOk(data);
  } catch (err) {
    return usersApiError(err, 'Unable to replace roles.');
  }
}
