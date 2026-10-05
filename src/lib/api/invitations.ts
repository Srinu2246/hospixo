/**
 * Server-side Invitations API client.
 * sendInvitation is used by Add User (invite on); other ops are BFF-ready.
 */

import { apiFetch } from '@/lib/api/http';
import { getServerApiBaseUrl } from '@/lib/api/config';
import type {
  AcceptInvitationInput,
  ApiInvitation,
  InvitationsListResponse,
  ListInvitationsQuery,
  RejectInvitationInput,
  SendInvitationInput,
} from '@/types/users';

export const invitationsPaths = {
  list: '/api/v1/invitations',
  accept: '/api/v1/invitations/accept',
  reject: '/api/v1/invitations/reject',
  byId: (invitationId: number | string) => `/api/v1/invitations/${invitationId}`,
  resend: (invitationId: number | string) => `/api/v1/invitations/${invitationId}/resend`,
  cancel: (invitationId: number | string) => `/api/v1/invitations/${invitationId}/cancel`,
} as const;

function withAuth(token?: string | null) {
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

function normalizeInvitationsList(
  data:
    | InvitationsListResponse
    | readonly ApiInvitation[]
    | {
        invitations?: readonly ApiInvitation[];
        items?: readonly ApiInvitation[];
        total?: number;
        page?: number;
        page_size?: number;
      },
): InvitationsListResponse {
  if (Array.isArray(data)) {
    const items = data as readonly ApiInvitation[];
    return { items, total: items.length };
  }

  const payload = data as {
    invitations?: readonly ApiInvitation[];
    items?: readonly ApiInvitation[];
    total?: number;
    page?: number;
    page_size?: number;
  };
  const items = payload.items ?? payload.invitations ?? [];
  return {
    items,
    total: payload.total ?? items.length,
    page: payload.page,
    page_size: payload.page_size,
  };
}

/** GET /api/v1/invitations */
export async function listInvitations(token: string, query?: ListInvitationsQuery) {
  const data = await apiFetch<InvitationsListResponse | readonly ApiInvitation[]>(
    `${invitationsPaths.list}${toQueryString(query)}`,
    withAuth(token),
  );
  return normalizeInvitationsList(data);
}

/** POST /api/v1/invitations */
export async function sendInvitation(token: string, body: SendInvitationInput) {
  return apiFetch<ApiInvitation>(invitationsPaths.list, {
    ...withAuth(token),
    method: 'POST',
    body,
  });
}

/** POST /api/v1/invitations/accept — may be token-based (Bearer optional). */
export async function acceptInvitation(body: AcceptInvitationInput, token?: string | null) {
  return apiFetch<ApiInvitation>(invitationsPaths.accept, {
    ...withAuth(token),
    method: 'POST',
    body,
  });
}

/** POST /api/v1/invitations/reject */
export async function rejectInvitation(body: RejectInvitationInput, token?: string | null) {
  return apiFetch<ApiInvitation>(invitationsPaths.reject, {
    ...withAuth(token),
    method: 'POST',
    body,
  });
}

/** GET /api/v1/invitations/{invitation_id} */
export async function getInvitation(token: string, invitationId: number | string) {
  return apiFetch<ApiInvitation>(invitationsPaths.byId(invitationId), withAuth(token));
}

/** POST /api/v1/invitations/{invitation_id}/resend */
export async function resendInvitation(token: string, invitationId: number | string) {
  return apiFetch<ApiInvitation>(invitationsPaths.resend(invitationId), {
    ...withAuth(token),
    method: 'POST',
  });
}

/** POST /api/v1/invitations/{invitation_id}/cancel */
export async function cancelInvitation(token: string, invitationId: number | string) {
  return apiFetch<ApiInvitation>(invitationsPaths.cancel(invitationId), {
    ...withAuth(token),
    method: 'POST',
  });
}
