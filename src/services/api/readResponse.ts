import { ApiError } from './types';

export async function readResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response, contentType), response.status);
  }

  if (!contentType.includes('application/json')) {
    throw new ApiError('Unexpected response', response.status || 502);
  }

  return (await response.json()) as T;
}

async function readErrorMessage(response: Response, contentType: string): Promise<string> {
  if (!contentType.includes('application/json')) {
    return `Request failed with status ${response.status}`;
  }

  try {
    const payload: unknown = await response.json();
    const message = readPayloadMessage(payload);
    if (message) return message;
  } catch {
    // Ignore invalid error payloads.
  }

  return `Request failed with status ${response.status}`;
}

function readPayloadMessage(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;

  const record = value as Record<string, unknown>;
  if (typeof record.message === 'string' && record.message) return record.message;
  if (typeof record.detail === 'string' && record.detail) return record.detail;

  if (Array.isArray(record.detail)) {
    const messages = record.detail
      .map((item) => {
        if (!item || typeof item !== 'object' || !('msg' in item)) return '';
        return typeof item.msg === 'string' ? item.msg : '';
      })
      .filter(Boolean);
    if (messages.length > 0) return messages.join(' ');
  }

  return null;
}
