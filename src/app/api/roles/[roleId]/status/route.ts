/**
 * BFF: Role status
 * - PATCH /api/roles/[roleId]/status → PATCH /api/v1/roles/{role_id}/status
 */

import { patchRoleStatus } from '@/lib/api/roles';
import type { PatchRoleInput } from '@/types/roles';
import { jsonOk, requireManageRolesAccess, usersApiError } from '@/lib/users-api-route';

type RouteContext = { params: Promise<{ roleId: string }> };

/** PATCH /api/roles/[roleId]/status → PATCH /api/v1/roles/{id}/status (role management only) */
export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireManageRolesAccess();
  if (auth.error) return auth.error;

  try {
    const { roleId } = await context.params;
    const body = (await request.json()) as PatchRoleInput;
    const data = await patchRoleStatus(auth.token, roleId, body);
    return jsonOk(data);
  } catch (err) {
    return usersApiError(err, 'Unable to update role status.');
  }
}
