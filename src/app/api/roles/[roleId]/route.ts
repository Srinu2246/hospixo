/**
 * BFF: Role by id
 * - GET    /api/roles/[roleId] → GET    /api/v1/roles/{role_id}
 * - PUT    /api/roles/[roleId] → PUT    /api/v1/roles/{role_id}
 * - DELETE /api/roles/[roleId] → DELETE /api/v1/roles/{role_id}
 *
 * Status updates live at /api/roles/[roleId]/status (PATCH).
 */

import { deleteRole, getRole, updateRole } from '@/lib/api/roles';
import type { UpdateRoleInput } from '@/types/roles';
import {
  jsonOk,
  requireAccessToken,
  requireManageRolesAccess,
  usersApiError,
} from '@/lib/users-api-route';

type RouteContext = { params: Promise<{ roleId: string }> };

/** GET /api/roles/[roleId] → GET /api/v1/roles/{id} */
export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAccessToken();
  if (auth.error) return auth.error;

  try {
    const { roleId } = await context.params;
    const data = await getRole(auth.token, roleId);
    return jsonOk(data);
  } catch (err) {
    return usersApiError(err, 'Unable to load role.');
  }
}

/** PUT /api/roles/[roleId] → PUT /api/v1/roles/{id} (role management only) */
export async function PUT(request: Request, context: RouteContext) {
  const auth = await requireManageRolesAccess();
  if (auth.error) return auth.error;

  try {
    const { roleId } = await context.params;
    const body = (await request.json()) as UpdateRoleInput;
    const data = await updateRole(auth.token, roleId, body);
    return jsonOk(data);
  } catch (err) {
    return usersApiError(err, 'Unable to update role.');
  }
}

/** DELETE /api/roles/[roleId] → DELETE /api/v1/roles/{id} (role management only) */
export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireManageRolesAccess();
  if (auth.error) return auth.error;

  try {
    const { roleId } = await context.params;
    const data = await deleteRole(auth.token, roleId);
    return jsonOk(data);
  } catch (err) {
    return usersApiError(err, 'Unable to delete role.');
  }
}
