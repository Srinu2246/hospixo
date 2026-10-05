import { resendInvitation } from '@/lib/api/invitations';
import { jsonOk, requireAccessToken, usersApiError } from '@/lib/users-api-route';

type RouteContext = { params: Promise<{ invitationId: string }> };

/** POST /api/invitations/[invitationId]/resend */
export async function POST(_request: Request, context: RouteContext) {
  const auth = await requireAccessToken();
  if (auth.error) return auth.error;

  try {
    const { invitationId } = await context.params;
    const data = await resendInvitation(auth.token, invitationId);
    return jsonOk(data);
  } catch (err) {
    return usersApiError(err, 'Unable to resend invitation.');
  }
}
