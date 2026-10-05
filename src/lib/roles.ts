/**
 * Browser → platform BFF helpers for Roles API.
 * Never call BACKEND_API_URL / `/api/v1/*` from the client.
 *
 * Backend v1 paths live in `packages/lib/src/api/roles.ts` (`rolesPaths`).
 * This file only talks to the Next BFF:
 * - fetchRolesList ← GET /api/roles
 * - fetchRole      ← GET /api/roles/[roleId]
 * - createRoleRequest ← POST /api/roles
 * - updateRoleRequest ← PUT /api/roles/[roleId]
 * - deleteRoleRequest ← DELETE /api/roles/[roleId]
 * - patchRoleStatusRequest ← PATCH /api/roles/[roleId]/status
 * - fetchPermissions ← GET /api/permissions/grouped
 */

import type {
  ApiRoleDetail,
  CreateRoleInput,
  RolesListResponse,
  RolesTemplatesResponse,
  UpdateRoleInput,
  PatchRoleInput,
  GroupedPermissionsResponse,
} from '@/types/roles';

/** Platform BFF paths (browser → Next). Not backend `/api/v1/*`. */
export const rolesBffPaths = {
  list: '/api/roles',
  byId: (roleId: number | string) => `/api/roles/${roleId}`,
  templates: '/api/roles/templates',
  status: (roleId: number | string) => `/api/roles/${roleId}/status`,
  grouped: '/api/permissions/grouped',
} as const;

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

async function readJson<T>(res: Response): Promise<T> {
  const payload = (await res.json().catch(() => null)) as
    ApiEnvelope<T> | { message?: string } | null;

  if (!res.ok) {
    const message =
      payload && typeof payload === 'object' && 'message' in payload && payload.message
        ? String(payload.message)
        : `Request failed (${res.status})`;
    throw new Error(message);
  }

  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return (payload as ApiEnvelope<T>).data;
  }

  return payload as T;
}

let rolesListPromise: Promise<RolesListResponse> | null = null;
let cachedRolesList: RolesListResponse | null = null;

let roleTemplatesPromise: Promise<RolesTemplatesResponse> | null = null;
let cachedRoleTemplates: RolesTemplatesResponse | null = null;

let permissionsPromise: Promise<GroupedPermissionsResponse> | null = null;
let cachedPermissions: GroupedPermissionsResponse | null = null;

export function clearRolesListCache(): void {
  rolesListPromise = null;
  cachedRolesList = null;
}

export function clearRoleTemplatesCache(): void {
  roleTemplatesPromise = null;
  cachedRoleTemplates = null;
}

export function clearGroupedPermissionsCache(): void {
  permissionsPromise = null;
  cachedPermissions = null;
}

/** GET /api/roles → list system + org custom roles (cached + deduplicated). */
export async function fetchRolesList(init?: {
  signal?: AbortSignal;
  forceRefresh?: boolean;
}): Promise<RolesListResponse> {
  if (!init?.forceRefresh && cachedRolesList !== null) {
    return cachedRolesList;
  }

  if (!init?.forceRefresh && rolesListPromise !== null) {
    return rolesListPromise;
  }

  rolesListPromise = (async () => {
    try {
      const res = await fetch(rolesBffPaths.list, {
        credentials: 'same-origin',
        cache: 'no-store',
        signal: init?.signal,
      });
      const data = await readJson<RolesListResponse>(res);
      cachedRolesList = data;
      return data;
    } finally {
      rolesListPromise = null;
    }
  })();

  return rolesListPromise;
}

/** GET /api/roles/[roleId] → role detail (incl. permission_codes). */
export async function fetchRole(
  roleId: number | string,
  init?: { signal?: AbortSignal },
): Promise<ApiRoleDetail> {
  const res = await fetch(rolesBffPaths.byId(roleId), {
    credentials: 'same-origin',
    cache: 'no-store',
    signal: init?.signal,
  });
  return readJson<ApiRoleDetail>(res);
}

/** GET /api/roles/templates → list of role templates (cached + deduplicated). */
export async function fetchRoleTemplates(init?: {
  signal?: AbortSignal;
  forceRefresh?: boolean;
}): Promise<RolesTemplatesResponse> {
  if (!init?.forceRefresh && cachedRoleTemplates !== null) {
    return cachedRoleTemplates;
  }

  if (!init?.forceRefresh && roleTemplatesPromise !== null) {
    return roleTemplatesPromise;
  }

  roleTemplatesPromise = (async () => {
    try {
      const res = await fetch(rolesBffPaths.templates, {
        credentials: 'same-origin',
        cache: 'no-store',
        signal: init?.signal,
      });
      const data = await readJson<RolesTemplatesResponse>(res);
      cachedRoleTemplates = data;
      return data;
    } finally {
      roleTemplatesPromise = null;
    }
  })();

  return roleTemplatesPromise;
}

/** POST /api/roles → create custom role. */
export async function createRoleRequest(body: CreateRoleInput): Promise<ApiRoleDetail> {
  const res = await fetch(rolesBffPaths.list, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const created = await readJson<ApiRoleDetail>(res);
  clearRolesListCache();
  return created;
}

/** PUT /api/roles/[roleId] → update custom role. */
export async function updateRoleRequest(
  roleId: number | string,
  body: UpdateRoleInput,
): Promise<ApiRoleDetail> {
  const res = await fetch(rolesBffPaths.byId(roleId), {
    method: 'PUT',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const updated = await readJson<ApiRoleDetail>(res);
  clearRolesListCache();
  return updated;
}

/** DELETE /api/roles/[roleId] → delete custom role. */
export async function deleteRoleRequest(roleId: number | string): Promise<ApiRoleDetail> {
  const res = await fetch(rolesBffPaths.byId(roleId), {
    method: 'DELETE',
    credentials: 'same-origin',
  });
  const deleted = await readJson<ApiRoleDetail>(res);
  clearRolesListCache();
  return deleted;
}

/** PATCH /api/roles/[roleId] → partial update. */
export async function patchRoleStatusRequest(
  roleId: number | string,
  body: PatchRoleInput,
): Promise<ApiRoleDetail> {
  const res = await fetch(rolesBffPaths.status(roleId), {
    method: 'PATCH',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const patched = await readJson<ApiRoleDetail>(res);
  clearRolesListCache();
  return patched;
}

/** GET /api/permissions/grouped → list of permission groups (cached + deduplicated). */
export async function fetchGroupedPermissions(init?: {
  signal?: AbortSignal;
  forceRefresh?: boolean;
}): Promise<GroupedPermissionsResponse> {
  if (!init?.forceRefresh && cachedPermissions !== null) {
    return cachedPermissions;
  }

  if (!init?.forceRefresh && permissionsPromise !== null) {
    return permissionsPromise;
  }

  permissionsPromise = (async () => {
    try {
      const res = await fetch(rolesBffPaths.grouped, {
        credentials: 'same-origin',
        cache: 'no-store',
        signal: init?.signal,
      });
      const data = await readJson<GroupedPermissionsResponse>(res);
      cachedPermissions = data;
      return data;
    } finally {
      permissionsPromise = null;
    }
  })();

  return permissionsPromise;
}
