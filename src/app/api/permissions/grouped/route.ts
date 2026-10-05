/**
 * BFF: Grouped permissions
 * - GET /api/permissions/grouped → GET /api/v1/permissions/grouped
 */

import { getGroupedPermissions } from '@/lib/api/permissions';
import { jsonOk, requireAccessToken, usersApiError } from '@/lib/users-api-route';

export async function GET() {
  const auth = await requireAccessToken();
  if (auth.error) return auth.error;

  try {
    const data = await getGroupedPermissions(auth.token);
    return jsonOk(data);
  } catch (err) {
    return usersApiError(err, 'Unable to load permissions.');
  }
}
