import { apiFetch } from '@/lib/api/http';
import { getServerApiBaseUrl } from '@/lib/api/config';
import { apiPaths } from '@/lib/api/paths';
import type {
  AuthToken,
  LoginInput,
  PinLoginInput,
  PlatformLoginInput,
  RegisterInput,
  RegistrationResult,
  TokenUserInfo,
} from '@/types/platform-auth';

/** Backend auth API paths — all called server-side via apiFetch. */
const authPaths = apiPaths.auth;

/** Auth endpoints can be slow on cold start; use a longer timeout than default API calls. */
const AUTH_REQUEST_TIMEOUT_MS = 30_000;

function withBaseUrl(token?: string | null) {
  return {
    baseUrl: getServerApiBaseUrl(),
    token,
  };
}

async function postAuth<T>(path: string, body: unknown) {
  return apiFetch<T>(path, {
    ...withBaseUrl(),
    method: 'POST',
    body,
    timeoutMs: AUTH_REQUEST_TIMEOUT_MS,
  });
}

export async function loginWithEmail(input: LoginInput) {
  const data = await postAuth<Record<string, unknown>>(authPaths.login, input);
  return normalizeLoginToken(data);
}

/**
 * @description Performs a platform login
 * @param input - The input to perform the platform login
 * @returns The token user info
 */

export async function loginWithPlatform(input: PlatformLoginInput) {
  const data = await postAuth<Record<string, unknown>>(authPaths.platformLogin, input);
  return normalizePlatformAuthToken(data);
}

export async function loginWithPin(input: PinLoginInput) {
  const data = await postAuth<Record<string, unknown>>(authPaths.pinLogin, input);
  return normalizeLoginToken(data);
}

export async function registerOrganization(input: RegisterInput) {
  return postAuth<RegistrationResult>(authPaths.register, input);
}

/** Backend `/me` may return the user flat or nested under `user`. */
export function extractUserPayload(data: Record<string, unknown>): Record<string, unknown> {
  const nested = asRecord(data.user);
  return nested ?? data;
}

export async function fetchCurrentUser(token: string) {
  const data = await apiFetch<Record<string, unknown>>(authPaths.me, {
    ...withBaseUrl(token),
    timeoutMs: AUTH_REQUEST_TIMEOUT_MS,
  });

  return extractUserPayload(data);
}

export type LogoutBody = Readonly<{
  refresh_token?: string;
  revoke_all?: boolean;
}>;

/** Build the logout JSON body from a stored refresh token. */
export function buildLogoutBody(refreshToken?: string | null): LogoutBody {
  const token = refreshToken?.trim();
  if (token) {
    return { refresh_token: token, revoke_all: false };
  }
  return { revoke_all: true };
}

export async function logoutSession(accessToken: string, body?: LogoutBody) {
  return apiFetch<{ message: string }>(authPaths.logout, {
    ...withBaseUrl(accessToken),
    method: 'POST',
    body: body ?? { revoke_all: true },
    timeoutMs: AUTH_REQUEST_TIMEOUT_MS,
  });
}

export type ChangePasswordInput = Readonly<{
  current_password: string;
  new_password: string;
}>;

export async function changePassword(token: string, input: ChangePasswordInput) {
  return apiFetch<{ message: string }>(authPaths.changePassword, {
    ...withBaseUrl(token),
    method: 'POST',
    body: input,
  });
}

function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
}

