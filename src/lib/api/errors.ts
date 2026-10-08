import type { ApiErrorPayload, StructuredApiErrorDetail } from '@/types/api';

/** HTTP status used when the client cannot reach the API (fetch/network failure). */
export const NETWORK_API_STATUS = 0;

export class ApiRequestError extends Error {
  readonly status: number;
  readonly details: ApiErrorPayload['detail'];

  constructor(message: string, status: number, details?: ApiErrorPayload['detail']) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.details = details;
  }
}

export function isNetworkApiError(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError && error.status === NETWORK_API_STATUS;
}

const NETWORK_ERROR_PATTERN =
  /fetch failed|ECONNREFUSED|ENOTFOUND|ECONNRESET|ETIMEOUT|connect timeout|network|UND_ERR/i;

/** True for API status 0 or raw fetch/connection failures. */
export function isNetworkFailure(error: unknown): boolean {
  if (isNetworkApiError(error)) {
    return true;
  }

  if (error instanceof ApiRequestError) {
    const detailText = typeof error.details === 'string' ? error.details : error.message;
    if (NETWORK_ERROR_PATTERN.test(detailText)) {
      return true;
    }
  }

  if (!(error instanceof Error)) {
    return false;
  }

  if (NETWORK_ERROR_PATTERN.test(error.message)) {
    return true;
  }

  const cause = (error as Error & { cause?: unknown }).cause;
  if (cause instanceof Error && NETWORK_ERROR_PATTERN.test(cause.message)) {
    return true;
  }

  if (typeof cause === 'string' && NETWORK_ERROR_PATTERN.test(cause)) {
    return true;
  }

  return false;
}

type NetworkApiErrorContext = Readonly<{
  baseUrl?: string;
  path?: string;
}>;

function readNetworkErrorCause(error: unknown): string {
  if (!(error instanceof Error)) {
    return String(error);
  }

  const nested = (error as Error & { cause?: unknown }).cause;
  if (nested instanceof Error && nested.message.trim()) {
    return `${error.message} (${nested.message})`.trim();
  }

  if (typeof nested === 'string' && nested.trim()) {
    return `${error.message} (${nested})`.trim();
  }

  return error.message;
}

function formatNetworkTarget(context?: NetworkApiErrorContext): string | null {
  if (!context?.baseUrl) return null;

  const base = context.baseUrl.replace(/\/$/, '');
  if (!context.path) return base;

  return `${base}${context.path.startsWith('/') ? context.path : `/${context.path}`}`;
}

function isFetchTimeoutError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.name === 'TimeoutError' || error.name === 'AbortError';
}

/** Normalize fetch/network failures into a stable ApiRequestError for callers. */
export function toNetworkApiRequestError(
  error: unknown,
  context?: NetworkApiErrorContext,
): ApiRequestError {
  if (isNetworkApiError(error)) {
    return error;
  }

  if (isFetchTimeoutError(error)) {
    return new ApiRequestError(
      GENERIC_HTTP_STATUS_MESSAGES[408] ?? 'The request took too long. Please try again.',
      408,
    );
  }

  const cause = readNetworkErrorCause(error);
  const target = formatNetworkTarget(context);
  const isProduction = process.env.NODE_ENV === 'production';

  const message = isProduction
    ? 'Unable to reach the API.'
    : target
      ? `Unable to reach the API at ${target}. ${cause}`
      : `Unable to reach the API. ${cause}`;

  return new ApiRequestError(message, NETWORK_API_STATUS, cause);
}

function asStructuredDetail(detail: ApiErrorPayload['detail']): StructuredApiErrorDetail | null {
  if (detail == null || typeof detail !== 'object' || Array.isArray(detail)) {
    return null;
  }

  return detail as StructuredApiErrorDetail;
}

export function isFirstLoginActionRequired(error: unknown): boolean {
  if (!(error instanceof ApiRequestError)) {
    return false;
  }

  const structured = asStructuredDetail(error.details);
  if (structured?.code === 'FIRST_LOGIN_ACTION_REQUIRED') {
    return true;
  }

  const details = structured?.details;
  if (!Array.isArray(details)) {
    return false;
  }

  return details.some(
    (item) => item.field === 'must_change_password' && String(item.reason).toLowerCase() === 'true',
  );
}

