import type { LoginUser } from '@/lib/schemas/login/loginFormSchema';
import {
  normalizeRoleKey,
  rolePathSegment,
  type SidebarContext,
  type SidebarUserProfile,
} from '@/app/sidebar';
import { waiterWorkspaceHomePath } from '@/lib/helpers/waiterWorkspaceNav';

const STORAGE_KEY = 'hospixo.sidebar.session';

export type SidebarSession = {
  role: string;
  context: SidebarContext;
  user: SidebarUserProfile;
  account?: LoginUser;
};

export function sessionFromLoginUser(account: LoginUser): SidebarSession {
  const role = account.roles[0] || account.scope;
  const name = [account.first_name, account.last_name].filter(Boolean).join(' ').trim();
  const rawAccount = account as Record<string, unknown>;
  const orgName =
    (typeof rawAccount.organization_name === 'string' && rawAccount.organization_name.trim()) ||
    (typeof rawAccount.org_name === 'string' && rawAccount.org_name.trim()) ||
    undefined;
  const compName =
    typeof rawAccount.company_name === 'string' && rawAccount.company_name.trim()
      ? rawAccount.company_name.trim()
      : undefined;
  const branchName =
    typeof rawAccount.branch_name === 'string' && rawAccount.branch_name.trim()
      ? rawAccount.branch_name.trim()
      : undefined;

  return {
    role,
    account,
    user: {
      name: name || account.email || 'User',
      role: displayRole(role),
      email: account.email ?? undefined,
    },
    context: {
      organizationId: account.org_id ?? undefined,
      ...(orgName ? { organizationName: orgName } : {}),
      companyId: account.company_id ?? undefined,
      ...(compName ? { companyName: compName } : {}),
      branchId: account.branch_id ?? undefined,
      ...(branchName ? { branchName } : {}),
    },
  };
}

/** First landing route per role — matches the first sidebar item (like Dashboard for managers). */
export function homePathForRole(role: string): string {
  const key = normalizeRoleKey(role);
  const segment = rolePathSegment(role);

  // Captain / waiter → first entry in CAPTAIN_WORKSPACE_NAV (Tables)
  if (key === 'waiter') return waiterWorkspaceHomePath(segment);
  // Kitchen staff → Kitchen Display (first KITCHEN_SIDEBAR item)
  if (key === 'kitchen') return `/${segment}/management/kitchen-display`;
  // Chef → full-screen KDS (same screen, no sidebar)
  if (key === 'chef') return `/${segment}/management/kitchen-display`;
  // Cashier → New Order (VERSION_1: dashboard nav deferred)
  if (key === 'cashier') return `/${segment}/pos/point-of-sale/tables`;
  if (key === 'company') return '/company/dashboard';
  if (key === 'organization' || key === 'super_admin') return '/organization/dashboard';
  // Branch manager and other branch-scoped roles → Dashboard
  return `/${segment}/dashboard`;
}

export function parseSidebarSession(raw: string): SidebarSession | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isSidebarSession(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function readSidebarSession(): SidebarSession | null {
  if (typeof window === 'undefined') return null;

  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  return parseSidebarSession(raw);
}

/**
 * The profile cookie is written at login and does not include a branch chosen
 * later in the navbar. Keep that saved branch when the shell session is reapplied
 * on reload, so screens wait on the floors request instead of a missing-branch error.
 */
export function sessionWithStoredBranch(session: SidebarSession): SidebarSession {
  const stored = readSidebarSession();
  if (!stored || stored.role !== session.role) return session;

  const sameCompany =
    stored.context.companyId == null ||
    session.context.companyId == null ||
    stored.context.companyId === session.context.companyId;
  const sameOrganization =
    stored.context.organizationId == null ||
    session.context.organizationId == null ||
    stored.context.organizationId === session.context.organizationId;
  if (!sameCompany || !sameOrganization) return session;
  if (stored.context.branchId == null) return session;

  return {
    ...session,
    context: {
      ...session.context,
      branchId: stored.context.branchId,
      branchName: stored.context.branchName ?? session.context.branchName,
      branchSlug: stored.context.branchSlug ?? session.context.branchSlug,
    },
  };
}

export function writeSidebarSession(session: SidebarSession): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSidebarSession(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}

function displayRole(role: string): string {
  const key = normalizeRoleKey(role);
  if (key === 'branch_manager') return 'Branch manager';
  if (key === 'waiter') return 'Captain';
  if (key === 'cashier') return 'Cashier';
  if (key === 'kitchen') return 'Kitchen staff';
  if (key === 'chef') return 'Chef';
  if (key === 'company') return 'Company admin';
  if (key === 'organization') return 'Organisation admin';
  if (key === 'super_admin') return 'Super admin';
  return role.replace(/[_-]+/g, ' ');
}

function isSidebarSession(value: unknown): value is SidebarSession {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  const user = record.user;
  return (
    typeof record.role === 'string' &&
    record.context !== null &&
    typeof record.context === 'object' &&
    user !== null &&
    typeof user === 'object' &&
    typeof (user as Record<string, unknown>).name === 'string' &&
    typeof (user as Record<string, unknown>).role === 'string'
  );
}
