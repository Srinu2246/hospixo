export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

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
    if (hasMessage(payload)) return payload.message;
  } catch {
    // Ignore invalid error payloads.
  }

  return `Request failed with status ${response.status}`;
}

function hasMessage(value: unknown): value is { message: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof value.message === 'string'
  );
}
