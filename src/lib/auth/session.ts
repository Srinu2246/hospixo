import { cache } from 'react';
import { cookies } from 'next/headers';

import { fetchCurrentUser, normalizeUser, registrationToAuthToken } from '@/lib/api/auth';
import { ApiRequestError } from '@/lib/api/errors';
import { apiPaths } from '@/lib/api/paths';
import {
  AUTH_COOKIE_NAME,
  AUTH_PASSWORD_CHANGED_COOKIE,
  AUTH_PASSWORD_CHANGED_MAX_AGE_SECONDS,
  AUTH_REFRESH_COOKIE_MAX_AGE_SECONDS,
  AUTH_REFRESH_COOKIE_NAME,
  AUTH_SESSION_MAX_AGE_FALLBACK_SECONDS,
} from '@/lib/auth/constants';
import { logger } from '@/lib/logger';
import type {
  AuthSession,
  AuthToken,
  RegistrationResult,
  TokenUserInfo,
} from '@/types/platform-auth';

type CookieStore = Awaited<ReturnType<typeof cookies>>;

const PASSWORD_CHANGED_COOKIE_VALUE = '1';
const SESSION_ME_PATH = apiPaths.auth.me;
const SESSION_VALIDATION_MAX_ATTEMPTS = 3;
const SESSION_VALIDATION_RETRY_DELAY_MS = 200;

export type AuthSessionResult = Readonly<{
  session: AuthSession | null;
  hadAccessToken: boolean;
  validationError: string | null;
}>;

const EMPTY_SESSION_RESULT: AuthSessionResult = {
  session: null,
  hadAccessToken: false,
  validationError: null,
};

export function formatSessionValidationError(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.status === 401 || error.status === 403) {
      return 'Your session has expired. Please sign in again.';
    }
    if (error.status === 408 || error.status === 0) {
      return 'Unable to verify your session. The API did not respond in time. Please try again.';
    }
    if (error.status >= 500) {
      return 'Unable to verify your session. The server is unavailable. Please try again.';
    }
    if (error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return `Unable to verify your session. ${error.message}`;
  }

  return 'Unable to verify your session. Please sign in again.';
}

function describeSessionValidationError(error: unknown): Record<string, unknown> {
  if (error instanceof ApiRequestError) {
    return {
      path: SESSION_ME_PATH,
      status: error.status,
      message: error.message,
      detail: error.details ?? null,
    };
  }

  if (error instanceof Error) {
    return {
      path: SESSION_ME_PATH,
      name: error.name,
      message: error.message,
    };
  }

  if (error != null && typeof error === 'object') {
    try {
      return { path: SESSION_ME_PATH, error: JSON.stringify(error) };
    } catch {
      return { path: SESSION_ME_PATH, error: String(error) };
    }
  }

  return { path: SESSION_ME_PATH, error: String(error) };
}

export function hasPasswordChangeGrace(cookieStore: CookieStore): boolean {
  return cookieStore.get(AUTH_PASSWORD_CHANGED_COOKIE)?.value === PASSWORD_CHANGED_COOKIE_VALUE;
}

export function setPasswordChangedCookie(cookieStore: CookieStore) {
  cookieStore.set(AUTH_PASSWORD_CHANGED_COOKIE, PASSWORD_CHANGED_COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: AUTH_PASSWORD_CHANGED_MAX_AGE_SECONDS,
  });
}

export function clearPasswordChangedCookie(cookieStore: CookieStore) {
  cookieStore.delete(AUTH_PASSWORD_CHANGED_COOKIE);
}

export function readAccessToken(cookieStore: CookieStore) {
  return (
    cookieStore.get(AUTH_COOKIE_NAME)?.value ??
    cookieStore.get('hospixo_admin_access_token')?.value ??
    cookieStore.get('hospixo_admin_token')?.value ??
    cookieStore.get('admin_token')?.value ??
    cookieStore.get('access_token')?.value ??
    cookieStore.get('token')?.value ??
    null
  );
}

export function setAccessTokenCookie(
  cookieStore: CookieStore,
  token: AuthToken | Pick<RegistrationResult, 'access_token' | 'expires_in'>,
) {
  cookieStore.set(AUTH_COOKIE_NAME, token.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: token.expires_in || AUTH_SESSION_MAX_AGE_FALLBACK_SECONDS,
  });
  if ('refresh_token' in token) {
    setRefreshTokenCookie(cookieStore, token.refresh_token);
  }
}

export function readRefreshToken(cookieStore: CookieStore) {
  return cookieStore.get(AUTH_REFRESH_COOKIE_NAME)?.value ?? null;
}

export function setRefreshTokenCookie(cookieStore: CookieStore, refreshToken?: string | null) {
  const token = refreshToken?.trim();
  if (!token) {
    clearRefreshTokenCookie(cookieStore);
    return;
  }

  cookieStore.set(AUTH_REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: AUTH_REFRESH_COOKIE_MAX_AGE_SECONDS,
  });
}

