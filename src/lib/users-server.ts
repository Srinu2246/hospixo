/**
 * Server-only Users & Roles data loaders.
 * Call from RSC / Server Actions with the httpOnly session cookie — never from the browser.
 */

import { cache } from 'react';

import { listInvitations } from '@/lib/api/invitations';
import { listOrganizationBranches } from '@/lib/api/branches';
import { listOrganizationCompanies } from '@/lib/api/companies';
import { getUser, listUsers } from '@/lib/api/users';
import { getGroupedPermissions } from '@/lib/api/permissions';
import { getRole, listRoles } from '@/lib/api/roles';
import type { PermissionGroup } from '@/features/user-roles/config/roles';
import {
  matchLiveRoleCode,
  permissionGroupsForRole,
  selectablePermissionGroupsFromCatalog,
} from '@/lib/roles-map';
import { getUserFriendlyErrorMessage } from '@/lib/api/errors';
import { getServerToken } from '@/server/auth';
import { getServerAuthSession } from '@/lib/auth/session';
import { filterEmployeesByAccessLevel } from '@/features/user-roles/lib/employee-scope';
import type { HierarchyAccessLevel } from '@/lib/auth/access-level';
import {
  mapApiUserToEditStaffForm,
  mapApiUserToTeamUser,
  mergeUsersWithOpenInvitations,
} from '@/lib/users-map';
import type { TeamUser } from '@/features/user-roles/config/users';
import type { ListUsersQuery, UserStatus } from '@/types/users';

export const USERS_PAGE_SIZE = 8;

export type UserAssignmentOptions = Readonly<{
  companies: readonly { id: number; name: string }[];
  branches: readonly { id: number; name: string; companyId: number }[];
  error: string | null;
}>;

/** Load assignment options before the Users & Roles form is rendered. */
export async function loadUserAssignmentOptions(): Promise<UserAssignmentOptions> {
  const session = await getServerAuthSession().catch(() => null);
  const token = session?.accessToken ?? (await getServerToken());

  if (!token) {
    return { companies: [], branches: [], error: 'Sign in required.' };
  }

  const orgId = session?.user?.org_id;
  if (!orgId || orgId <= 0) {
    return {
      companies: [],
      branches: [],
      error: 'Organization id is missing from your session.',
    };
  }

  try {
    const companiesResult = await listOrganizationCompanies(token, orgId);
    const companies = companiesResult.items.map((company) => ({
      id: Number(company.id),
      name: company.name,
    }));

    const branchesResult = await listOrganizationBranches(
      token,
      orgId,
      companiesResult.items.map((company) => ({
        id: company.id,
        name: company.name,
      })),
    );

    const branches = branchesResult.items.map((branch) => ({
      id: Number(branch.id),
      name: branch.name,
      companyId: Number(branch.company_id),
    }));

    let error: string | null = null;
    if (companies.length === 0) {
      error = 'No companies are set up for this organization yet.';
    } else if (branches.length === 0) {
      error = 'No branches were found. Add a branch, then try again.';
    }

    return { companies, branches, error };
  } catch (error) {
    return {
      companies: [],
      branches: [],
      error: getUserFriendlyErrorMessage(error, 'Unable to load company and branch options.'),
    };
  }
}

export type LoadUsersListPageOptions = Readonly<{
  hierarchyLevel?: HierarchyAccessLevel;
  branchId?: number | null;
  companyId?: number | null;
  branchName?: string;
}>;

export type UsersListPageData = Readonly<{
  users: TeamUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  search: string;
  status?: UserStatus;
  stats: {
    totalUsers: number;
    activeNow: number;
    pendingInvites: number;
    userRoles: number;
  };
  error: string | null;
}>;

export type EditStaffPageData = Readonly<{
  staff: ReturnType<typeof mapApiUserToEditStaffForm> | null;
  permissionCatalog: PermissionGroup[];
  permissionGroups: PermissionGroup[];
  error: string | null;
}>;

function parsePositiveInt(value: string | undefined, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : fallback;
}

export function parseUsersListSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): ListUsersQuery & { search: string } {
  const rawQ = searchParams.q ?? searchParams.search;
  const q = Array.isArray(rawQ) ? rawQ[0] : rawQ;
  const rawPage = searchParams.page;
  const pageValue = Array.isArray(rawPage) ? rawPage[0] : rawPage;
  const rawStatus = searchParams.status;
  const statusValue = Array.isArray(rawStatus) ? rawStatus[0] : rawStatus;

  return {
    search: (q ?? '').trim(),
    q: (q ?? '').trim() || undefined,
    page: parsePositiveInt(pageValue, 1),
    page_size: USERS_PAGE_SIZE,
    status: (statusValue as UserStatus | undefined) || undefined,
  };
}

