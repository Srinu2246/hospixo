import { ApiError, type HttpMethod, type QueryParams } from './types';

export const TOKEN_STORAGE_KEY = 'token';

export const tokenStorage = {
  get: (): string | null => {
    if (typeof window === 'undefined') return null;
    return (
      localStorage.getItem(TOKEN_STORAGE_KEY) ??
      localStorage.getItem('accessToken') ??
      localStorage.getItem('auth_token')
    );
  },
  set: (token: string, key = TOKEN_STORAGE_KEY): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, token);
  },
  remove: (key = TOKEN_STORAGE_KEY): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('auth_token');
  },
};

export interface RequestOptions extends Omit<RequestInit, 'body' | 'method'> {
  params?: QueryParams;
  headers?: HeadersInit;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

function getBaseUrl(): string {
  if (API_BASE_URL) {
    return API_BASE_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
}

function buildUrl(endpoint: string, params?: QueryParams): string {
  const isAbsolute = /^https?:\/\//i.test(endpoint);
  const baseUrl = isAbsolute ? '' : getBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = isAbsolute ? endpoint : `${baseUrl}${cleanEndpoint}`;

  const url = new URL(fullUrl, baseUrl || 'http://localhost');

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  if (!isAbsolute && !baseUrl) {
    return `${url.pathname}${url.search}`;
  }

  return url.toString();
}

function getHeaders(customHeaders?: HeadersInit, isFormData = false): Headers {
  const headers = new Headers(customHeaders);

  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (!headers.has('Authorization')) {
    const token = tokenStorage.get();
    if (token) {
      const authValue = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      headers.set('Authorization', authValue);
    }
  }

  return headers;
}

async function request<T>(
  method: HttpMethod,
  endpoint: string,
  payload?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const { params, headers: customHeaders, ...restOptions } = options;

  const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
  const headers = getHeaders(customHeaders, isFormData);

  const queryParams: QueryParams | undefined =
    method === 'GET' ? ((payload as QueryParams) ?? params) : params;

  const body =
    method !== 'GET' && payload !== undefined
      ? isFormData
        ? (payload as FormData)
        : JSON.stringify(payload)
      : undefined;

  const url = buildUrl(endpoint, queryParams);

  const response = await fetch(url, {
    method,
    headers,
    body,
    ...restOptions,
  });

  if (!response.ok) {
    let errorData: unknown;
    let message = `Request failed with status ${response.status}`;

    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        errorData = await response.json();
        if (
          typeof errorData === 'object' &&
          errorData !== null &&
          'message' in errorData &&
          typeof (errorData as { message: unknown }).message === 'string'
        ) {
          message = (errorData as { message: string }).message;
        }
      } else {
        errorData = await response.text();
      }
    } catch {
      // Ignore parsing errors
    }

    if (response.status === 401) {
      tokenStorage.remove();
    }

    throw new ApiError(message, response.status, undefined, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return (await response.json()) as T;
  }

  return (await response.text()) as unknown as T;
}

export const api = {
  get<T>(endpoint: string, params?: QueryParams, options?: RequestOptions): Promise<T> {
    return request<T>('GET', endpoint, params, options);
  },

  post<T>(endpoint: string, payload?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>('POST', endpoint, payload, options);
  },

  put<T>(endpoint: string, payload?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>('PUT', endpoint, payload, options);
  },

  patch<T>(endpoint: string, payload?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>('PATCH', endpoint, payload, options);
  },

  delete<T>(
    endpoint: string,
    paramsOrPayload?: QueryParams | unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return request<T>('DELETE', endpoint, paramsOrPayload, options);
  },

  setToken: tokenStorage.set,
  getToken: tokenStorage.get,
  removeToken: tokenStorage.remove,
};

export default api;
