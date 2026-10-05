export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export type RequestBody = unknown;

export type ApiErrorResponse = {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
};

export type ApiResponse<T> = {
  data: T;
  message?: string;
  success?: boolean;
};

export type HttpRequestConfig = {
  method?: HttpMethod;
  params?: QueryParams;
  body?: RequestBody;
  headers?: HeadersInit;
  signal?: AbortSignal;
};

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
