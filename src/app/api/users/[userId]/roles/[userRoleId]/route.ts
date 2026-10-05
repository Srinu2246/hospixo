import { removeUserRole } from '@/lib/api/users';
import { jsonOk, requireAccessToken, usersApiError } from '@/lib/users-api-route';

type RouteContext = { params: Promise<{ userId: string; userRoleId: string }> };

/** DELETE /api/users/[userId]/roles/[userRoleId] */
export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAccessToken();
  if (auth.error) return auth.error;

  try {
    const { userId, userRoleId } = await context.params;
    const data = await removeUserRole(auth.token, userId, userRoleId);
    return jsonOk(data ?? { ok: true });
  } catch (err) {
    return usersApiError(err, 'Unable to remove role.');
  }
}
