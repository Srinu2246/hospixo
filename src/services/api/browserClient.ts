import { clearSidebarSession } from '@/lib/auth/session';
import { useSidebarStore } from '@/stores/sidebarStore';

import ApiUrlsV1, { isPublicEndpoint } from './ApiUrlsV1';
import { isApiServerFetchEnabled } from './fetchMode';
import { readResponse } from './readResponse';
import { ApiError, type HttpMethod, type QueryParams } from './types';

type BrowserRequestOptions = {
  params?: QueryParams;
  body?: unknown;
  signal?: AbortSignal;
};

let redirectingToLogin = false;

/**
 * Browser only calls same-origin `/api/v1|v2/...` (BFF). Absolute backend URLs are rejected
 * so `API_BASE_URL` never leaves the server.
 */
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

/** Auth session bootstrap may still GET on the client even in server-fetch mode. */
function isClientGetAllowed(endpoint: string): boolean {
  return endpoint === ApiUrlsV1.auth.me;
}

async function request<T>(
  method: HttpMethod,
  endpoint: string,
  options: BrowserRequestOptions = {},
): Promise<T> {
  if (method === 'GET' && isApiServerFetchEnabled() && !isClientGetAllowed(endpoint)) {
    throw new ApiError(
      'Client GET disabled (NEXT_PUBLIC_API_SERVER_FETCH=true). Load this path with serverApi in the page.',
      503,
    );
  }

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
      !isPublicEndpoint(endpoint)
    ) {
      redirectToLoginAfterUnauthorized();
    }
    throw error;
  }
}

export const api = {
  get<T>(endpoint: string, params?: QueryParams, signal?: AbortSignal): Promise<T> {
    return request<T>('GET', endpoint, { params, signal });
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
