/**
 * Browser → platform BFF helpers for Users & Roles.
 * Never call BACKEND_API_URL from the client.
 *
 * Wired in UI:
 * - fetchUsersList      → Users list page
 * - createUserRequest   → Add User review (invite off + password)
 * - sendInvitationRequest → Add User review (invite on)
 * - fetchUser           → Edit Staff page (GET by id)
 *
 * BFF helpers also exist for update/status/roles/invitations CRUD
 * (ready for UI; not all screens call them yet).
 */

import type {
  AcceptInvitationInput,
  ApiInvitation,
  ApiUser,
  AssignUserRolesInput,
  CreateUserInput,
  ListInvitationsQuery,
  ListUsersQuery,
  RejectInvitationInput,
  SendInvitationInput,
  UpdateUserInput,
  UpdateUserStatusInput,
  InvitationsListResponse,
  UsersListResponse,
} from '@/types/users';

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

function qs(query?: Record<string, unknown>): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, String(value));
  }
  const s = params.toString();
  return s ? `?${s}` : '';
}

/** GET /api/users → list (Users & Roles table). */
export async function fetchUsersList(query?: ListUsersQuery): Promise<UsersListResponse> {
  const res = await fetch(`/api/users${qs(query)}`, {
    credentials: 'same-origin',
    cache: 'no-store',
  });
  return readJson<UsersListResponse>(res);
}

/** POST /api/users → create account (password + role_code). */
export async function createUserRequest(body: CreateUserInput): Promise<ApiUser> {
  const res = await fetch('/api/users', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return readJson<ApiUser>(res);
}

/** GET /api/users/:id → user detail for Edit Staff. */
export async function fetchUser(userId: number | string): Promise<ApiUser> {
  const res = await fetch(`/api/users/${userId}`, {
    credentials: 'same-origin',
    cache: 'no-store',
  });
  return readJson<ApiUser>(res);
}

export async function updateUserRequest(
  userId: number | string,
  body: UpdateUserInput,
): Promise<ApiUser> {
  const res = await fetch(`/api/users/${userId}`, {
    method: 'PUT',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return readJson<ApiUser>(res);
}

export async function updateUserStatusRequest(
  userId: number | string,
  body: UpdateUserStatusInput,
): Promise<ApiUser> {
  const res = await fetch(`/api/users/${userId}/status`, {
    method: 'PATCH',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return readJson<ApiUser>(res);
}

export async function assignUserRolesRequest(userId: number | string, body: AssignUserRolesInput) {
  const res = await fetch(`/api/users/${userId}/roles`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return readJson(res);
}

export async function replaceUserRolesRequest(userId: number | string, body: AssignUserRolesInput) {
  const res = await fetch(`/api/users/${userId}/roles`, {
    method: 'PUT',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return readJson(res);
}

export async function removeUserRoleRequest(userId: number | string, userRoleId: number | string) {
  const res = await fetch(`/api/users/${userId}/roles/${userRoleId}`, {
    method: 'DELETE',
    credentials: 'same-origin',
  });
  return readJson(res);
}

export async function fetchInvitationsList(
  query?: ListInvitationsQuery,
): Promise<InvitationsListResponse> {
  const res = await fetch(`/api/invitations${qs(query)}`, {
    credentials: 'same-origin',
    cache: 'no-store',
  });
  return readJson<InvitationsListResponse>(res);
}

/** GET /api/invitations/[invitationId] → invitation detail for Edit Invitation. */
export async function fetchInvitation(invitationId: number | string): Promise<ApiInvitation> {
  const res = await fetch(`/api/invitations/${invitationId}`, {
    credentials: 'same-origin',
    cache: 'no-store',
  });
  return readJson<ApiInvitation>(res);
}
/** POST /api/invitations → invite-only create (no password). */
export async function sendInvitationRequest(body: SendInvitationInput): Promise<ApiInvitation> {
  const res = await fetch('/api/invitations', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return readJson<ApiInvitation>(res);
}

export async function acceptInvitationRequest(body: AcceptInvitationInput) {
  const res = await fetch('/api/invitations/accept', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return readJson(res);
}

export async function rejectInvitationRequest(body: RejectInvitationInput) {
  const res = await fetch('/api/invitations/reject', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return readJson(res);
}

export async function resendInvitationRequest(invitationId: number | string) {
  const res = await fetch(`/api/invitations/${invitationId}/resend`, {
    method: 'POST',
    credentials: 'same-origin',
  });
  return readJson(res);
}

export async function cancelInvitationRequest(invitationId: number | string) {
  const res = await fetch(`/api/invitations/${invitationId}/cancel`, {
    method: 'POST',
    credentials: 'same-origin',
  });
  return readJson(res);
}
