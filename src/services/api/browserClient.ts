import { clearSidebarSession } from '@/lib/auth/session';
import { resolveUpstreamContextHeaders } from '@/lib/helpers/apiContextHeaders';
import { getErrorMessage, getSuccessMessage } from '@/lib/helpers/getErrorMessage';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useToastStore } from '@/stores/toastStore';

import ApiUrlsV1, { isPublicEndpoint } from './ApiUrlsV1';
import { isApiServerFetchEnabled } from './fetchMode';
import { readResponse } from './readResponse';
import { ApiError, type HttpMethod, type QueryParams } from './types';

export type BrowserWriteOptions = {
  signal?: AbortSignal;
  /** When true, skip automatic success/error toasts for POST/PATCH. */
  silent?: boolean;
};

type BrowserRequestOptions = {
  params?: QueryParams;
  body?: unknown;
  signal?: AbortSignal;
  silent?: boolean;
  toastOnWrite?: boolean;
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
  return (
    endpoint === ApiUrlsV1.auth.login ||
    endpoint === ApiUrlsV1.auth.logout ||
    endpoint === ApiUrlsV1.invitations.accept ||
    endpoint === ApiUrlsV1.invitations.reject
  );
}

/** Cookies are cleared server-side on 401; clear client session and go to login. */
function redirectToLoginAfterUnauthorized(): void {
  if (typeof window === 'undefined') return;
  if (redirectingToLogin) return;
  if (window.location.pathname === '/login' || window.location.pathname.startsWith('/invite/')) {
    return;
  }

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

function showToast(message: string, severity: 'success' | 'error') {
  if (typeof window === 'undefined') return;
  useToastStore.getState().show(message, severity);
}

function resolveWriteOptions(
  options?: AbortSignal | BrowserWriteOptions,
): Pick<BrowserRequestOptions, 'signal' | 'silent'> {
  if (!options) return {};
  if (typeof AbortSignal !== 'undefined' && options instanceof AbortSignal) {
    return { signal: options };
  }
  return options as BrowserWriteOptions;
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
  for (const [key, value] of Object.entries(resolveUpstreamContextHeaders())) {
    headers.set(key, value);
  }
  let body: BodyInit | undefined;

  if (options.body !== undefined && method !== 'GET') {
    if (options.body instanceof FormData) {
      body = options.body;
    } else {
      headers.set('Content-Type', 'application/json');
      body = JSON.stringify(options.body);
    }
  }

  const response = await fetch(toAppPath(endpoint, options.params), {
    method,
    headers,
    body,
    signal: options.signal,
    credentials: 'same-origin',
    cache: 'no-store',
  });

  const shouldToastWrite =
    options.toastOnWrite === true && !options.silent && !isAuthPath(endpoint);

  try {
    const payload = await readResponse<T>(response);
    if (shouldToastWrite) {
      showToast(getSuccessMessage(payload, 'Request completed successfully.'), 'success');
    }
    return payload;
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 401 &&
      !isAuthPath(endpoint) &&
      !isPublicEndpoint(endpoint)
    ) {
      redirectToLoginAfterUnauthorized();
    }
    if (shouldToastWrite) {
      showToast(getErrorMessage(error), 'error');
    }
    throw error;
  }
}

export const api = {
  get<T>(endpoint: string, params?: QueryParams, signal?: AbortSignal): Promise<T> {
    return request<T>('GET', endpoint, { params, signal });
  },

  post<T>(
    endpoint: string,
    body?: unknown,
    options?: AbortSignal | BrowserWriteOptions,
  ): Promise<T> {
    const write = resolveWriteOptions(options);
    return request<T>('POST', endpoint, {
      body,
      signal: write.signal,
      silent: write.silent,
      toastOnWrite: true,
    });
  },

  put<T>(endpoint: string, body?: unknown, signal?: AbortSignal): Promise<T> {
    return request<T>('PUT', endpoint, { body, signal });
  },

  patch<T>(
    endpoint: string,
    body?: unknown,
    options?: AbortSignal | BrowserWriteOptions,
  ): Promise<T> {
    const write = resolveWriteOptions(options);
    return request<T>('PATCH', endpoint, {
      body,
      signal: write.signal,
      silent: write.silent,
      toastOnWrite: true,
    });
  },

  delete<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
    return request<T>('DELETE', endpoint, { signal });
  },
};
