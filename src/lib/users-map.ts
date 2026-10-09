/**
 * Users & Roles — API ↔ UI mappers (integrated).
 *
 * Done:
 * - Create user payload  → POST /api/v1/users (UserCreateRequest)
 * - Invite payload       → POST /api/v1/invitations (InvitationCreateRequest)
 * - List/detail ApiUser  → Users table (TeamUser)
 * - Detail ApiUser       → Edit Staff form fields
 *
 * Scope notes:
 * - tenant_admin needs company_id only
 * - branch-scoped roles (branch_manager, cashier, …) also need a real branch_id
 * - UI template ids map to backend role_code via resolveRoleCode (roles-map)
 */

import { resolveRoleCode } from '@/lib/roles-map';
import type { TeamUser, UserRole, UserStatus } from '@/features/user-roles/config/users';
import type {
  ApiInvitation,
  ApiUser,
  ApiUserRoleAssignment,
  CreateUserInput,
  SendInvitationInput,
  UserStatus as ApiUserStatus,
} from '@/types/users';

type AddUserFormFields = Readonly<{
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phone: string;
  password: string;
  scope?: 'organisation' | 'company' | 'branch';
  branchId?: number | null;
  companyId?: number | null;
  /** Active org role code from GET /api/roles (Assign Role step). */
  roleCode?: string | null;
}>;

function resolveWizardRoleCode(
  user: Pick<AddUserFormFields, 'roleCode'>,
  templateId: string | null,
): string {
  const explicit = user.roleCode?.trim();
  if (explicit) return explicit;
  if (templateId) return resolveRoleCode(templateId);
  return 'staff';
}

function isOrgRole(roleCode: string): boolean {
  return [
    'org_admin',
    'organisation_admin',
    'organization_admin',
    'tenant_admin',
    'platform_admin',
  ].includes(roleCode);
}

function isCompanyRole(roleCode: string): boolean {
  return ['company_admin', 'company_manager'].includes(roleCode);
}

/** Build CreateUserInput from the Add User wizard (matches UserCreateRequest). */
export function buildCreateUserInput(
  user: AddUserFormFields,
  templateId: string | null,
): CreateUserInput {
  const role_code = resolveWizardRoleCode(user, templateId);

  const isOrg = isOrgRole(role_code) || user.scope === 'organisation';
  const isComp = isCompanyRole(role_code) || user.scope === 'company';

  return {
    email: user.email.trim(),
    username: user.username.trim(),
    password: user.password,
    first_name: user.firstName.trim(),
    last_name: user.lastName.trim() || null,
    phone: user.phone.trim() || null,
    role_code,
    company_id: isOrg ? null : (user.companyId ?? null),
    branch_id: isOrg || isComp ? null : (user.branchId ?? null),
  };
}

/** Build invitation payload (matches InvitationCreateRequest). */
export function buildSendInvitationInput(
  user: Pick<AddUserFormFields, 'email' | 'branchId' | 'companyId' | 'scope'> & {
    roleId?: number | string | null;
    roleCode?: string | null;
  },
  templateId: string | null,
): SendInvitationInput {
  const role_code = resolveWizardRoleCode(user, templateId);

  const isOrg = isOrgRole(role_code) || user.scope === 'organisation';
  const isComp = isCompanyRole(role_code) || user.scope === 'company';

  return {
    email: user.email.trim(),
    role_code,
    company_id: isOrg ? null : (user.companyId ?? null),
    branch_id: isOrg || isComp ? null : (user.branchId ?? null),
  };
}

const ROLE_LABELS: Record<string, string> = {
  tenant_admin: 'Tenant Admin',
  org_admin: 'Organisation Manager',
  organisation_admin: 'Organisation Manager',
  organization_admin: 'Organisation Manager',
  company_admin: 'Company Manager',
  company_manager: 'Company Manager',
  branch_manager: 'Branch Manager',
  branch_admin: 'Branch Manager',
  inventory: 'Inventory',
  cashier: 'Cashier',
  kitchen_staff: 'Kitchen Staff',
  staff: 'Staff',
};

/**
 * Map UI role label or role name → backend `role_code`.
 */
