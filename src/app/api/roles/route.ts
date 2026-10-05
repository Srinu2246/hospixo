/**
 * BFF: Roles collection
 * - GET  /api/roles → GET  /api/v1/roles
 * - POST /api/roles → POST /api/v1/roles
 */

import { createRole, listRoles } from '@/lib/api/roles';
import type { CreateRoleInput } from '@/types/roles';
import {
  jsonOk,
  requireAccessToken,
  requireManageRolesAccess,
  usersApiError,
} from '@/lib/users-api-route';

/** GET /api/roles → GET /api/v1/roles */
export async function GET() {
  const auth = await requireAccessToken();
  if (auth.error) return auth.error;

  try {
    const data = await listRoles(auth.token);
    return jsonOk(data);
  } catch (err) {
    return usersApiError(err, 'Unable to load roles.');
  }
}

/** POST /api/roles → POST /api/v1/roles (role management only) */
export async function POST(request: Request) {
  const auth = await requireManageRolesAccess();
  if (auth.error) return auth.error;

  try {
    const body = (await request.json()) as CreateRoleInput;
    const data = await createRole(auth.token, body);
    return jsonOk(data, { status: 201 });
  } catch (err) {
    return usersApiError(err, 'Unable to create role.');
  }
}
