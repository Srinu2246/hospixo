import type { LoginUser } from '@/lib/schemas/login/loginFormSchema';
import {
  normalizeRoleKey,
  rolePathSegment,
  type SidebarContext,
  type SidebarUserProfile,
} from '@/app/sidebar';

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
      companyId: account.company_id ?? undefined,
      branchId: account.branch_id ?? undefined,
    },
  };
}

export function homePathForRole(role: string): string {
  const key = normalizeRoleKey(role);
  const segment = rolePathSegment(role);
  if (key === 'waiter') return `/${segment}/pos/captain-flow`;
  if (key === 'company') return '/company/dashboard';
  if (key === 'organization' || key === 'super_admin') return '/organization/dashboard';
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
