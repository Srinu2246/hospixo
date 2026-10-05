/**
 * Server-side Users API client (packages/lib).
 * Called only from platform BFF routes — never from the browser.
 *
 * Integrated callers:
 * - listUsers  ← GET  /api/users
 * - createUser ← POST /api/users
 * - getUser    ← GET  /api/users/[userId]  (Edit Staff)
 */

import { apiFetch } from '@/lib/api/http';
import { getServerApiBaseUrl } from '@/lib/api/config';
import type {
  ApiUser,
  AssignUserRolesInput,
  CreateUserInput,
  ListUsersQuery,
  UpdateUserInput,
  UpdateUserStatusInput,
  UserRoleAssignment,
  UsersListApiPayload,
  UsersListResponse,
} from '@/types/users';

/** Backend Users paths — server-side only via apiFetch. */
export const usersPaths = {
  list: '/api/v1/users',
  byId: (userId: number | string) => `/api/v1/users/${userId}`,
  status: (userId: number | string) => `/api/v1/users/${userId}/status`,
  roles: (userId: number | string) => `/api/v1/users/${userId}/roles`,
  roleById: (userId: number | string, userRoleId: number | string) =>
    `/api/v1/users/${userId}/roles/${userRoleId}`,
} as const;

function withAuth(token: string) {
  return {
    baseUrl: getServerApiBaseUrl(),
    token,
  };
}

function toQueryString(query?: Record<string, unknown>): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function normalizeUsersList(
  data: UsersListResponse | UsersListApiPayload | readonly ApiUser[],
): UsersListResponse {
  if (Array.isArray(data)) {
    const items = data as readonly ApiUser[];
    return { items, total: items.length };
  }

  const payload = data as UsersListApiPayload &
    UsersListResponse & { results?: readonly ApiUser[] };
  const items = payload.items ?? payload.users ?? payload.results ?? [];
  return {
    items,
    total: payload.total ?? items.length,
    page: payload.page,
    page_size: payload.page_size,
  };
}

/** GET /api/v1/users */
export async function listUsers(token: string, query?: ListUsersQuery) {
  const data = await apiFetch<UsersListResponse | UsersListApiPayload | readonly ApiUser[]>(
    `${usersPaths.list}${toQueryString(query)}`,
    withAuth(token),
  );
  return normalizeUsersList(data);
}

/** POST /api/v1/users */
export async function createUser(token: string, body: CreateUserInput) {
  return apiFetch<ApiUser>(usersPaths.list, {
    ...withAuth(token),
    method: 'POST',
    body,
  });
}

/** GET /api/v1/users/{user_id} */
export async function getUser(token: string, userId: number | string) {
  return apiFetch<ApiUser>(usersPaths.byId(userId), withAuth(token));
}

/** PUT /api/v1/users/{user_id} */
export async function updateUser(token: string, userId: number | string, body: UpdateUserInput) {
  return apiFetch<ApiUser>(usersPaths.byId(userId), {
    ...withAuth(token),
    method: 'PUT',
    body,
  });
}

/** PATCH /api/v1/users/{user_id}/status */
export async function updateUserStatus(
  token: string,
  userId: number | string,
  body: UpdateUserStatusInput,
) {
  const status = body.status === 'disabled' ? 'inactive' : body.status;
  return apiFetch<ApiUser>(usersPaths.status(userId), {
    ...withAuth(token),
    method: 'PATCH',
    body: { status },
  });
}

/** POST /api/v1/users/{user_id}/roles */
export async function assignUserRoles(
  token: string,
  userId: number | string,
  body: AssignUserRolesInput,
) {
  return apiFetch<UserRoleAssignment | ApiUser>(usersPaths.roles(userId), {
    ...withAuth(token),
    method: 'POST',
    body,
  });
}

/** PUT /api/v1/users/{user_id}/roles */
export async function replaceUserRoles(
  token: string,
  userId: number | string,
  body: AssignUserRolesInput,
) {
  return apiFetch<UserRoleAssignment | ApiUser>(usersPaths.roles(userId), {
    ...withAuth(token),
    method: 'PUT',
    body,
  });
}

/** DELETE /api/v1/users/{user_id}/roles/{user_role_id} */
export async function removeUserRole(
  token: string,
  userId: number | string,
  userRoleId: number | string,
) {
  return apiFetch<{ message?: string } | null>(usersPaths.roleById(userId, userRoleId), {
    ...withAuth(token),
    method: 'DELETE',
  });
}
