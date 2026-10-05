/**
 * BFF: Role templates
 */

import { getRoleTemplates } from '@/lib/api/roles';
import { jsonOk, requireAccessToken, usersApiError } from '@/lib/users-api-route';

export async function GET() {
  const auth = await requireAccessToken();
  if (auth.error) return auth.error;

  try {
    const data = await getRoleTemplates(auth.token);
    return jsonOk(data);
  } catch (err) {
    return usersApiError(err, 'Unable to load role templates.');
  }
}
