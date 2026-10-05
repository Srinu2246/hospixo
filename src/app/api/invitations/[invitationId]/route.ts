import { getInvitation } from '@/lib/api/invitations';
import { jsonOk, requireAccessToken, usersApiError } from '@/lib/users-api-route';

type RouteContext = { params: Promise<{ invitationId: string }> };

/** GET /api/invitations/[invitationId] */
export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAccessToken();
  if (auth.error) return auth.error;

  try {
    const { invitationId } = await context.params;
    const data = await getInvitation(auth.token, invitationId);
    return jsonOk(data);
  } catch (err) {
    return usersApiError(err, 'Unable to load invitation.');
  }
}
