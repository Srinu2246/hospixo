import { z } from 'zod';

/**
 * Single source of truth for server-side environment configuration.
 *
 * - Validated once via zod, then memoised.
 * - Throws at startup (via `instrumentation.ts`) when production env is incomplete.
 * - Server-only secrets (e.g. API_URL) MUST NOT be referenced through
 *   `NEXT_PUBLIC_*` aliases.
 */

/** Vercel/dashboard empty strings must not fail `z.url()` validation. */
const optionalUrl = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.url().optional(),
);

const ServerEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_ENV: z.enum(['development', 'staging', 'production']).optional(),
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']).optional(),
  NEXT_PUBLIC_SITE_URL: optionalUrl,
  NEXT_PUBLIC_API_URL: optionalUrl,
  API_URL: optionalUrl,
  BACKEND_API_URL: optionalUrl,
  VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),
});

export type ResolvedEnv = {
  readonly nodeEnv: 'development' | 'test' | 'production';
  readonly appEnv: 'development' | 'staging' | 'production';
  readonly siteUrl: string | null;
  readonly apiUrl: string | null;
  readonly publicApiUrl: string | null;
  readonly isProduction: boolean;
  readonly isPreview: boolean;
};

let cached: ResolvedEnv | undefined;

type ParsedServerEnv = z.infer<typeof ServerEnvSchema>;

/**
 * Prefer explicit APP_ENV; on Vercel Preview never infer "production" from
 * NODE_ENV alone (Preview builds run with NODE_ENV=production).
 */
function resolveAppEnv(env: ParsedServerEnv, isPreview: boolean): ResolvedEnv['appEnv'] {
  if (env.APP_ENV) {
    return env.APP_ENV;
  }
  if (env.NEXT_PUBLIC_APP_ENV) {
    return env.NEXT_PUBLIC_APP_ENV;
  }
  if (isPreview) {
    return 'staging';
  }
  if (env.NODE_ENV === 'production') {
    return 'production';
  }
  return 'development';
}

export function getServerEnv(): ResolvedEnv {
  if (cached) return cached;

  const parsed = ServerEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || '<root>'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration: ${issues}`);
  }

  const env = parsed.data;
  const isPreview = env.VERCEL_ENV === 'preview';
  const appEnv = resolveAppEnv(env, isPreview);
  const isProduction = appEnv === 'production' && env.VERCEL_ENV !== 'preview';

  // Only enforce on real production deploys. Local `next build` sets
  // NODE_ENV=production without VERCEL_ENV — marketing/web must still build.
  if (env.VERCEL_ENV === 'production' && !env.API_URL && !env.BACKEND_API_URL) {
    throw new Error('API_URL or BACKEND_API_URL must be set when VERCEL_ENV is production');
  }

  const resolved: ResolvedEnv = {
    nodeEnv: env.NODE_ENV,
    appEnv,
    siteUrl: env.NEXT_PUBLIC_SITE_URL ?? null,
    apiUrl: env.API_URL ?? env.BACKEND_API_URL ?? null,
    publicApiUrl: env.NEXT_PUBLIC_API_URL ?? null,
    isProduction,
    isPreview,
  };

  cached = resolved;
  return resolved;
}

/** Test helper — clears the memoised env resolution. */
export function resetServerEnvCache() {
  cached = undefined;
}