export function clearRefreshTokenCookie(cookieStore: CookieStore) {
  cookieStore.delete(AUTH_REFRESH_COOKIE_NAME);
}

export function clearAccessTokenCookie(cookieStore: CookieStore) {
  cookieStore.delete(AUTH_COOKIE_NAME);
}

/**
 * Layouts and Server Components may only *read* cookies. Next.js throws if we
 * delete/set from `getServerAuthSession()` during render — that used to look
 * like a failed login and bounced a valid session back to `/login`.
 */
function tryMutateCookie(mutate: () => void) {
  try {
    mutate();
  } catch {
    // Ignore writes outside Server Actions / Route Handlers.
  }
}

export function toAuthSession(token: AuthToken): AuthSession {
  return {
    accessToken: token.access_token,
    expiresIn: token.expires_in,
    user: token.user,
  };
}

function isRetryableSessionValidationError(error: unknown): boolean {
  if (error instanceof ApiRequestError) {
    if (error.status === 401 || error.status === 403) return false;
    if (error.status === 408 || error.status === 0) return true;
    return error.status >= 500;
  }

  return true;
}

function waitBeforeSessionRetry(attempt: number): Promise<void> {
  if (attempt <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    setTimeout(resolve, SESSION_VALIDATION_RETRY_DELAY_MS * attempt);
  });
}

async function validateAccessToken(accessToken: string): Promise<TokenUserInfo> {
  let lastError: unknown;

  for (let attempt = 0; attempt < SESSION_VALIDATION_MAX_ATTEMPTS; attempt += 1) {
    try {
      if (attempt > 0) {
        await waitBeforeSessionRetry(attempt);
      }

      const payload = await fetchCurrentUser(accessToken);
      return normalizeUser(payload);
    } catch (error) {
      lastError = error;
      const hasRemainingAttempts = attempt < SESSION_VALIDATION_MAX_ATTEMPTS - 1;
      if (hasRemainingAttempts && isRetryableSessionValidationError(error)) {
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}

/**
 * Read-only session lookup for Server Components, layouts, and loaders.
 * Cookie writes belong in Route Handlers / Server Actions only (Next.js 16+).
 */
async function getServerAuthSessionResultUncached(): Promise<AuthSessionResult> {
  let accessToken: string | null = null;

  try {
    const { headers } = await import('next/headers');
    const headerList = await headers();
    const auth = headerList.get('authorization');
    if (auth?.startsWith('Bearer ')) {
      accessToken = auth.slice(7).trim();
    }
  } catch {
    // Ignore header lookup if outside request context
  }

  const cookieStore = await cookies();
  if (!accessToken) {
    accessToken = readAccessToken(cookieStore);
  }

  if (!accessToken) {
    return EMPTY_SESSION_RESULT;
  }

  try {
    const user = await validateAccessToken(accessToken);

    if (!user.must_change_password && hasPasswordChangeGrace(cookieStore)) {
      tryMutateCookie(() => clearPasswordChangedCookie(cookieStore));
    }

    return {
      session: {
        accessToken,
        expiresIn: AUTH_SESSION_MAX_AGE_FALLBACK_SECONDS,
        user,
      },
      hadAccessToken: true,
      validationError: null,
    };
  } catch (error) {
    const isUnauthorized =
      error instanceof ApiRequestError && (error.status === 401 || error.status === 403);

    const validationError = formatSessionValidationError(error);
    const diagnostics = describeSessionValidationError(error);

    if (isUnauthorized) {
      logger.auth.debug('session expired or invalid', diagnostics);
    } else {
      logger.auth.error('session validation failed', error, diagnostics);
    }

    return {
      session: null,
      hadAccessToken: true,
      validationError,
    };
  }
}

/** Deduplicate `/me` validation when layout and page both load in one request. */
export const getServerAuthSessionResult = cache(getServerAuthSessionResultUncached);

export async function getServerAuthSession(): Promise<AuthSession | null> {
  const { session } = await getServerAuthSessionResult();
  return session;
}

/** Clear auth cookies — call from Route Handlers / Server Actions only. */
export async function invalidateServerAuthSession(): Promise<void> {
  const cookieStore = await cookies();
  clearAccessTokenCookie(cookieStore);
  clearRefreshTokenCookie(cookieStore);
  clearPasswordChangedCookie(cookieStore);
}

export function buildRegistrationUser(
  result: RegistrationResult,
  input: {
    first_name: string;
    last_name?: string | null;
  },
): TokenUserInfo {
  return {
    id: result.user_id,
    first_name: input.first_name,
    last_name: input.last_name ?? null,
    email: result.email,
    scope: 'tenant',
    roles: ['tenant_admin'],
    company_id: result.company_id,
    branch_id: null,
    org_id: result.organization_id,
    must_change_password: false,
  };
}

export function buildRegistrationToken(result: RegistrationResult, user: TokenUserInfo): AuthToken {
  return registrationToAuthToken(result, user);
}
