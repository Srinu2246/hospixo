import { readResponse } from './readResponse';
import { ApiError, type HttpMethod, type QueryParams } from './types';

type BrowserRequestOptions = {
  params?: QueryParams;
  body?: unknown;
  signal?: AbortSignal;
};

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

  return readResponse<T>(response);
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