export function getStructuredApiErrorMessage(detail: ApiErrorPayload['detail']): string | null {
  const structured = asStructuredDetail(detail);
  if (structured?.message?.trim()) {
    return structured.message.trim();
  }

  return null;
}

const VALIDATION_FIELD_LABELS: Readonly<Record<string, string>> = {
  org_id: 'Organization ID',
  organization_id: 'Organization ID',
  company_id: 'Company ID',
  taxes: 'GST',
};

const LOC_CONTEXT = new Set(['body', 'path', 'query', 'header', 'cookie']);

const GENERIC_HTTP_STATUS_MESSAGES: Readonly<Partial<Record<number, string>>> = {
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'We could not find the requested resource.',
  408: 'The request took too long. Please try again.',
  429: 'Too many requests. Please wait and try again.',
};

function isApiErrorCodeDetail(
  detail: ApiErrorPayload['detail'],
): detail is Readonly<{ code?: string; message?: string }> {
  return typeof detail === 'object' && detail !== null && !Array.isArray(detail);
}

/** Normalize platform error payloads into a `{ code, message }` detail shape. */
export function normalizeApiErrorDetail(
  payload: ApiErrorPayload | null | undefined,
): ApiErrorPayload['detail'] | undefined {
  if (!payload) return undefined;

  if (payload.detail !== undefined) {
    return payload.detail;
  }

  if (payload.details !== undefined) {
    return payload.details;
  }

  if (typeof payload.code === 'string' && payload.code.trim()) {
    return { code: payload.code.trim(), message: payload.message };
  }

  if (
    typeof payload === 'object' &&
    payload !== null &&
    'success' in payload &&
    (payload as { success?: boolean }).success === false &&
    typeof payload.message === 'string' &&
    payload.message.trim()
  ) {
    return { message: payload.message.trim() };
  }

  return undefined;
}

/** Read platform error codes from `{ code: "..." }` detail payloads. */
export function extractApiErrorCode(detail: ApiErrorPayload['detail']): string | null {
  if (!isApiErrorCodeDetail(detail)) {
    return null;
  }

  const code = detail.code;
  return typeof code === 'string' && code.trim() ? code.trim() : null;
}

function extractApiErrorDetailMessage(detail: ApiErrorPayload['detail']): string | null {
  if (!isApiErrorCodeDetail(detail)) {
    return null;
  }

  const message = detail.message;
  return typeof message === 'string' && message.trim() ? message.trim() : null;
}

type ResolveApiErrorMessageOptions = Readonly<{
  fallback?: string;
  codeMessages?: Readonly<Record<string, string>>;
}>;

/** Map API failures to user-facing copy using optional code → message config. */
export function resolveApiErrorMessage(
  error: unknown,
  options: ResolveApiErrorMessageOptions = {},
): string {
  const fallback = options.fallback ?? 'Request failed. Please try again.';

  if (error instanceof ApiRequestError) {
    const code = extractApiErrorCode(error.details);
    if (code && options.codeMessages?.[code]) {
      return options.codeMessages[code];
    }

    const validation = formatApiValidationDetails(error.details);
    if (validation) return validation;

    const detailMessage = extractApiErrorDetailMessage(error.details);
    if (detailMessage) {
      return sanitizeAuthErrorMessage(detailMessage) || fallback;
    }

    const statusMessage = GENERIC_HTTP_STATUS_MESSAGES[error.status];
    if (statusMessage) return statusMessage;

    const sanitized = sanitizeAuthErrorMessage(error.message);
    if (sanitized && !isGenericHttpStatusText(sanitized)) {
      return sanitized;
    }

    if (error.status === 409 || isGenericHttpStatusText(error.message)) {
      return fallback;
    }
  }

  if (
    error instanceof Error &&
    /fetch failed|ECONNREFUSED|ENOTFOUND|network/i.test(error.message)
  ) {
    return 'We could not reach the service. Check your connection and try again.';
  }

  if (error instanceof Error && error.message) {
    const sanitized = sanitizeAuthErrorMessage(error.message);
    if (sanitized && !isGenericHttpStatusText(sanitized)) {
      return sanitized;
    }
  }

  return fallback;
}

function isGenericHttpStatusText(message: string) {
  return /^(bad request|unauthorized|forbidden|not found|conflict|unprocessable entity|internal server error|request failed)$/i.test(
    message.trim(),
  );
}

