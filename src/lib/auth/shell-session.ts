import 'server-only';

import { readLoginUser } from '@/lib/schemas/login/loginFormSchema';
import { parseSidebarSession, sessionFromLoginUser, type SidebarSession } from '@/lib/auth/session';

export const PROFILE_COOKIE = 'hospixo_profile';
export const SESSION_COOKIE = 'session';

type CookieStore = {
  get: (name: string) => { value: string } | undefined;
};

export function readShellSession(cookieStore: CookieStore): SidebarSession | null {
  const profile = cookieStore.get(PROFILE_COOKIE)?.value;
  if (profile) {
    const session = parseSidebarSession(profile);
    if (session) return session;
  }

  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return sessionFromAccessToken(token);
}

export function profileCookieValue(payload: unknown): string | null {
  const account = readLoginUser(payload);
  if (!account) return null;
  return JSON.stringify(sessionFromLoginUser(account));
}

function sessionFromAccessToken(token: string): SidebarSession | null {
  const claims = decodeJwtPayload(token);
  if (!claims) return null;

  const nested = isRecord(claims.user) ? claims.user : claims;
  const roles = readStrings(nested.roles) ?? readStrings(claims.roles) ?? [];
  const scope = readString(nested.scope) ?? readString(claims.scope) ?? '';
  const role = roles[0] || scope;
  if (!role) return null;

  const firstName = readString(nested.first_name) ?? readString(claims.first_name) ?? '';
  const lastName = readString(nested.last_name) ?? readString(claims.last_name);
  const email = readString(nested.email) ?? readString(claims.email);
  const name = [firstName, lastName].filter(Boolean).join(' ') || readString(claims.name) || '';

  return sessionFromLoginUser({
    id: readNumber(nested.id) ?? readNumber(claims.sub) ?? 0,
    first_name: firstName || name || 'User',
    last_name: lastName,
    email,
    scope: scope || role,
    roles: roles.length > 0 ? roles : [role],
    company_id: readNumber(nested.company_id) ?? readNumber(claims.company_id),
    branch_id: readNumber(nested.branch_id) ?? readNumber(claims.branch_id),
    org_id: readNumber(nested.org_id) ?? readNumber(claims.org_id),
  });
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const parsed: unknown = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value ? value : undefined;
}

function readNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value && Number.isFinite(Number(value))) return Number(value);
  return undefined;
}

function readStrings(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const strings = value.filter(
    (item): item is string => typeof item === 'string' && item.length > 0,
  );
  return strings.length > 0 ? strings : undefined;
}
