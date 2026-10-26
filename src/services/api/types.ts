export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export class ApiError extends Error {
  status: number;
  code?: string;
  /** Exact upstream / backend error body when available. */
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
