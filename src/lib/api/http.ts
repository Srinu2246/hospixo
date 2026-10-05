import { logApiFailure, logApiRequest, logApiResponse } from '@/lib/logger';
import { sanitizeUrlPath } from '@/lib/observability/sentry';
import type { ApiErrorPayload, ApiResponse } from '@/types/api';

import {
  ApiRequestError,
  formatApiValidationDetails,
  getStructuredApiErrorMessage,
  normalizeApiErrorDetail,
  toNetworkApiRequestError,
} from './errors';

type ApiFetchOptions = Readonly<{
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
  baseUrl: string;
  headers?: Readonly<Record<string, string>>;
  timeoutMs?: number;
}>;

export async function apiFetch<T>(path: string, options: ApiFetchOptions): Promise<T> {
  const method = options.method ?? 'GET';
  const startedAt = Date.now();
  const targetUrl = new URL(path, options.baseUrl).toString();
  const timeoutMs = options.timeoutMs ?? 45_000;

  logApiRequest({
    method,
    path,
    hasBody: options.body !== undefined,
    hasToken: Boolean(options.token),
  });

  const headers = new Headers({ Accept: 'application/json' });
  if (options.body !== undefined) headers.set('Content-Type', 'application/json');
  if (options.token) headers.set('Authorization', `Bearer ${options.token}`);
  if (options.headers) {
    for (const [key, value] of Object.entries(options.headers)) {
      headers.set(key, value);
    }
  }

  const body = options.body !== undefined ? JSON.stringify(options.body) : undefined;
  const signal = AbortSignal.timeout(timeoutMs);

  let response: Response;
  try {
    response = await fetch(targetUrl, { method, headers, body, cache: 'no-store', signal });
  } catch (error) {
    const apiError = toNetworkApiRequestError(error, { baseUrl: options.baseUrl, path });
    logApiFailure(
      { method, path: sanitizeUrlPath(path), durationMs: Date.now() - startedAt, targetUrl },
      apiError,
    );
    throw apiError;
  }

  logApiResponse({
    method,
    path: sanitizeUrlPath(path),
    status: response.status,
    durationMs: Date.now() - startedAt,
    ok: response.ok,
  });

  const text = await response.text().catch(() => '');
  let payload: unknown = null;
  if (text.trim()) {
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      throw new ApiRequestError('The server returned an invalid response.', response.status);
    }
  }

  if (!response.ok) {
    const validation = payload as ApiErrorPayload | null;
    const message =
      getApiErrorMessageFromPayload(validation, response.statusText) ?? 'Request failed';
    throw new ApiRequestError(message, response.status, normalizeApiErrorDetail(validation));
  }

  return unwrapSuccessfulPayload<T>(payload, response.status);
}

function unwrapSuccessfulPayload<T>(payload: unknown, status: number): T {
  if (payload == null || typeof payload !== 'object') {
    throw new ApiRequestError('The server returned an invalid response.', status);
  }
  if ('success' in payload) {
    const wrapped = payload as ApiResponse<T>;
    if (!wrapped.success || wrapped.data === null || wrapped.data === undefined) {
      throw new ApiRequestError(wrapped.message || 'Request failed', status);
    }
    return wrapped.data;
  }
  return payload as T;
}

function getApiErrorMessageFromPayload(payload: ApiErrorPayload | null, statusText: string) {
  if (payload?.message) return payload.message;
  const structuredMessage = getStructuredApiErrorMessage(payload?.detail);
  if (structuredMessage) return structuredMessage;
  const validationMessage = formatApiValidationDetails(payload?.detail ?? undefined);
  if (validationMessage) return validationMessage;
  return statusText || 'Request failed';
}
