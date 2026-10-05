/**
 * BFF: Invitations
 * - GET  /api/invitations → GET  /api/v1/invitations
 * - POST /api/invitations → POST /api/v1/invitations
 *   (Add User review when "Send invitation" is on — integrated)
 *
 * POST uses withCallerScope for company_id / branch_id from the session.
 */

import { listInvitations, sendInvitation } from '@/lib/api/invitations';
import { resolveOrgRoleCode } from '@/lib/resolve-org-role';
import type { InvitationStatus, ListInvitationsQuery, SendInvitationInput } from '@/types/users';
import { jsonOk, requireAccessToken, usersApiError, withCallerScope } from '@/lib/users-api-route';

function parseListQuery(url: URL): ListInvitationsQuery {
  const page = url.searchParams.get('page');
  const pageSize = url.searchParams.get('page_size');

  return {
    status: (url.searchParams.get('status') as InvitationStatus | null) ?? undefined,
    page: page ? Number(page) : undefined,
    page_size: pageSize ? Number(pageSize) : undefined,
  };
}

/** GET /api/invitations → GET /api/v1/invitations */
export async function GET(request: Request) {
  const auth = await requireAccessToken();
  if (auth.error) return auth.error;

  try {
    const data = await listInvitations(auth.token, parseListQuery(new URL(request.url)));
    return jsonOk(data);
  } catch (err) {
    return usersApiError(err, 'Unable to load invitations.');
  }
}

/** POST /api/invitations → POST /api/v1/invitations */
export async function POST(request: Request) {
  const auth = await requireAccessToken();
  if (auth.error) return auth.error;

  try {
    const body = (await request.json()) as SendInvitationInput;
    const scoped = await withCallerScope(body as unknown as Record<string, unknown>);
    const role_code = await resolveOrgRoleCode(
      auth.token,
      String(scoped.role_code ?? body.role_code),
    );
    const data = await sendInvitation(auth.token, {
      ...(scoped as unknown as SendInvitationInput),
      role_code,
    });
    return jsonOk(data, { status: 201 });
  } catch (err) {
    return usersApiError(err, 'Unable to send invitation.');
  }
}
