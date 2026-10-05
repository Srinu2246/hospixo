/**
 * Shared helpers for Users & Roles BFF routes (`/api/users`, `/api/invitations`).
 *
 * Integrated:
 * - Auth gate via httpOnly session cookie → Bearer token for backend
 * - withCallerScope fills company_id / branch_id from the signed-in user
 *   (avoids 400 "Invalid role, scope, or payload" / "requires branch_id")
 * - usersApiError maps ApiRequestError → JSON { success: false, message }
 */

import type { NextResponse } from 'next/server';

import { ApiRequestError, getUserFriendlyErrorMessage } from '@/lib/api/errors';
import { jsonError, jsonOk } from '@/lib/api/route-response';
import { BRANCH_ROLES, COMPANY_ROLES, ORG_ROLES, hasAnyRole } from '@/lib/auth/access-level';
import { getServerAuthSession } from '@/lib/auth/session';
import { getServerToken } from '@/server/auth';

/** Require session cookie; returns token or a 401 response. */
export async function requireAccessToken(): Promise<
  { token: string; error: null } | { token: null; error: NextResponse }
> {
  const token = await getServerToken();
  if (!token) {
    return { token: null, error: jsonError('Sign in required.', 401) };
  }
  return { token, error: null };
}

function isOrgRole(roleCode: unknown): boolean {
  if (typeof roleCode !== 'string' || !roleCode) return false;
  return [
    'org_admin',
    'organisation_admin',
    'organization_admin',
    'tenant_admin',
    'platform_admin',
  ].includes(roleCode);
}

function isCompanyRole(roleCode: unknown): boolean {
  if (typeof roleCode !== 'string' || !roleCode) return false;
  return ['company_admin', 'company_manager'].includes(roleCode);
}

/** Hierarchy roles allowed to create/edit/delete roles or change role status. */
const MANAGE_ROLES_ALLOWED_ROLES = [...ORG_ROLES, ...COMPANY_ROLES, ...BRANCH_ROLES];

/**
 * Require a session token *and* an org/company/branch admin role.
 * Gates role & permission mutations — operational roles (cashier, kitchen,
 * captain, plain staff) authenticate fine but can't manage roles.
 */
export async function requireManageRolesAccess(): Promise<
  { token: string; error: null } | { token: null; error: NextResponse }
> {
  const auth = await requireAccessToken();
  if (auth.error) return auth;

  const session = await getServerAuthSession();
  if (!session?.user || !hasAnyRole(session.user.roles, MANAGE_ROLES_ALLOWED_ROLES)) {
    return { token: null, error: jsonError("You don't have permission to manage roles.", 403) };
  }

  return { token: auth.token, error: null };
}

/**
 * Enrich create/invite body with tenancy from the caller session or explicit body inputs.
 * - Org-scoped roles: company_id = null, branch_id = null
 * - Company-scoped roles: company_id from body or session, branch_id = null
 * - Branch-scoped roles: company_id and branch_id from body or session
 */
export async function withCallerScope<T extends Record<string, unknown>>(body: T): Promise<T> {
  const session = await getServerAuthSession();
  if (!session?.user) return body;

  const roleCode = body.role_code;
  const isOrg = isOrgRole(roleCode);
  const isCompany = isCompanyRole(roleCode);

  if (isOrg) {
    return {
      ...body,
      company_id: null,
      branch_id: null,
    };
  }

  const companyId = body.company_id ?? session.user.company_id ?? null;
  const branchId = isCompany ? null : (body.branch_id ?? session.user.branch_id ?? null);

  return {
    ...body,
    company_id: companyId,
    branch_id: branchId,
  };
}

/** Map backend/lib errors to BFF JSON responses. */
export function usersApiError(err: unknown, fallback: string) {
  const message = getUserFriendlyErrorMessage(err, fallback);
  if (err instanceof ApiRequestError) {
    const status = err.status >= 400 && err.status < 600 ? err.status : 502;
    return jsonError(message, status);
  }
  return jsonError(message, 500);
}

export { jsonError, jsonOk };