/** Load paginated users + dashboard counts for the Users & Roles index. */
async function loadUsersListPageDataUncached(
  searchParams: Record<string, string | string[] | undefined>,
  options?: LoadUsersListPageOptions,
): Promise<UsersListPageData> {
  const query = parseUsersListSearchParams(searchParams);
  const session = await getServerAuthSession().catch(() => null);
  const token = session?.accessToken ?? (await getServerToken());

  if (!token) {
    return {
      users: [],
      total: 0,
      page: query.page ?? 1,
      pageSize: USERS_PAGE_SIZE,
      totalPages: 1,
      search: query.search,
      status: query.status,
      stats: { totalUsers: 0, activeNow: 0, pendingInvites: 0, userRoles: 0 },
      error: 'Sign in required.',
    };
  }

  try {
    const [statsList, invitations] = await Promise.all([
      listUsers(token, {
        q: query.q,
        search: query.q,
        status: query.status,
        page: 1,
        page_size: 100,
      }),
      listInvitations(token, { page: 1, page_size: 100 }).catch(() => ({
        items: [],
        total: 0,
      })),
      listRoles(token).catch(() => ({ items: [], total: 0 })),
    ]);

    const allStatsUsers = mergeUsersWithOpenInvitations(
      statsList.items.map(mapApiUserToTeamUser),
      invitations.items,
    );

    const rawBranchParam = searchParams.branch_id ?? searchParams.outlet;
    const queryBranchId = rawBranchParam
      ? Number(Array.isArray(rawBranchParam) ? rawBranchParam[0] : rawBranchParam)
      : null;
    const activeBranchId =
      options?.branchId !== undefined
        ? options.branchId
        : (queryBranchId ?? session?.user?.branch_id ?? null);

    const activeCompanyId =
      options?.companyId !== undefined ? options.companyId : (session?.user?.company_id ?? null);

    const hierarchyLevel = options?.hierarchyLevel;

    const statsUsers = hierarchyLevel
      ? filterEmployeesByAccessLevel(allStatsUsers, hierarchyLevel, {
          activeBranchId,
          activeCompanyId,
          activeBranch: options?.branchName,
        })
      : allStatsUsers;

    const pendingInviteCount = statsUsers.filter((user) => user.status === 'invited').length;
    const users = statsUsers;
    const total = statsUsers.length;
    const page = query.page ?? 1;
    const pageSize = USERS_PAGE_SIZE;

    return {
      users,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      search: query.search,
      status: query.status,
      stats: {
        totalUsers: statsUsers.length,
        activeNow: statsUsers.filter((u) => u.status === 'active').length,
        pendingInvites: pendingInviteCount,
        userRoles: new Set(statsUsers.map((u) => u.role)).size,
      },
      error: null,
    };
  } catch (err) {
    return {
      users: [],
      total: 0,
      page: query.page ?? 1,
      pageSize: USERS_PAGE_SIZE,
      totalPages: 1,
      search: query.search,
      status: query.status,
      stats: { totalUsers: 0, activeNow: 0, pendingInvites: 0, userRoles: 0 },
      error: getUserFriendlyErrorMessage(err, 'Unable to load users.'),
    };
  }
}

export const loadUsersListPageData = cache(loadUsersListPageDataUncached);

async function loadStaffPermissionGroups(
  token: string,
  roleCode: string,
): Promise<PermissionGroup[]> {
  try {
    const [catalogResult, rolesResult] = await Promise.all([
      getGroupedPermissions(token).catch(() => ({ groups: [] })),
      listRoles(token).catch(() => ({ items: [], total: 0 })),
    ]);

    const catalog = catalogResult.groups ?? [];
    const liveCode = matchLiveRoleCode(roleCode, rolesResult.items);
    const liveRole = rolesResult.items.find((role) => role.code === liveCode);
    if (!liveRole?.id) {
      return permissionGroupsForRole(catalog, []);
    }

    const roleDetail = await getRole(token, liveRole.id);
    return permissionGroupsForRole(catalog, roleDetail.permission_codes ?? []);
  } catch {
    return [];
  }
}

/** Load a single staff member for Edit Staff. */
async function loadEditStaffPageDataUncached(staffId: string): Promise<EditStaffPageData> {
  const token = await getServerToken();
  if (!token) {
    return {
      staff: null,
      permissionCatalog: [],
      permissionGroups: [],
      error: 'Sign in required.',
    };
  }

  try {
    const [user, catalogResult] = await Promise.all([
      getUser(token, staffId),
      getGroupedPermissions(token).catch(() => ({ groups: [] })),
    ]);
    const staff = mapApiUserToEditStaffForm(user);
    const permissionCatalog = selectablePermissionGroupsFromCatalog(catalogResult.groups ?? []);
    const permissionGroups = staff.roleCode
      ? await loadStaffPermissionGroups(token, staff.roleCode)
      : [];

    return { staff, permissionCatalog, permissionGroups, error: null };
  } catch (err) {
    return {
      staff: null,
      permissionCatalog: [],
      permissionGroups: [],
      error: getUserFriendlyErrorMessage(err, 'Unable to load user profile.'),
    };
  }
}

export const loadEditStaffPageData = cache(loadEditStaffPageDataUncached);
