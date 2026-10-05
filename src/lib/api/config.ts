import { getServerEnv } from '@/lib/env';
import { logger } from '@/lib/logger';

const DEFAULT_DEV_API_URL = 'https://dev-api.hospixo.com';

let loggedServerApiConfig = false;

/**
 * Server-only backend base URL for BFF → backend calls.
 * Prefer API_URL (validated in getServerEnv), then BACKEND_API_URL
 * (documented for apps/platform), then NEXT_PUBLIC_API_URL, then dev default.
 */
export function getServerApiBaseUrl(): string {
  const baseUrl = resolveServerApiBaseUrl();

  logServerApiConfigOnce(baseUrl);

  return baseUrl;
}

/** True when an explicit API URL is configured (not the dev default). */
export function isBackendApiConfigured(): boolean {
  const env = getServerEnv();
  const backendApiUrl = process.env.BACKEND_API_URL?.trim() || null;

  return Boolean(env.apiUrl ?? backendApiUrl ?? env.publicApiUrl);
}

function resolveServerApiBaseUrl(): string {
  const env = getServerEnv();
  const backendApiUrl = process.env.BACKEND_API_URL?.trim() || null;
  const configured = env.apiUrl ?? backendApiUrl ?? env.publicApiUrl;

  if (configured) {
    return configured;
  }

  return DEFAULT_DEV_API_URL;
}

/** Log resolved API base URL once per process (dev/test only). */
export function logServerApiConfigOnce(baseUrl?: string, appName?: string): void {
  if (loggedServerApiConfig || process.env.NODE_ENV === 'production') {
    return;
  }

  loggedServerApiConfig = true;

  const resolved = baseUrl ?? getServerApiBaseUrlWithoutLogging();
  const configuredBackend = process.env.BACKEND_API_URL?.trim() || null;
  const configuredApi = process.env.API_URL?.trim() || null;

  logger.app.info('resolved backend API base URL', {
    app: appName ?? 'unknown',
    baseUrl: resolved,
    source: configuredApi
      ? 'API_URL'
      : configuredBackend
        ? 'BACKEND_API_URL'
        : process.env.NEXT_PUBLIC_API_URL?.trim()
          ? 'NEXT_PUBLIC_API_URL'
          : 'default',
  });
}

function getServerApiBaseUrlWithoutLogging(): string {
  return resolveServerApiBaseUrl();
}

/** Test helper — allows startup logging to run again. */
export function resetServerApiConfigLog() {
  loggedServerApiConfig = false;
}

export function getPublicApiBaseUrl(): string {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  return DEFAULT_DEV_API_URL;
}
