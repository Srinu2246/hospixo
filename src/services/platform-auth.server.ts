import 'server-only';

import { cookies } from 'next/headers';
import { z } from 'zod';

import { loginWithEmail } from '@/lib/api/auth';
import { ApiRequestError, getApiErrorMessage } from '@/lib/api/errors';
import { setAccessTokenCookie } from '@/lib/auth/session';
import type { TokenUserInfo } from '@/types/platform-auth';
import type { PlatformLoginFieldErrors, PlatformLoginState } from '@/types/platform-login';

const credentialsSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
  domain: z.string().trim().min(1, 'Enter your organization domain.'),
});

export type PlatformLoginResult =
  { ok: true; redirectTo: string; user: TokenUserInfo } | { ok: false; state: PlatformLoginState };

function getDefaultDomain(): string | null {
  return (
    process.env.AUTH_DEFAULT_DOMAIN?.trim() ||
    process.env.NEXT_PUBLIC_AUTH_DEFAULT_DOMAIN?.trim() ||
    null
  );
}

export async function performPlatformLogin(
  email: string,
  password: string,
  domain: string,
): Promise<PlatformLoginResult> {
  const resolvedDomain = domain.trim() || getDefaultDomain() || '';
  const parsed = credentialsSchema.safeParse({ email, password, domain: resolvedDomain });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === 'email' || field === 'password' || field === 'domain') {
        fieldErrors[field] = issue.message;
      }
    }
    return {
      ok: false,
      state: {
        fieldErrors: fieldErrors as PlatformLoginFieldErrors,
        values: { email: email.trim().toLowerCase(), domain: domain.trim() },
      },
    };
  }

  try {
    const token = await loginWithEmail({
      email: parsed.data.email,
      password: parsed.data.password,
      domain: parsed.data.domain,
    });

    const cookieStore = await cookies();
    setAccessTokenCookie(cookieStore, token);

    return { ok: true, redirectTo: '/organisation', user: token.user };
  } catch (error) {
    return {
      ok: false,
      state: {
        error:
          error instanceof ApiRequestError
            ? getApiErrorMessage(error, 'Invalid email, password, or organization domain.')
            : 'Unable to sign in. Please try again.',
        values: {
          email: parsed.data.email.toLowerCase(),
          domain: parsed.data.domain,
        },
      },
    };
  }
}
