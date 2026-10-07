import 'server-only';

import { cookies } from 'next/headers';
import { z } from 'zod';

import { loginWithEmail } from '@/lib/api/auth';
import { ApiRequestError, getApiErrorMessage } from '@/lib/api/errors';
import { setAccessTokenCookie } from '@/lib/auth/session';
import { resolveDashboardHomePath } from '@/lib/auth/access-level';
import type { TokenUserInfo } from '@/types/platform-auth';
import type { LoginFieldErrors, LoginState } from '@/types/auth';

const credentialsSchema = z.object({
  identifier: z.string().trim().min(1, 'Enter your email or username.'),
  password: z.string().min(1, 'Password is required.'),
});

export type LoginResult =
  { ok: true; redirectTo: string; user: TokenUserInfo } | { ok: false; state: LoginState };

export async function performLogin(
  identifier: string,
  password: string,
  _domain?: string,
): Promise<LoginResult> {
  const parsed = credentialsSchema.safeParse({ identifier, password });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === 'identifier' || field === 'password') {
        fieldErrors[field] = issue.message;
      }
    }
    if (fieldErrors.identifier) {
      fieldErrors.email = fieldErrors.identifier;
    }
    return {
      ok: false,
      state: {
        fieldErrors: fieldErrors as LoginFieldErrors,
        values: {
          identifier: identifier.trim(),
          email: identifier.trim(),
        },
      },
    };
  }

  try {
    const token = await loginWithEmail({
      identifier: parsed.data.identifier,
      password: parsed.data.password,
    });

    const cookieStore = await cookies();
    setAccessTokenCookie(cookieStore, token);

    const redirectTo = resolveDashboardHomePath(token.user);
    return { ok: true, redirectTo, user: token.user };
  } catch (error) {
    return {
      ok: false,
      state: {
        error:
          error instanceof ApiRequestError
            ? getApiErrorMessage(error, 'Invalid email/username or password.')
            : 'Unable to sign in. Please try again.',
        values: {
          identifier: parsed.data.identifier,
          email: parsed.data.identifier,
        },
      },
    };
  }
}

export { performLogin as performPlatformLogin, performLogin as performClientLogin };
export type { LoginResult as PlatformLoginResult, LoginResult as ClientLoginResult };
