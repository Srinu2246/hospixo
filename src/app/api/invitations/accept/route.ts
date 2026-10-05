import { acceptInvitation } from '@/lib/api/invitations';
import { getServerToken } from '@/server/auth';
import { jsonOk, usersApiError } from '@/lib/users-api-route';

/** POST /api/invitations/accept → POST /api/v1/invitations/accept */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = await getServerToken();
    const data = await acceptInvitation(body, token);
    return jsonOk(data);
  } catch (err) {
    return usersApiError(err, 'Unable to accept invitation.');
  }
}