export function toApiRoleCode(role: string): string {
  const normalized = role
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  if (
    normalized === 'org_admin' ||
    normalized === 'organisation_manager' ||
    normalized === 'organization_manager' ||
    normalized === 'organisation_admin' ||
    normalized === 'organization_admin'
  ) {
    return 'org_admin';
  }
  if (normalized === 'company_manager' || normalized === 'company_admin') {
    return 'company_admin';
  }
  if (normalized === 'tenant_admin') {
    return 'tenant_admin';
  }
  if (
    normalized === 'branch_manager' ||
    normalized === 'branch_admin' ||
    normalized === 'store_manager'
  ) {
    return 'branch_manager';
  }
  if (normalized === 'kitchen_staff') {
    return 'kitchen_staff';
  }
  if (normalized === 'cashier') {
    return 'cashier';
  }
  if (normalized === 'inventory') {
    return 'inventory';
  }
  const fromDisplayName = normalized.replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
  if (fromDisplayName.length > 0) return fromDisplayName.slice(0, 50);
  return 'staff';
}

const AVATAR_COLORS = ['#2563EB', '#0F766E', '#7C3AED', '#C2410C', '#BE123C', '#0369A1'];

/**
 * Normalize `roles` from UserDetailResponse.
 * Backend returns `{ role_code, scope, … }[]`; older/list payloads may use string[].
 */
export function getRoleCodes(roles: ApiUser['roles'] | undefined): readonly string[] {
  if (!roles?.length) return [];

  return roles
    .map((role) => {
      if (typeof role === 'string') return role;
      return (role as ApiUserRoleAssignment).role_code;
    })
    .filter((code): code is string => Boolean(code));
}

/** Primary active branch id from detail payload (`branches[]` or `branch_id`). */
export function getPrimaryBranchId(user: ApiUser): number | null {
  if (user.branch_id != null) return user.branch_id;
  const active = user.branches?.find((b) => b.is_active) ?? user.branches?.[0];
  return active?.branch_id ?? null;
}

function formatRole(roles: readonly string[]): UserRole {
  const first = roles[0];
  if (!first) return 'Staff';
  return (ROLE_LABELS[first.toLowerCase()] ?? 'Staff') as UserRole;
}

function formatStatus(status: ApiUserStatus | string | null | undefined): UserStatus {
  const normalized = String(status ?? '')
    .trim()
    .toLowerCase();
  if (normalized === 'active') return 'active';
  if (
    normalized === 'pending' ||
    normalized === 'invited' ||
    normalized === 'sent' ||
    normalized === 'invite'
  ) {
    return 'invited';
  }
  if (normalized === 'disabled' || normalized === 'suspended' || normalized === 'inactive') {
    return 'disabled';
  }
  return 'disabled';
}

