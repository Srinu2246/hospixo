import 'server-only';

import { cookies } from 'next/headers';
import { z } from 'zod';

import { adminLoginContent } from '@/constants/auth/login';
import { ADMIN_SESSION_COOKIE_NAME } from '@/constants/auth/session';
import type { LoginState } from '@/types/auth';

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export type AdminSession = Readonly<{
  email: string;
}>;

export type LoginResult = { ok: true; email: string } | { ok: false; state: LoginState };

/** Server route handler: validate credentials and return session email or field errors. */
export function performAdminLogin(email: string, password: string): LoginResult {
  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    const fieldErrors: LoginState['fieldErrors'] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === 'email' || field === 'password') {
        fieldErrors[field] = issue.message;
      }
    }
    return {
      ok: false,
      state: {
        fieldErrors,
        values: { email: email.trim().toLowerCase() },
      },
    };
  }

  if (parsed.data.password.length < 4) {
    return {
      ok: false,
      state: {
        error: adminLoginContent.errors.invalidCredentials,
        values: { email: parsed.data.email.toLowerCase() },
      },
    };
  }

  return { ok: true, email: parsed.data.email.toLowerCase() };
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const email = jar.get(ADMIN_SESSION_COOKIE_NAME)?.value?.trim();
  if (!email) return null;
  return { email };
}
