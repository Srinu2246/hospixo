/**
 * Client-side auth helpers — all calls go through Next.js API routes.
 * The JWT is stored in an httpOnly cookie set by the server; it never touches
 * client-side storage.
 */

import type { TokenUserInfo } from '@/types/auth';

export type AuthUser = TokenUserInfo;

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

function readApiData<T>(payload: ApiEnvelope<T> | T): T {
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return (payload as ApiEnvelope<T>).data;
  }

  return payload as T;
}

/** POST /api/auth/login → sets httpOnly cookie, returns the authenticated user. */
export async function loginRequest(email: string, password: string): Promise<AuthUser> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'same-origin',
  });

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as { message?: string }).message)
        : 'Invalid credentials';
    throw new Error(message || 'Invalid credentials');
  }

  return readApiData<AuthUser>(payload);
}

/** POST /api/auth/logout → clears the httpOnly cookie server-side. */
export async function logoutRequest(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
}

/** GET /api/auth/me → returns the current user derived from the session cookie. */
export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
  if (!res.ok) return null;

  const payload = await res.json();
  const data = readApiData<{ user: AuthUser | null }>(payload);
  return data.user;
}

/** GET /api/tenant/[venueCode] → tenant config, proxied through the Node server. */
export async function fetchTenantViaProxy(venueCode: string): Promise<unknown> {
  const res = await fetch(`/api/tenant/${venueCode}`, { credentials: 'same-origin' });
  if (!res.ok) throw new Error(`Tenant config unavailable (${res.status})`);
  return res.json();
}
