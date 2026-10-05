import { NextResponse } from 'next/server';

import { getApiErrorMessage } from '@/lib/api/errors';

export type JsonResponseOptions = Readonly<{
  message?: string;
  status?: number;
  /** Extra top-level JSON fields (e.g. `source: "fallback"`). */
  meta?: Record<string, unknown>;
}> &
  Omit<ResponseInit, 'status'>;

function withJsonContentType(headers?: HeadersInit): Headers {
  const next = new Headers(headers);
  if (!next.has('Content-Type')) {
    next.set('Content-Type', 'application/json; charset=utf-8');
  }
  return next;
}

/** Standard BFF success envelope: `{ success: true, data, message? }`. */
export function jsonOk<T>(data: T, options?: JsonResponseOptions) {
  const { message, status = 200, meta, ...init } = options ?? {};
  const body: Record<string, unknown> = { success: true, data };
  if (message !== undefined) body.message = message;
  if (meta) Object.assign(body, meta);

  return NextResponse.json(body, {
    ...init,
    status,
    headers: withJsonContentType(init.headers),
  });
}

/** List endpoints — `{ success: true, data: { items, total }, message? }`. */
export function jsonListOk<T>(
  items: readonly T[],
  options?: JsonResponseOptions & Readonly<{ total?: number }>,
) {
  const { total, ...responseOptions } = options ?? {};
  return jsonOk(
    {
      items,
      total: total ?? items.length,
    },
    responseOptions,
  );
}

/** Standard BFF error envelope: `{ success: false, message }`. */
export function jsonError(
  error: unknown,
  status = 400,
  options?: Omit<JsonResponseOptions, 'status'>,
) {
  const message = typeof error === 'string' ? error : getApiErrorMessage(error);
  const { message: overrideMessage, ...init } = options ?? {};

  return NextResponse.json(
    {
      success: false,
      message: overrideMessage ?? message,
    },
    {
      ...init,
      status,
      headers: withJsonContentType(init.headers),
    },
  );
}
