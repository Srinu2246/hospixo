import { rejectInvitation } from '@/lib/api/invitations';
import { getServerToken } from '@/server/auth';
import { jsonOk, usersApiError } from '@/lib/users-api-route';

/** POST /api/invitations/reject → POST /api/v1/invitations/reject */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = await getServerToken();
    const data = await rejectInvitation(body, token);
    return jsonOk(data);
  } catch (err) {
    return usersApiError(err, 'Unable to reject invitation.');
  }
}
