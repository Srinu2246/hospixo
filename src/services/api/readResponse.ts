import { extractCode, extractMessage } from '@/lib/helpers/getErrorMessage';

import { ApiError } from './types';

export async function readResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (!response.ok) {
    throw await buildApiError(response, contentType);
  }

  if (!contentType.includes('application/json')) {
    throw new ApiError('Unexpected response', response.status || 502);
  }

  return (await response.json()) as T;
}

async function buildApiError(response: Response, contentType: string): Promise<ApiError> {
  const fallback = `Request failed with status ${response.status}`;

  if (contentType.includes('application/json')) {
    try {
      const payload: unknown = await response.json();
      return new ApiError(
        extractMessage(payload) ?? fallback,
        response.status,
        extractCode(payload),
        payload,
      );
    } catch {
      return new ApiError(fallback, response.status);
    }
  }

  try {
    const text = (await response.text()).trim();
    if (text) {
      return new ApiError(text, response.status, undefined, text);
    }
  } catch {
    // Ignore unreadable bodies.
  }

  return new ApiError(fallback, response.status);
}
