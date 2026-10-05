import 'server-only';

import { AUTH_COOKIE_NAME } from '@/lib/auth/constants';

/** Read the auth token from Authorization header or httpOnly cookies — server-side only. */
export async function getServerToken(): Promise<string | null> {
  try {
    const { headers } = await import('next/headers');
    const headerList = await headers();
    const auth = headerList.get('authorization');
    if (auth?.startsWith('Bearer ')) {
      return auth.slice(7).trim();
    }
  } catch {
    // Ignore header lookup if outside request context
  }

  try {
    const { cookies } = await import('next/headers');
    const store = await cookies();
    return (
      store.get(AUTH_COOKIE_NAME)?.value ??
      store.get('hospixo_admin_access_token')?.value ??
      store.get('hospixo_admin_token')?.value ??
      store.get('admin_token')?.value ??
      store.get('access_token')?.value ??
      store.get('token')?.value ??
      null
    );
  } catch {
    return null;
  }
}
