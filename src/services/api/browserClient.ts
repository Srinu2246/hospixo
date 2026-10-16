import { clearSidebarSession } from '@/lib/auth/session';
import { useSidebarStore } from '@/stores/sidebarStore';

import ApiUrlsV1 from './ApiUrlsV1';
import { readResponse } from './readResponse';
import { ApiError, type HttpMethod, type QueryParams } from './types';

type BrowserRequestOptions = {
  params?: QueryParams;
  body?: unknown;
  signal?: AbortSignal;
  /** When false, 401 does not force navigation to /login (optional UI fetches). */
  redirectOnUnauthorized?: boolean;
};

let redirectingToLogin = false;

function toAppPath(endpoint: string, params?: QueryParams): string {
  if (/^https?:\/\//i.test(endpoint) || !/^\/v[12]\//.test(endpoint)) {
    throw new ApiError('Browser client only calls versioned app endpoints', 400);
  }

  const url = new URL(`/api${endpoint}`, 'http://localhost');

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return `${url.pathname}${url.search}`;
}

function isAuthPath(endpoint: string): boolean {
  return endpoint === ApiUrlsV1.auth.login || endpoint === ApiUrlsV1.auth.logout;
}

/** Cookies are cleared server-side on 401; clear client session and go to login. */
function redirectToLoginAfterUnauthorized(): void {
  if (typeof window === 'undefined') return;
  if (redirectingToLogin) return;
  if (window.location.pathname === '/login') return;

  redirectingToLogin = true;
  clearSidebarSession();
  useSidebarStore.getState().clearSession();
  // Hard navigation so middleware sees cleared httpOnly cookies.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full reload required after auth cookie clear
  window.location.assign('/login');
}

async function request<T>(
  method: HttpMethod,
  endpoint: string,
  options: BrowserRequestOptions = {},
): Promise<T> {
  const headers = new Headers({ Accept: 'application/json' });
  let body: string | undefined;

  if (options.body !== undefined && method !== 'GET') {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(options.body);
  }

  const response = await fetch(toAppPath(endpoint, options.params), {
    method,
    headers,
    body,
    signal: options.signal,
    credentials: 'same-origin',
    cache: 'no-store',
  });

  try {
    return await readResponse<T>(response);
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 401 &&
      !isAuthPath(endpoint) &&
      options.redirectOnUnauthorized !== false
    ) {
      redirectToLoginAfterUnauthorized();
    }
    throw error;
  }
}

export const api = {
  get<T>(
    endpoint: string,
    params?: QueryParams,
    signal?: AbortSignal,
    options?: Pick<BrowserRequestOptions, 'redirectOnUnauthorized'>,
  ): Promise<T> {
    return request<T>('GET', endpoint, { params, signal, ...options });
  },

  post<T>(endpoint: string, body?: unknown, signal?: AbortSignal): Promise<T> {
    return request<T>('POST', endpoint, { body, signal });
  },

  put<T>(endpoint: string, body?: unknown, signal?: AbortSignal): Promise<T> {
    return request<T>('PUT', endpoint, { body, signal });
  },

  patch<T>(endpoint: string, body?: unknown, signal?: AbortSignal): Promise<T> {
    return request<T>('PATCH', endpoint, { body, signal });
  },

  delete<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
    return request<T>('DELETE', endpoint, { signal });
  },
};
