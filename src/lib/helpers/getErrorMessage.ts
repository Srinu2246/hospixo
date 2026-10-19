import { ApiError } from '@/services/api/types';

/**
 * Resolve a user-facing message from an API error or raw backend payload.
 * Supports shapes like:
 * `{ "detail": { "code": "BUSINESS_DAY_NOT_OPEN", "message": "..." } }`
 * `{ "detail": { "code": "TABLE_ALREADY_HAS_OPEN_ORDER" } }` (code-only)
 * `{ "message": "..." }`, `{ "detail": "..." }`, `{ "error": "..." }`
 */
export function getErrorMessage(error: unknown, fallback = 'Request failed'): string {
  if (error instanceof ApiError) {
    return (
      extractMessage(error.details) ??
      humanizeErrorCode(error.code ?? extractCode(error.details)) ??
      (isGenericStatusMessage(error.message) ? null : error.message.trim() || null) ??
      fallback
    );
  }

  const fromPayload = extractMessage(error);
  if (fromPayload) return fromPayload;

  const fromCode = humanizeErrorCode(extractCode(error));
  if (fromCode) return fromCode;

  if (error instanceof Error && error.message.trim() && !isGenericStatusMessage(error.message)) {
    return error.message.trim();
  }
  return fallback;
}

/** Success toast copy from a typical `{ message }` envelope. */
export function getSuccessMessage(
  payload: unknown,
  fallback = 'Request completed successfully.',
): string {
  const message = extractMessage(payload);
  if (!message) return fallback;
  if (message.toUpperCase() === 'OK') return fallback;
  return message;
}

export function extractMessage(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (!value || typeof value !== 'object') return null;

  const record = value as Record<string, unknown>;

  if (typeof record.message === 'string' && record.message.trim()) return record.message.trim();
  if (typeof record.error === 'string' && record.error.trim()) return record.error.trim();
  if (typeof record.title === 'string' && record.title.trim()) return record.title.trim();

  if (typeof record.detail === 'string' && record.detail.trim()) return record.detail.trim();

  if (record.detail && typeof record.detail === 'object' && !Array.isArray(record.detail)) {
    const detail = record.detail as Record<string, unknown>;
    if (typeof detail.message === 'string' && detail.message.trim()) return detail.message.trim();
    if (typeof detail.error === 'string' && detail.error.trim()) return detail.error.trim();
    // Code-only detail: `{ "detail": { "code": "TABLE_ALREADY_HAS_OPEN_ORDER" } }`
    const fromDetailCode = humanizeErrorCode(
      typeof detail.code === 'string' ? detail.code : undefined,
    );
    if (fromDetailCode) return fromDetailCode;
  }

  if (Array.isArray(record.detail)) {
    const messages = record.detail
      .map((item) => {
        if (typeof item === 'string') return item;
        if (!item || typeof item !== 'object') return '';
        const row = item as Record<string, unknown>;
        if (typeof row.msg === 'string') return row.msg;
        if (typeof row.message === 'string') return row.message;
        return humanizeErrorCode(typeof row.code === 'string' ? row.code : undefined) ?? '';
      })
      .filter(Boolean);
    if (messages.length > 0) return messages.join(' ');
  }

  if (record.errors && typeof record.errors === 'object' && !Array.isArray(record.errors)) {
    const messages = Object.values(record.errors as Record<string, unknown>)
      .flatMap((entry) => (Array.isArray(entry) ? entry : [entry]))
      .map((entry) => (typeof entry === 'string' ? entry : ''))
      .filter(Boolean);
    if (messages.length > 0) return messages.join(' ');
  }

  return humanizeErrorCode(typeof record.code === 'string' ? record.code : undefined);
}

/** `TABLE_ALREADY_HAS_OPEN_ORDER` → `Table already has open order` */
export function humanizeErrorCode(code: string | undefined): string | null {
  if (!code?.trim()) return null;
  const normalized = code.trim().replace(/[_-]+/g, ' ').toLowerCase();
  if (!normalized) return null;
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function isGenericStatusMessage(message: string): boolean {
  return /^Request failed with status \d+$/i.test(message.trim());
}

export function extractCode(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Record<string, unknown>;
  if (typeof record.code === 'string' && record.code) return record.code;
  if (typeof record.error_code === 'string' && record.error_code) return record.error_code;
  if (record.detail && typeof record.detail === 'object' && !Array.isArray(record.detail)) {
    const detail = record.detail as Record<string, unknown>;
    if (typeof detail.code === 'string' && detail.code) return detail.code;
  }
  return undefined;
}
