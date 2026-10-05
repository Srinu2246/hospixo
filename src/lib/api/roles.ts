/**
 * Server-side Roles API client (packages/lib).
 * Called only from platform BFF routes / SSR loaders — never from the browser.
 *
 * Integrated:
 * - listRoles  ← GET  /api/v1/roles
 * - getRole    ← GET  /api/v1/roles/{role_id}
 * - createRole ← POST /api/v1/roles
 * - updateRole ← PUT  /api/v1/roles/{role_id}
 */

import { apiFetch } from '@/lib/api/http';
import { getServerApiBaseUrl } from '@/lib/api/config';
import type {
  ApiRole,
  ApiRoleDetail,
  CreateRoleInput,
  RolesListApiPayload,
  RolesListResponse,
  RolesTemplatesResponse,
  UpdateRoleInput,
  DeleteRoleInput,
  PatchRoleInput,
} from '@/types/roles';

/** Backend Roles paths — server-side only via apiFetch. */
export const rolesPaths = {
  list: '/api/v1/roles',
  byId: (roleId: number | string) => `/api/v1/roles/${roleId}`,
  status: (roleId: number | string) => `/api/v1/roles/${roleId}/status`,
  templates: '/api/v1/roles/templates',
} as const;

function withAuth(token: string) {
  return {
    baseUrl: getServerApiBaseUrl(),
    token,
  };
}

function normalizeRolesList(
  data: RolesListResponse | RolesListApiPayload | readonly ApiRole[],
): RolesListResponse {
  if (Array.isArray(data)) {
    const items = data as readonly ApiRole[];
    return { items, total: items.length };
  }

  const payload = data as RolesListApiPayload & RolesListResponse;
  const items = payload.items ?? payload.roles ?? [];
  return {
    items,
    total: payload.total ?? items.length,
  };
}

/** GET /api/v1/roles — active system roles + org custom roles. */
export async function listRoles(token: string) {
  const data = await apiFetch<RolesListResponse | RolesListApiPayload | readonly ApiRole[]>(
    rolesPaths.list,
    withAuth(token),
  );
  return normalizeRolesList(data);
}

/** GET /api/v1/roles/{role_id} — detail including permission_codes. */
export async function getRole(token: string, roleId: number | string) {
  return apiFetch<ApiRoleDetail>(rolesPaths.byId(roleId), withAuth(token));
}

/** GET /api/v1/roles/templates — list of role templates. */
export async function getRoleTemplates(token: string) {
  return apiFetch<RolesTemplatesResponse>(rolesPaths.templates, withAuth(token));
}

/** POST /api/v1/roles — create org custom role. */
export async function createRole(token: string, body: CreateRoleInput) {
  return apiFetch<ApiRoleDetail>(rolesPaths.list, {
    ...withAuth(token),
    method: 'POST',
    body,
  });
}

/** PUT /api/v1/roles/{role_id} — update org custom role. */
export async function updateRole(token: string, roleId: number | string, body: UpdateRoleInput) {
  return apiFetch<ApiRoleDetail>(rolesPaths.byId(roleId), {
    ...withAuth(token),
    method: 'PUT',
    body,
  });
}

/** DELETE /api/v1/roles/{role_id} — delete org custom role. */
export async function deleteRole(token: string, roleId: number | string) {
  return apiFetch<ApiRoleDetail>(rolesPaths.byId(roleId), {
    ...withAuth(token),
    method: 'DELETE',
  });
}

/** PATCH /api/v1/roles/{role_id}/status — update role status. */
export async function patchRoleStatus(
  token: string,
  roleId: number | string,
  body: PatchRoleInput,
) {
  return apiFetch<ApiRoleDetail>(rolesPaths.status(roleId), {
    ...withAuth(token),
    method: 'PATCH',
    body,
  });
}
