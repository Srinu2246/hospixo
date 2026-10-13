import 'server-only';

import { cookies } from 'next/headers';

import { logoutRequestSchema } from '@/lib/schemas/login/loginFormSchema';
import { PROFILE_COOKIE, profileCookieValue } from '@/lib/auth/shell-session';
import ApiUrlsV1, { isAllowedEndpoint, isPublicEndpoint } from './ApiUrlsV1';
import { isMockApiEnabled, resolveMock } from './handler';
import { ApiError, readResponse, type HttpMethod, type QueryParams } from './types';

const SESSION_COOKIE = 'session';
const REFRESH_COOKIE = 'refresh_token';

type ServerRequestOptions = {
  params?: QueryParams;
  body?: unknown;
  signal?: AbortSignal;
};

async function requireSession(): Promise<string> {
  const session = cookies().get(SESSION_COOKIE)?.value;
  if (!session) {
    throw new ApiError('Unauthorized', 401);
  }
  return session;
}

function getBackendConfig(): { baseUrl: string; secret: string } {
  const baseUrl = process.env.API_BASE_URL?.replace(/\/+$/, '') ?? '';
  const secret = process.env.API_SECRET ?? '';

  if (!baseUrl) {
    throw new ApiError('API is not configured', 503);
  }

  return { baseUrl, secret };
}

function buildBackendUrl(path: string, params?: QueryParams): string {
  if (!isAllowedEndpoint(path)) {
    throw new ApiError('Unknown endpoint', 404);
  }

  const { baseUrl } = getBackendConfig();
  const url = new URL(`${baseUrl}/api${path}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

async function request<T>(
  method: HttpMethod,
  path: string,
  options: ServerRequestOptions = {},
): Promise<T> {
  if (isMockApiEnabled()) {
    return mockRequest<T>(method, path, options);
  }

  const isPublic = isPublicEndpoint(path);
  const isLogout = path === ApiUrlsV1.auth.logout;
  const usesAccessToken =
    isLogout ||
    path === ApiUrlsV1.auth.me ||
    path === ApiUrlsV1.organization.companies ||
    path.startsWith(`${ApiUrlsV1.organization.platformOrganizations}/`) ||
    path.startsWith(`${ApiUrlsV1.organization.platformOrganizationsV2}/`) ||
    path === ApiUrlsV1.restaurant.branches ||
    path.startsWith(`${ApiUrlsV1.restaurant.branches}/`);
  const session = isPublic ? undefined : await requireSession();
  const { secret } = getBackendConfig();
  const headers = new Headers({
    Accept: 'application/json',
  });

  if (usesAccessToken && session) {
    headers.set('Authorization', `Bearer ${session}`);
  } else if (secret) {
    headers.set('Authorization', `Bearer ${secret}`);
  }

  if (session) {
    headers.set('X-Session-Id', session);
  }

  const requestBody = isLogout ? logoutBody() : options.body;
  let body: string | undefined;
  if (requestBody !== undefined && method !== 'GET') {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(requestBody);
  }

  let response: Response;
  try {
    response = await fetch(buildBackendUrl(path, options.params), {
      method,
      headers,
      body,
      signal: options.signal,
      cache: 'no-store',
    });
  } catch {
    console.error('Upstream request failed');
    throw new ApiError('Upstream request failed', 502);
  }

  const payload = await readResponse<T>(response);
  storeSessionFromPayload(path, payload);
  return sanitizeForClient(payload);
}

function mockRequest<T>(method: HttpMethod, path: string, options: ServerRequestOptions): T {
  if (!isAllowedEndpoint(path)) {
    throw new ApiError('Unknown endpoint', 404);
  }

  const payload = resolveMock({
    method,
    path,
    params: options.params,
    body: options.body,
  });

  if (payload === undefined) {
    throw new ApiError('No mock data for this endpoint', 404);
  }

  storeSessionFromPayload(path, payload);
  return sanitizeForClient(payload) as T;
}

function storeSessionFromPayload(path: string, payload: unknown): void {
  if (path === ApiUrlsV1.auth.logout) {
    clearAuthCookies();
    return;
  }

  if (path === ApiUrlsV1.auth.me) {
    const profile = profileCookieValue(payload);
    if (profile) {
      cookies().set(PROFILE_COOKIE, profile, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 8,
      });
    }
    return;
  }

  if (path !== ApiUrlsV1.auth.login) return;

  const profile = profileCookieValue(payload);
  if (profile) {
    cookies().set(PROFILE_COOKIE, profile, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8,
    });
  }

  const refreshToken = readRefreshToken(payload);
  if (refreshToken) {
    cookies().set(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  const token = readSessionToken(payload);
  if (!token) return;

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

function logoutBody(): { refresh_token: string | null; revoke_all: false } {
  const stored = cookies().get(REFRESH_COOKIE)?.value ?? '';
  return logoutRequestSchema.parse({
    refresh_token: stored.length >= 32 ? stored : null,
    revoke_all: false,
  });
}

function clearAuthCookies(): void {
  cookies().delete(SESSION_COOKIE);
  cookies().delete(REFRESH_COOKIE);
  cookies().delete(PROFILE_COOKIE);
}

function readRefreshToken(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;

  const record = payload as Record<string, unknown>;
  const token = record.refresh_token ?? record.refreshToken;
  if (typeof token === 'string' && token.length >= 32) return token;

  if (record.data && typeof record.data === 'object') {
    return readRefreshToken(record.data);
  }

  return null;
}

function readSessionToken(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;

  const record = payload as Record<string, unknown>;
  const token = record.token ?? record.accessToken ?? record.access_token;

  if (typeof token === 'string' && token) return token;

  if (record.data && typeof record.data === 'object') {
    return readSessionToken(record.data);
  }

  return null;
}

export const serverApi = {
  get<T>(path: string, params?: QueryParams, signal?: AbortSignal): Promise<T> {
    return request<T>('GET', path, { params, signal });
  },

  post<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
    return request<T>('POST', path, { body, signal });
  },

  put<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
    return request<T>('PUT', path, { body, signal });
  },

  patch<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
    return request<T>('PATCH', path, { body, signal });
  },

  delete<T>(path: string, signal?: AbortSignal): Promise<T> {
    return request<T>('DELETE', path, { signal });
  },
};

const SENSITIVE_KEYS = new Set([
  'token',
  'password',
  'password-hash',
  'secret',
  'api-key',
  'api-secret',
  'access-token',
  'refresh-token',
  'mfa-token',
  'authorization',
  'credential',
  'credentials',
  'session',
  'ssn',
  'credit-card',
  'card-number',
  'cvv',
]);

const MAX_DEPTH = 20;

function sanitizeForClient<T>(value: T): T {
  return stripSensitive(value, 0) as T;
}

function stripSensitive(value: unknown, depth: number): unknown {
  if (depth > MAX_DEPTH) return null;

  if (Array.isArray(value)) {
    return value.map((item) => stripSensitive(item, depth + 1));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const output: Record<string, unknown> = {};

  for (const [key, nested] of Object.entries(value)) {
    if (isSensitiveKey(key)) continue;
    output[key] = stripSensitive(nested, depth + 1);
  }

  return output;
}

function isSensitiveKey(key: string): boolean {
  const normalized = normalizeKey(key);
  for (const sensitive of SENSITIVE_KEYS) {
    if (normalizeKey(sensitive) === normalized) return true;
  }
  return false;
}

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[-_\s]/g, '');
}
