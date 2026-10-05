import { ApiError, type ApiResponse, type HttpRequestConfig, type QueryParams } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

function buildUrl(path: string, params?: QueryParams): string {
  const url = new URL(path, API_BASE_URL || window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  return response.text() as T;
}

async function request<T>(path: string, config: HttpRequestConfig = {}): Promise<T> {
  const { method = 'GET', params, body, headers, signal } = config;

  const response = await fetch(buildUrl(path, params), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!response.ok) {
    let error: Partial<ApiResponse<unknown>> = {};

    try {
      error = await parseResponse<Partial<ApiResponse<unknown>>>(response);
    } catch {
      // Ignore response parsing errors.
    }

    throw new ApiError(
      error.message ?? `Request failed with status ${response.status}`,
      response.status,
      undefined,
      error.data,
    );
  }

  return parseResponse<T>(response);
}

export const http = {
  get<T>(path: string, params?: QueryParams): Promise<T> {
    return request<T>(path, {
      method: 'GET',
      params,
    });
  },

  post<T>(
    path: string,
    body?: unknown,
    config?: Omit<HttpRequestConfig, 'method' | 'body'>,
  ): Promise<T> {
    return request<T>(path, {
      ...config,
      method: 'POST',
      body,
    });
  },

  put<T>(
    path: string,
    body?: unknown,
    config?: Omit<HttpRequestConfig, 'method' | 'body'>,
  ): Promise<T> {
    return request<T>(path, {
      ...config,
      method: 'PUT',
      body,
    });
  },

  patch<T>(
    path: string,
    body?: unknown,
    config?: Omit<HttpRequestConfig, 'method' | 'body'>,
  ): Promise<T> {
    return request<T>(path, {
      ...config,
      method: 'PATCH',
      body,
    });
  },

  delete<T>(path: string, config?: Omit<HttpRequestConfig, 'method'>): Promise<T> {
    return request<T>(path, {
      ...config,
      method: 'DELETE',
    });
  },
};
