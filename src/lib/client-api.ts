/**
 * Standard client API client for calling BFF `/api/*` endpoints with same-origin cookies.
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, ...init } = options;
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const endpoint = path.startsWith('/api')
    ? path
    : `/api${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(endpoint, {
    ...init,
    headers,
    credentials: 'same-origin',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  let payload: Record<string, unknown> | null = null;
  if (text.trim()) {
    try {
      payload = JSON.parse(text) as Record<string, unknown>;
    } catch {
      throw new ApiError(res.status, 'API response was not valid JSON.');
    }
  }

  if (!res.ok) {
    const message =
      (typeof payload?.message === 'string' && payload.message) ||
      res.statusText ||
      'Request failed';
    throw new ApiError(res.status, message, payload);
  }

  return payload as T;
}

export const clientApi = {
  get: <T>(path: string, init?: Omit<RequestOptions, 'body' | 'method'>) =>
    request<T>(path, { ...init, method: 'GET' }),

  post: <T>(path: string, body?: unknown, init?: Omit<RequestOptions, 'body' | 'method'>) =>
    request<T>(path, { ...init, method: 'POST', body }),

  put: <T>(path: string, body?: unknown, init?: Omit<RequestOptions, 'body' | 'method'>) =>
    request<T>(path, { ...init, method: 'PUT', body }),

  patch: <T>(path: string, body?: unknown, init?: Omit<RequestOptions, 'body' | 'method'>) =>
    request<T>(path, { ...init, method: 'PATCH', body }),

  delete: <T>(path: string, init?: Omit<RequestOptions, 'body' | 'method'>) =>
    request<T>(path, { ...init, method: 'DELETE' }),
};
