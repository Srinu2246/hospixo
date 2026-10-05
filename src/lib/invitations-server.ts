/**
 * Server-only invitations data loaders.
 * Call from RSC / Server Actions with the httpOnly session cookie — never from the browser.
 */

import { getInvitation, listInvitations } from '@/lib/api/invitations';
import { getServerToken } from '@/server/auth';
import type { ApiInvitation, InvitationStatus, ListInvitationsQuery } from '@/types/users';

export const INVITATIONS_PAGE_SIZE = 50;

export type InvitationsListPageData = Readonly<{
  items: readonly ApiInvitation[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  status?: InvitationStatus;
  error: string | null;
}>;

export type InvitationDetailPageData = Readonly<{
  invitation: ApiInvitation | null;
  error: string | null;
}>;

function parsePositiveInt(value: string | undefined, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : fallback;
}

export function parseInvitationsListSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): ListInvitationsQuery {
  const rawPage = searchParams.page;
  const pageValue = Array.isArray(rawPage) ? rawPage[0] : rawPage;
  const rawStatus = searchParams.status;
  const statusValue = Array.isArray(rawStatus) ? rawStatus[0] : rawStatus;

  return {
    page: parsePositiveInt(pageValue, 1),
    page_size: INVITATIONS_PAGE_SIZE,
    status: (statusValue as InvitationStatus | undefined) || undefined,
  };
}

/** Load paginated invitations for /users-roles/invitations. */
export async function loadInvitationsListPageData(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<InvitationsListPageData> {
  const query = parseInvitationsListSearchParams(searchParams);
  const token = await getServerToken();

  if (!token) {
    return {
      items: [],
      total: 0,
      page: query.page ?? 1,
      pageSize: INVITATIONS_PAGE_SIZE,
      totalPages: 1,
      status: query.status,
      error: 'Sign in required.',
    };
  }

  try {
    const list = await listInvitations(token, query);
    const total = list.total;
    const page = list.page ?? query.page ?? 1;
    const pageSize = list.page_size ?? INVITATIONS_PAGE_SIZE;

    return {
      items: list.items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      status: query.status,
      error: null,
    };
  } catch (err) {
    return {
      items: [],
      total: 0,
      page: query.page ?? 1,
      pageSize: INVITATIONS_PAGE_SIZE,
      totalPages: 1,
      status: query.status,
      error: err instanceof Error ? err.message : 'Unable to load invitations.',
    };
  }
}

/** Load a single invitation for detail. */
export async function loadInvitationDetailPageData(
  invitationId: string,
): Promise<InvitationDetailPageData> {
  const token = await getServerToken();
  if (!token) {
    return { invitation: null, error: 'Sign in required.' };
  }

  try {
    const invitation = await getInvitation(token, invitationId);
    return { invitation, error: null };
  } catch (err) {
    return {
      invitation: null,
      error: err instanceof Error ? err.message : 'Unable to load invitation.',
    };
  }
}