/** Format FastAPI/Pydantic `detail` so users see which field failed (e.g. org_id). */
export function formatApiValidationDetails(detail: ApiErrorPayload['detail']): string | null {
  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }

  if (!Array.isArray(detail) || detail.length === 0) {
    return null;
  }

  return detail
    .map((item) => {
      const fieldKey = [...item.loc]
        .reverse()
        .find((part) => typeof part === 'string' && !LOC_CONTEXT.has(part));
      const label =
        typeof fieldKey === 'string' ? (VALIDATION_FIELD_LABELS[fieldKey] ?? fieldKey) : null;
      const received =
        item.input === undefined
          ? ''
          : ` (received ${typeof item.input === 'string' ? `"${item.input}"` : String(item.input)})`;

      return label ? `${label}: ${item.msg}${received}` : `${item.msg}${received}`;
    })
    .join(' · ');
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Invalid email, mobile number, or password. Please try again.',
) {
  if (error instanceof ApiRequestError) {
    if (error.status === NETWORK_API_STATUS) {
      return 'Cannot reach the login server. Check that the API is running and try again.';
    }
    return sanitizeAuthErrorMessage(error.message) || fallback;
  }

  if (isNetworkFailure(error)) {
    return 'Cannot reach the login server. Check that the API is running and try again.';
  }

  if (error instanceof Error && error.message) {
    return sanitizeAuthErrorMessage(error.message) || fallback;
  }

  return fallback;
}

/**
 * Returns a human-friendly, actionable error message for API and system errors.
 * Translates status codes (401, 403, 404, 409, 422, 500) into clear user instructions.
 */
export function getUserFriendlyErrorMessage(
  error: unknown,
  fallback = 'An unexpected error occurred. Please try again.',
): string {
  if (error instanceof ApiRequestError) {
    if (isFirstLoginActionRequired(error)) {
      return 'Password change is required before you can continue. Please set a new password.';
    }
    if (error.status === NETWORK_API_STATUS) {
      return 'Unable to reach the server. Check your connection and try again.';
    }
    if (error.status === 401) {
      return 'Your session has expired. Please sign in again to continue.';
    }
    if (error.status === 403) {
      return 'Access denied (Forbidden). Your current account role does not have permission to perform this action. Please sign in with an administrator account or request user management permissions from your manager.';
    }
    if (error.status === 404) {
      return 'The requested record could not be found. It may have been deleted or modified.';
    }
    if (error.status === 409) {
      return 'A user or invitation with this email address already exists. Please verify the email address or manage the existing staff profile.';
    }
    if (error.status === 422 || error.status === 400) {
      const validation = formatApiValidationDetails(error.details);
      if (validation) return validation;

      const detailStr =
        typeof error.details === 'string'
          ? error.details
          : Array.isArray(error.details)
            ? error.details
                .map(
                  (d: { msg?: string; message?: string }) =>
                    d.msg || d.message || JSON.stringify(d),
                )
                .join(', ')
            : error.message;

      if (/email.*already exists|duplicate key|already registered/i.test(detailStr)) {
        return 'A user with this email address already exists. Please use a different email address.';
      }
      if (/branch/i.test(detailStr) && /required|missing|invalid/i.test(detailStr)) {
        return 'A valid branch is required for this role. Please ensure a branch is assigned before proceeding.';
      }
      if (detailStr && !/internal server error|bad request|unprocessable/i.test(detailStr)) {
        return detailStr;
      }
      return 'Please review your input information and ensure all required fields are filled correctly.';
    }
    if (error.status >= 500) {
      return 'The server encountered a temporary issue. Please verify backend API connectivity and try again in a moment.';
    }
    return sanitizeAuthErrorMessage(error.message) || fallback;
  }

  if (error instanceof Error && error.message) {
    if (/sign in required/i.test(error.message)) {
      return 'Your session has expired. Please sign in again to continue.';
    }
    if (/forbidden|permission|access denied|not authorized/i.test(error.message)) {
      return 'Access denied (Forbidden). Your current account role does not have permission to perform this action. Please sign in with an administrator account or request user management permissions from your manager.';
    }
    if (/fetch failed|ECONNREFUSED|ENOTFOUND|network/i.test(error.message)) {
      return 'Cannot connect to the backend API server. Please make sure the API service is running.';
    }
    return sanitizeAuthErrorMessage(error.message) || fallback;
  }

  return fallback;
}