function asOptionalString(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function roleName(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  const record = asRecord(value);
  if (!record) return null;
  const name = record.name ?? record.code ?? record.role ?? record.role_code ?? record.role_name;
  return typeof name === 'string' && name.trim() ? name.trim() : null;
}

function extractRoles(user: Record<string, unknown>): string[] {
  const roles = new Set<string>();

  for (const candidate of [user.roles, user.user_roles, user.permissions]) {
    if (!Array.isArray(candidate)) continue;
    for (const item of candidate) {
      const name = roleName(item);
      if (name) roles.add(name);
    }
  }

  const singleRole = roleName(user.role);
  if (singleRole) roles.add(singleRole);

  return [...roles];
}

function extractScope(user: Record<string, unknown>): string {
  const scope = asString(user.scope).trim();
  if (scope) return scope;

  if (user.is_platform_admin === true || user.is_staff === true || user.is_superuser === true) {
    return 'platform';
  }

  const userType = asString(user.user_type ?? user.type)
    .trim()
    .toLowerCase();
  if (
    userType.includes('platform') ||
    userType.includes('admin') ||
    userType === 'staff' ||
    userType === 'superuser'
  ) {
    return 'platform';
  }

  return '';
}

function normalizeAuthToken(data: Record<string, unknown>, user: TokenUserInfo): AuthToken {
  const refresh_token = asOptionalString(data.refresh_token) ?? undefined;

  return {
    access_token: asString(data.access_token),
    ...(refresh_token ? { refresh_token } : {}),
    token_type: asString(data.token_type, 'Bearer'),
    expires_in: Number(data.expires_in ?? 3600),
    user,
  };
}

function normalizeLoginToken(data: Record<string, unknown>): AuthToken {
  const userRecord = asRecord(data.user) ?? data;
  return normalizeAuthToken(data, normalizeUser(userRecord));
}

/** Platform-login is staff-only on the backend; normalize common response-shape gaps. */
function normalizePlatformAuthToken(data: Record<string, unknown>): AuthToken {
  const userRecord = asRecord(data.user) ?? {};
  let user = normalizeUser(userRecord);

  if (!user.scope.trim() && user.roles.length === 0) {
    user = { ...user, scope: 'platform' };
  }

  return normalizeAuthToken(data, user);
}

function extractOrgId(user: Record<string, unknown>): number {
  const org = asRecord(user.organization ?? user.org);
  const candidate =
    user.org_id ??
    user.organization_id ??
    user.orgId ??
    user.organizationId ??
    user.tenant_id ??
    user.tenantId ??
    org?.id;
  if (candidate != null && candidate !== '') {
    const num = Number(candidate);
    return Number.isFinite(num) && num > 0 ? num : 0;
  }
  return 0;
}

function extractCompanyId(user: Record<string, unknown>): number | null {
  const comp = asRecord(user.company);
  const candidate = user.company_id ?? user.companyId ?? comp?.id;
  if (candidate != null && candidate !== '') {
    const num = Number(candidate);
    return Number.isFinite(num) && num > 0 ? num : null;
  }
  return null;
}

function extractBranchIdFromRoleAssignments(user: Record<string, unknown>): number | null {
  for (const candidate of [user.roles, user.user_roles, user.role_assignments]) {
    if (!Array.isArray(candidate)) continue;

    for (const item of candidate) {
      const record = asRecord(item);
      if (!record) continue;

      const scope = asString(record.scope).trim().toLowerCase();
      if (scope && scope !== 'branch') continue;

      const scopeId = record.scope_id ?? record.branch_id ?? record.scopeId;
      if (scopeId == null || scopeId === '') continue;

      const num = Number(scopeId);
      if (Number.isFinite(num) && num > 0) return num;
    }
  }

  return null;
}

function extractBranchId(user: Record<string, unknown>): number | null {
  const branch = asRecord(user.branch);
  const direct = user.branch_id ?? user.branchId ?? branch?.id;
  if (direct != null && direct !== '') {
    const num = Number(direct);
    if (Number.isFinite(num) && num > 0) return num;
  }

  const branches = user.branches;
  if (Array.isArray(branches) && branches.length > 0) {
    const entries = branches
      .map((entry) => asRecord(entry))
      .filter((entry): entry is Record<string, unknown> => entry != null);

    const active = entries.find((entry) => entry.is_active !== false) ?? entries[0] ?? null;
    if (active) {
      const fromAssignment = active.branch_id ?? active.id;
      if (fromAssignment != null && fromAssignment !== '') {
        const num = Number(fromAssignment);
        if (Number.isFinite(num) && num > 0) return num;
      }
    }
  }

  return extractBranchIdFromRoleAssignments(user);
}

export function normalizeUser(user: Record<string, unknown>): TokenUserInfo {
  return {
    id: Number(user.id ?? user.user_id ?? 0),
    first_name: asString(user.first_name),
    last_name: asOptionalString(user.last_name),
    email: asOptionalString(user.email),
    scope: extractScope(user),
    roles: extractRoles(user),
    company_id: extractCompanyId(user),
    branch_id: extractBranchId(user),
    org_id: extractOrgId(user),
    must_change_password: user.must_change_password === true,
  };
}

export function registrationToAuthToken(
  result: RegistrationResult,
  user: TokenUserInfo,
): AuthToken {
  return {
    access_token: result.access_token,
    token_type: result.token_type,
    expires_in: result.expires_in,
    user,
  };
}
