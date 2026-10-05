import 'server-only';

import { getServerAuthSession } from '@/lib/auth/session';

/**
 * Session boundary that validates the cookie against the backend `/me`.
 * Invalid/expired cookies are cleared by `getServerAuthSession`.
 */
export async function getServerSession(): Promise<{ token: string } | null> {
  const session = await getServerAuthSession();
  return session ? { token: session.accessToken } : null;
}