function formatLastActive(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatBranch(user: ApiUser): string {
  if (user.branch_name) return user.branch_name;
  const branchId = getPrimaryBranchId(user);
  if (branchId != null) return `Branch ${branchId}`;
  const companyName = (user as unknown as Record<string, unknown>).company_name;
  if (companyName) return `${String(companyName)} (All Branches)`;
  return 'All Branches';
}

function resolveUserScope(user: ApiUser): 'organisation' | 'company' | 'branch' {
  const primaryRole = user.roles?.[0];
  const roleScope = typeof primaryRole === 'object' && primaryRole ? primaryRole.scope : null;
  if (roleScope === 'branch' || user.branch_id != null) return 'branch';
  if (roleScope === 'company' || (user.company_id != null && user.branch_id == null))
    return 'company';
  return 'organisation';
}

/** Map list/detail ApiUser → Users & Roles table row (GET /api/v1/users). */
export function mapApiUserToTeamUser(user: ApiUser): TeamUser {
  const color = AVATAR_COLORS[Math.abs(user.id) % AVATAR_COLORS.length] ?? AVATAR_COLORS[0];
  const roleCodes = getRoleCodes(user.roles);
  const branchId = getPrimaryBranchId(user);
  const companyId = user.company_id ?? null;

  return {
    id: String(user.id),
    firstName: user.first_name || '—',
    lastName: user.last_name || '',
    email: user.email || '',
    phone: user.phone ?? undefined,
    role: formatRole(roleCodes),
    branch: formatBranch(user),
    scope: resolveUserScope(user),
    status: formatStatus(user.status),
    lastActive: formatLastActive(user.last_active_at ?? user.updated_at),
    avatarColor: color,
    branchId,
    companyId,
  };
}

function capitalizeNamePart(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function nameFromEmail(email: string): { firstName: string; lastName: string } {
  const local = email.split('@')[0]?.trim() || 'Invited';
  const parts = local.split(/[._-]+/).filter(Boolean);
  const firstName = parts[0] ? capitalizeNamePart(parts[0]) : 'Invited';
  const lastName = parts.slice(1).map(capitalizeNamePart).join(' ');
  return { firstName, lastName };
}

const CLOSED_INVITATION_STATUSES = new Set([
  'accepted',
  'rejected',
  'cancelled',
  'canceled',
  'expired',
  'revoked',
]);

export function isOpenInvitationStatus(status: string) {
  const normalized = status.trim().toLowerCase();
  if (!normalized) return true;
  return !CLOSED_INVITATION_STATUSES.has(normalized);
}

/** Map GET /api/v1/invitations item → table row for Pending Invites. */
export function mapApiInvitationToTeamUser(invitation: ApiInvitation): TeamUser {
  const email = (invitation.email || invitation.invitee_email || '').trim();
  const fromEmail = nameFromEmail(email);
  const firstName = invitation.first_name?.trim() || fromEmail.firstName;
  const lastName = invitation.last_name?.trim() || fromEmail.lastName;
  const roleCodes = [
    ...(invitation.roles ?? []),
    ...(invitation.role_code ? [invitation.role_code] : []),
  ];
  const color =
    AVATAR_COLORS[Math.abs(Number(invitation.id) || 0) % AVATAR_COLORS.length] ?? AVATAR_COLORS[0];

  return {
    id: `invite-${invitation.id}`,
    firstName,
    lastName,
    email,
    role: formatRole(roleCodes),
    branch: invitation.branch_id != null ? `Branch ${invitation.branch_id}` : '—',
    scope: invitation.branch_id != null ? 'branch' : 'company',
    status: 'invited',
    lastActive: '—',
    avatarColor: color,
    branchId: invitation.branch_id != null ? Number(invitation.branch_id) : null,
    companyId: invitation.company_id != null ? Number(invitation.company_id) : null,
  };
}

export function mergeUsersWithOpenInvitations(
  users: readonly TeamUser[],
  invitations: readonly ApiInvitation[],
): TeamUser[] {
  const openInvites = invitations.filter((invitation) => isOpenInvitationStatus(invitation.status));
  const openEmails = new Set(
    openInvites.map((invitation) => invitation.email.trim().toLowerCase()).filter(Boolean),
  );

  const usersMarked = users.map((user) => {
    const email = user.email.trim().toLowerCase();
    if (email && openEmails.has(email) && user.status !== 'invited') {
      return { ...user, status: 'invited' as const };
    }
    return user;
  });

  const emails = new Set(
    usersMarked.map((user) => user.email.trim().toLowerCase()).filter(Boolean),
  );
  const inviteRows = openInvites.map(mapApiInvitationToTeamUser).filter((row) => {
    const email = row.email.trim().toLowerCase();
    if (!email || emails.has(email)) return false;
    emails.add(email);
    return true;
  });

  return [...usersMarked, ...inviteRows];
}

/** Map GET /api/v1/users/{id} (UserDetailResponse) → Edit Staff form fields. */
export function mapApiUserToEditStaffForm(user: ApiUser) {
  const roleCodes = getRoleCodes(user.roles);
  const roleLabel = formatRole(roleCodes);
  const branchId = getPrimaryBranchId(user);

  return {
    id: String(user.id),
    firstName: user.first_name ?? '',
    lastName: user.last_name ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    role: roleLabel,
    roleCode: roleCodes[0] ?? '',
    branchId,
    scope: resolveUserScope(user),
    status: formatStatus(user.status),
    organizationId: user.organization_id ?? user.org_id ?? null,
    createdAt: user.created_at ?? null,
  };
}