function readStructuredErrorCode(detail: ApiErrorPayload['detail']): string | null {
  if (!detail || typeof detail !== 'object' || Array.isArray(detail)) return null;
  if (!('code' in detail) || typeof detail.code !== 'string') return null;
  return detail.code;
}

function readStructuredErrorMessage(detail: ApiErrorPayload['detail']): string | null {
  if (!detail || typeof detail !== 'object' || Array.isArray(detail)) return null;
  if (!('message' in detail) || typeof detail.message !== 'string') return null;
  return detail.message.trim() || null;
}

/** Return an actionable message when the account must complete first-login setup. */
export function getFirstLoginActionMessage(error: unknown): string | null {
  if (!(error instanceof ApiRequestError)) return null;

  const code = readStructuredErrorCode(error.details);
  const message = `${code ?? ''} ${readStructuredErrorMessage(error.details) ?? ''} ${error.message}`;
  if (code === 'FIRST_LOGIN_ACTION_REQUIRED' || /password change is required/i.test(message)) {
    return readStructuredErrorMessage(error.details) ?? 'Please change your password to continue.';
  }

  return null;
}

/** Return actionable copy for missing organization/company tenancy context. */
export function getTenancyContextErrorMessage(error: unknown): string | null {
  if (!(error instanceof ApiRequestError)) return null;

  const code = readStructuredErrorCode(error.details);
  if (code === 'ORGANISATION_CONTEXT_REQUIRED') {
    return 'Organization context is required. Sign in with your organization domain and try again.';
  }
  if (code === 'COMPANY_CONTEXT_REQUIRED') {
    return 'Company context is required. Select a company or branch and try again.';
  }

  return null;
}

/** Convert server/API failures into safe copy for a route-level error boundary. */
export function getUserFacingErrorMessage(
  error: unknown,
  fallback = 'We could not load this page. Please try again.',
): string {
  const status =
    error instanceof ApiRequestError
      ? error.status
      : typeof error === 'object' && error !== null && 'status' in error
        ? Number((error as { status?: unknown }).status)
        : undefined;

  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return 'You do not have permission to view this page.';
  if (status === 404) return 'We could not find the page you requested.';
  if (status === 408 || status === 429) {
    return 'The request took too long or was rate-limited. Please try again.';
  }
  if (typeof status === 'number' && status >= 500) {
    return 'The service is temporarily unavailable. Please try again shortly.';
  }

  if (error instanceof ApiRequestError) {
    const validation = formatApiValidationDetails(error.details);
    if (validation) return validation;
  }

  if (
    error instanceof Error &&
    /fetch failed|ECONNREFUSED|ENOTFOUND|network/i.test(error.message)
  ) {
    return 'We could not reach the service. Check your connection and try again.';
  }

  return fallback;
}

function sanitizeAuthErrorMessage(message: string) {
  if (/internal server error/i.test(message)) {
    return '';
  }

  // Never echo infra/env var names into client-facing errors.
  if (/BACKEND_API_URL|API_URL|NEXT_PUBLIC_/i.test(message)) {
    return 'Cannot reach the API server. Check that the service is running and try again.';
  }

  if (/unable to reach the api/i.test(message) || NETWORK_ERROR_PATTERN.test(message)) {
    return '';
  }

  return message;
}

type PlatformLoginErrorMessages = Readonly<{
  invalidCredentials: string;
  unavailable: string;
  default: string;
}>;

export function getPlatformLoginErrorMessage(
  error: ApiRequestError,
  messages: PlatformLoginErrorMessages,
) {
  if (error.status === 401 || error.status === 403) {
    return messages.invalidCredentials;
  }

  if (
    error.status === 408 ||
    error.status === NETWORK_API_STATUS ||
    error.status >= 500 ||
    /internal server error/i.test(error.message)
  ) {
    return messages.unavailable;
  }

  return sanitizeAuthErrorMessage(error.message) || messages.default;
}

export function getAuthRouteStatus(error: ApiRequestError) {
  if (error.status >= 500) {
    return 503;
  }

  if (error.status === 401 || error.status === 403) {
    return error.status;
  }

  return error.status >= 400 && error.status < 500 ? error.status : 400;
}
