'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { useQuery } from '@/lib/hooks/api/useQuery';
import { useUserListFilters } from '@/lib/hooks/users/useUserListFilters';
import type { JsonValue } from '@/types/json';
import type { UserListSortBy, UserListSortOrder } from '@/lib/schemas/users/userListFilterSchema';

import {
  enrichDirectoryWithSession,
  isMatch,
  loadEmployeeDirectory,
  resolveAssignmentPermissionsPayload,
  resolveCreateUserRequestContext,
  type CreateUserIdHints,
} from '@/lib/helpers/employees/userRolesHelpers';
import {
  DEFAULT_STAFF_PROFILE_PERMISSIONS,
  enrichUserListRoles,
  parseGroupedPermissions,
  parseRoleCatalog,
  parseRolePermissionsToCategories,
  parseRoleTemplates,
  parseUserList,
  parseUserRecord,
  readPrimaryRoleTemplateId,
  readPrimaryUserRoleId,
  readUserId,
  resolveRoleCode,
  resolveRoleId,
  staffProfileFromUser,
  toAssignRoleBody,
  toCreateRoleBody,
  toCreateUserBody,
  toReplaceRolesBody,
  toUpdateUserBody,
  toUserStatusBody,
  UserRoleScope,
  type CreateUserFormValues,
  type CustomTemplateFormValues,
  type PermissionCategory,
  type RoleAssignmentHints,
  type RoleCatalogItem,
  type ScopeType,
  type ScopedRolePermissionsParams,
  type StaffProfileFormValues,
  type UserRoleFormValues,
  type UserRoleItem,
  type UserRoleListResponse,
  type UserRoleStatsData,
  type UserStatus,
  type UseUserRolesOptions,
  isUserEditDisabled,
  getUsersAndRolesBaseRoute,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';
import { api } from '@/services/api/browserClient';
import ApiUrlsV1, {
  rolePermissionsPath,
  userAssignmentsPath,
  userRolePermissionsPath,
  userRolesPath,
  userStatusPath,
} from '@/services/api/ApiUrlsV1';
import { useSidebarStore } from '@/stores/sidebarStore';
const usersQueryRoot = ['api', ApiUrlsV1.users.list] as const;

// ---------------------------------------------------------------------------
// Users list, filters, and CRUD mutations
// ---------------------------------------------------------------------------

export interface UseUserRolesReturn {
  users: UserRoleItem[];
  paginatedUsers: UserRoleItem[];
  stats: UserRoleStatsData;
  roleOptions: string[];
  roleCatalog: RoleCatalogItem[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  selectedBranch: string;
  setSelectedBranch: (branch: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize?: (size: number) => void;
  totalRows: number;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  resetFilters: () => void;
  clearFilter: (key: 'search' | 'status' | 'role' | 'company' | 'branch') => void;
  sortBy: UserListSortBy;
  sortOrder: UserListSortOrder;
  setSort: (sortBy: UserListSortBy, sortOrder?: UserListSortOrder) => void;
  toggleSort: (sortBy: UserListSortBy) => void;
  selectedCompanyId: number | null;
  setSelectedCompanyId: (companyId: number | null | undefined) => void;
  selectedBranchId: number | null;
  setSelectedBranchId: (branchId: number | null | undefined) => void;
  addUser: (values: UserRoleFormValues) => void;
  updateUser: (id: string, values: UserRoleFormValues) => void;
  deleteUser: (id: string) => void;
  changeUserStatus: (id: string, status: UserStatus) => void;
  isUserEditDisabled?: (userScope?: ScopeType | string | null) => boolean;
  baseRoute?: string;
}

export function useUserRoles(
  pageSizeOrOptions: number | UseUserRolesOptions = 8,
): UseUserRolesReturn {
  const options =
    typeof pageSizeOrOptions === 'number'
      ? { pageSize: pageSizeOrOptions, scope: UserRoleScope.Organization }
      : pageSizeOrOptions;

  const {
    pageSize = 8,
    scope = UserRoleScope.Company,
    initialUserList,
    companyId,
    branchId,
  } = options;

  const storeCompanyId = useSidebarStore(
    (state) => state.context.companyId ?? state.account?.company_id,
  );
  const storeBranchId = useSidebarStore(
    (state) => state.context.branchId ?? state.account?.branch_id,
  );

  const resolvedCompanyId = companyId ?? storeCompanyId;
  const resolvedBranchId = branchId ?? storeBranchId;

  const queryClient = useQueryClient();
  const [selectedBranchName, setSelectedBranchNameState] = useState('');

  const userFilters = useUserListFilters({
    scope,
    defaultPage: 1,
    defaultPageSize: pageSize,
    defaultSortBy: 'created_at',
    defaultSortOrder: 'desc',
    defaultIncludeSummary: true,
    initialCompanyId: resolvedCompanyId != null ? Number(resolvedCompanyId) : null,
    initialBranchId:
      scope === 'branch' && resolvedBranchId != null ? Number(resolvedBranchId) : null,
  });

  const rolesQuery = useRoleCatalogQuery(scope);
  const roleCatalog = useResolvedRoleCatalog(rolesQuery.data);

  const effectiveRoleCode = useMemo(() => {
    if (!userFilters.role) return undefined;
    const match = roleCatalog.find(
      (r) =>
        r.code?.toLowerCase() === userFilters.role.toLowerCase() ||
        r.name?.toLowerCase() === userFilters.role.toLowerCase() ||
        String(r.id) === userFilters.role,
    );
    return match?.code || userFilters.role;
  }, [userFilters.role, roleCatalog]);

  const listParams = useMemo(() => {
    const raw: Record<string, unknown> = {
      ...userFilters.queryParams,
      ...(effectiveRoleCode ? { role: effectiveRoleCode } : {}),
      ...(selectedBranchName ? { branch: selectedBranchName } : {}),
      include_summary: true,
    };
    return compact(raw);
  }, [userFilters.queryParams, effectiveRoleCode, selectedBranchName]);

  const usersQuery = useQuery({
    queryKey: [...usersQueryRoot, listParams, scope, resolvedCompanyId, resolvedBranchId],
    queryFn: async ({ signal }) =>
      parseUserList(await api.get<JsonValue>(ApiUrlsV1.users.list, listParams, signal)),
    enabled: scope !== 'branch' || Boolean(resolvedBranchId),
    initialData:
      initialUserList &&
      userFilters.page === 1 &&
      !userFilters.hasActiveFilters &&
      !selectedBranchName
        ? initialUserList
        : undefined,
    placeholderData: (previous) => previous,
  });

  const roleOptions = useMemo(
    () => (Array.isArray(roleCatalog) ? roleCatalog.map((role) => role.name) : []),
    [roleCatalog],
  );

  const users = useMemo(
    () => enrichUserListRoles(usersQuery.data?.items ?? [], roleCatalog),
    [roleCatalog, usersQuery.data?.items],
  );
  const paginatedUsers = users;
  const totalRows = usersQuery.data?.total ?? users.length;

  const stats: UserRoleStatsData = useMemo(() => {
    const list = Array.isArray(users) ? users : [];
    const summary = usersQuery.data?.summary;
    if (summary) {
      return {
        totalUsers: summary.total_users ?? totalRows,
        activeNow:
          summary.active_now ??
          summary.active_users ??
          list.filter((user) => user.status === 'active').length,
        pendingInvites:
          summary.pending_invites ?? list.filter((user) => user.status === 'invited').length,
        userRoles:
          summary.user_roles ??
          summary.total_roles ??
          new Set(list.map((user) => user.role).filter(Boolean)).size,
      };
    }
    const activeNow = list.filter((user) => user.status === 'active').length;
    const pendingInvites = list.filter((user) => user.status === 'invited').length;
    return {
      totalUsers: totalRows,
      activeNow,
      pendingInvites,
      userRoles: new Set(list.map((user) => user.role).filter(Boolean)).size,
    };
  }, [users, totalRows, usersQuery.data?.summary]);

  const invalidateUsers = async () => {
    await queryClient.invalidateQueries({ queryKey: [...usersQueryRoot] });
  };

  const syncUserRoles = async (userId: string, roleName: string, catalog: RoleCatalogItem[]) => {
    const matched = catalog.find(
      (r) => isMatch(r.name, roleName) || isMatch(r.id, roleName) || isMatch(r.code, roleName),
    );
    const roleCode = matched?.code || resolveRoleCode(roleName, catalog);
    if (!roleCode) return;

    const { context, account } = useSidebarStore.getState();
    const hints = {
      companyId: context.companyId ?? account?.company_id ?? undefined,
      branchId: context.branchId ?? account?.branch_id ?? undefined,
      scope: matched?.scope,
    };

    try {
      await api.put(userRolesPath(userId), toReplaceRolesBody(roleCode, hints));
    } catch {
      await api.post(userRolesPath(userId), toAssignRoleBody(roleCode, hints));
    }
  };

  const createMutation = useMutation({
    mutationFn: async (values: UserRoleFormValues) => {
      const createdPayload = await api.post<JsonValue>(
        ApiUrlsV1.users.create,
        toCreateUserBody(values),
      );
      const userId = parseUserRecord(createdPayload)?.id ?? readUserId(createdPayload);
      if (userId && values.role) await syncUserRoles(userId, values.role, roleCatalog);
    },
    onSuccess: invalidateUsers,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: UserRoleFormValues }) => {
      await api.put(ApiUrlsV1.users.update(id), toCreateUserBody(values));
      if (values.role) await syncUserRoles(id, values.role, roleCatalog);
    },
    onSuccess: invalidateUsers,
  });

  const disableMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(userStatusPath(id), toUserStatusBody('inactive'));
    },
    onSuccess: invalidateUsers,
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: UserStatus }) => {
      await api.patch(userStatusPath(id), toUserStatusBody(status));
    },
    onSuccess: invalidateUsers,
  });

  return {
    users,
    paginatedUsers,
    stats,
    roleOptions,
    roleCatalog,
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    error: usersQuery.error,
    searchQuery: userFilters.search,
    setSearchQuery: userFilters.setSearch,
    selectedRole: userFilters.role,
    setSelectedRole: userFilters.setRole,
    selectedBranch:
      selectedBranchName || (userFilters.branchId != null ? String(userFilters.branchId) : ''),
    setSelectedBranch: (branch: string) => {
      setSelectedBranchNameState(branch);
      userFilters.setPage(1);
    },
    selectedStatus: userFilters.status,
    setSelectedStatus: userFilters.setStatus,
    page: userFilters.page,
    setPage: userFilters.setPage,
    pageSize: userFilters.pageSize,
    setPageSize: userFilters.setPageSize,
    totalRows,
    hasActiveFilters: userFilters.hasActiveFilters || Boolean(selectedBranchName),
    activeFilterCount: userFilters.activeFilterCount + (selectedBranchName ? 1 : 0),
    resetFilters: () => {
      userFilters.resetFilters();
      setSelectedBranchNameState('');
    },
    clearFilter: (key) => {
      if (key === 'branch') setSelectedBranchNameState('');
      userFilters.clearFilter(key);
    },
    sortBy: userFilters.sortBy,
    sortOrder: userFilters.sortOrder,
    setSort: userFilters.setSort,
    toggleSort: userFilters.toggleSort,
    selectedCompanyId: userFilters.companyId,
    setSelectedCompanyId: userFilters.setCompanyId,
    selectedBranchId: userFilters.branchId,
    setSelectedBranchId: userFilters.setBranchId,
    addUser: (values) => {
      createMutation.mutate(values);
      userFilters.setPage(1);
    },
    updateUser: (id, values) => updateMutation.mutate({ id, values }),
    deleteUser: (id) => disableMutation.mutate(id),
    changeUserStatus: (id, status) => statusMutation.mutate({ id, status }),
    isUserEditDisabled: (userScope?: ScopeType | string | null) =>
      isUserEditDisabled(userScope, scope),
    baseRoute: getUsersAndRolesBaseRoute(undefined, scope),
  };
}

// ---------------------------------------------------------------------------
// Helpers for role and permission synchronization
// ---------------------------------------------------------------------------

async function assignOrReplaceUserRole(
  userId: string | number,
  roleCode: string,
  hints: RoleAssignmentHints,
): Promise<void> {
  try {
    await api.put(userRolesPath(userId), toReplaceRolesBody(roleCode, hints));
  } catch {
    await api.post(userRolesPath(userId), toAssignRoleBody(roleCode, hints)).catch(() => null);
  }
}

async function syncUserPermissions(
  userId: string | number,
  categories: readonly PermissionCategory[],
): Promise<void> {
  let userRoleId: string | null = null;
  try {
    const assignments = await api.get<JsonValue>(userAssignmentsPath(userId));
    userRoleId = readPrimaryUserRoleId(assignments);
  } catch {
    userRoleId = null;
  }

  // Role assignment already applies template permissions; skip if we cannot target the assignment row.
  if (!userRoleId) return;

  const payload = await resolveAssignmentPermissionsPayload(
    userId,
    userRoleId,
    categories,
    (path) => api.get(path),
  );

  // No deltas vs inherited role permissions — avoid PUT that re-delegates the full role catalog.
  if (payload.assignment_adjustments.length === 0) return;

  try {
    await api.put(userRolePermissionsPath(userId, userRoleId), payload);
    return;
  } catch {
    // fallback
  }

  await api.put(
    `${ApiUrlsV1.users.list}/${encodeURIComponent(String(userId))}/permissions`,
    payload,
  );
}

function useResolvedRoleCatalog(data: JsonValue | undefined): RoleCatalogItem[] {
  return useMemo(() => (data == null ? [] : parseRoleCatalog(data)), [data]);
}

async function invalidateUserQueries(
  queryClient: QueryClient,
  userId?: string | null,
  includeDetails = false,
): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: ['api', ApiUrlsV1.users.list] });
  if (userId) {
    await queryClient.invalidateQueries({ queryKey: ['api', ApiUrlsV1.users.list, userId] });
    if (includeDetails) {
      await queryClient.invalidateQueries({
        queryKey: ['api', ApiUrlsV1.users.list, String(userId), 'permissions'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['api', ApiUrlsV1.users.list, String(userId), 'assignments'],
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Staff profile (edit) queries and mutations
// ---------------------------------------------------------------------------

export function useStaffProfile(
  userId: string | null | undefined,
  options?: {
    scope?: ScopeType;
    companyId?: number | string | null;
    branchId?: number | string | null;
  },
) {
  const queryClient = useQueryClient();
  const enabled = Boolean(userId);

  const rawUserQuery = useQuery({
    queryKey: ['api', ApiUrlsV1.users.list, userId],
    enabled,
    queryFn: async ({ signal }) =>
      api.get<JsonValue>(ApiUrlsV1.users.detail(userId!), undefined, signal),
  });

  const assignmentsQuery = useQuery({
    queryKey: ['api', ApiUrlsV1.users.list, userId, 'assignments'],
    enabled,
    queryFn: async ({ signal }) =>
      api.get<JsonValue>(userAssignmentsPath(userId!), undefined, signal).catch(() => null),
  });

  const rolesQuery = useRoleCatalogQuery();
  const roleCatalog = useResolvedRoleCatalog(rolesQuery.data);

  const userItem = useMemo(() => {
    if (rawUserQuery.data) {
      return parseUserRecord(rawUserQuery.data);
    }
    const cachedList = queryClient.getQueryData<UserRoleListResponse>([...usersQueryRoot]);
    if (cachedList && userId) {
      const items = Array.isArray(cachedList.items)
        ? cachedList.items
        : parseUserList(cachedList as unknown as JsonValue).items;
      const found = items.find((u: UserRoleItem) => isMatch(u.id, userId));
      if (found) return found;
    }
    return null;
  }, [rawUserQuery.data, queryClient, userId]);

  const profile = useMemo(() => {
    if (!userItem) return undefined;
    return staffProfileFromUser(userItem, rawUserQuery.data, roleCatalog);
  }, [userItem, rawUserQuery.data, roleCatalog]);

  const assignmentRoleId = useMemo(
    () => readPrimaryUserRoleId(assignmentsQuery.data ?? null),
    [assignmentsQuery.data],
  );

  const assignmentRoleTemplateId = useMemo(
    () => readPrimaryRoleTemplateId(assignmentsQuery.data ?? null),
    [assignmentsQuery.data],
  );

  const resolvedRoleId = useMemo(() => {
    if (assignmentRoleTemplateId) return assignmentRoleTemplateId;
    if (userItem?.roleId) return userItem.roleId;
    if (profile?.roleName) return resolveRoleId(profile.roleName, roleCatalog);
    if (userItem?.role) return resolveRoleId(userItem.role, roleCatalog);
    if (assignmentRoleId) return assignmentRoleId;
    return null;
  }, [userItem, assignmentRoleTemplateId, assignmentRoleId, profile, roleCatalog]);

  const matchedRole = useMemo(() => {
    if (!resolvedRoleId && !profile?.roleName && !userItem?.role) return undefined;
    return roleCatalog.find(
      (r) =>
        isMatch(r.id, resolvedRoleId) ||
        isMatch(r.name, profile?.roleName) ||
        isMatch(r.name, userItem?.role),
    );
  }, [resolvedRoleId, profile, userItem, roleCatalog]);

  const contextCompanyId = useSidebarStore((state) => state.context.companyId);
  const contextBranchId = useSidebarStore((state) => state.context.branchId);
  const accountCompanyId = useSidebarStore((state) => state.account?.company_id);
  const accountBranchId = useSidebarStore((state) => state.account?.branch_id);

  const userCompanyId = userItem?.companyId;
  const userBranchId = userItem?.branchId;

  const roleScope = matchedRole?.scope || userItem?.scope || options?.scope || UserRoleScope.Branch;
  const permissionScope = options?.scope ?? roleScope;

  const resolvedCompanyId =
    options?.companyId ?? userCompanyId ?? contextCompanyId ?? accountCompanyId;
  const resolvedBranchId = options?.branchId ?? userBranchId ?? contextBranchId ?? accountBranchId;

  const rolePermissionsQuery = useRolePermissions(resolvedRoleId, {
    scope: permissionScope,
    companyId: resolvedCompanyId,
    branchId: resolvedBranchId,
  });

  const categories = useMemo(
    () => parseRolePermissionsToCategories(rolePermissionsQuery.data ?? null),
    [rolePermissionsQuery.data],
  );

  const saveMutation = useMutation({
    mutationFn: async (input: {
      values: StaffProfileFormValues;
      categories: PermissionCategory[];
    }) => {
      if (!userId) throw new Error('Missing user id');
      await api.put(ApiUrlsV1.users.update(userId), toUpdateUserBody(input.values));

      const existingRoleName = profile?.roleName || userItem?.role;
      const roleChanged = Boolean(
        input.values.roleName &&
        (!existingRoleName || !isMatch(input.values.roleName, existingRoleName)),
      );

      if (roleChanged) {
        const matched = roleCatalog.find(
          (r) =>
            isMatch(r.name, input.values.roleName) ||
            isMatch(r.id, input.values.roleName) ||
            isMatch(r.code, input.values.roleName),
        );
        const roleCode = matched?.code || resolveRoleCode(input.values.roleName, roleCatalog);
        if (roleCode) {
          const { context, account } = useSidebarStore.getState();
          const hints: RoleAssignmentHints = {
            companyId:
              options?.companyId ??
              userCompanyId ??
              context.companyId ??
              account?.company_id ??
              undefined,
            branchId:
              options?.branchId ??
              userBranchId ??
              context.branchId ??
              account?.branch_id ??
              undefined,
            scope: matched?.scope || permissionScope,
          };
          await assignOrReplaceUserRole(userId, roleCode, hints);
        }
      }

      await syncUserPermissions(userId, input.categories);
    },
    onSuccess: async () => {
      await invalidateUserQueries(queryClient, userId, true);
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (status: UserStatus) => {
      if (!userId) throw new Error('Missing user id');
      await api.patch(userStatusPath(userId), toUserStatusBody(status));
    },
    onSuccess: async () => {
      await invalidateUserQueries(queryClient, userId);
    },
  });

  const isPermissionsLoading =
    assignmentsQuery.isLoading || (Boolean(resolvedRoleId) && rolePermissionsQuery.isLoading);

  return {
    profile,
    userItem,
    rawUser: rawUserQuery.data,
    categories,
    matchedRole,
    roleCatalog,
    isLoading: rawUserQuery.isLoading && !userItem,
    isPermissionsLoading,
    isError: rawUserQuery.isError && !userItem,
    error: rawUserQuery.error,
    saveProfile: saveMutation.mutateAsync,
    activate: () => statusMutation.mutateAsync('active'),
    deactivate: () => statusMutation.mutateAsync('inactive'),
    isSaving: saveMutation.isPending,
    isActivating: statusMutation.isPending && statusMutation.variables === 'active',
    isDeactivating: statusMutation.isPending && statusMutation.variables === 'inactive',
  };
}

// ---------------------------------------------------------------------------
// Create user wizard mutation
// ---------------------------------------------------------------------------

export function useCreateStaffUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      values: CreateUserFormValues;
      categories: PermissionCategory[];
      ids: CreateUserIdHints;
    }) => {
      const rolesPayload = await api.get<JsonValue>(ApiUrlsV1.roles.list);
      const roleCatalog = parseRoleCatalog(rolesPayload);
      const roleCode = resolveRoleCode(input.values.role, roleCatalog);
      const { role, account, user } = useSidebarStore.getState();
      const directoryAuth = {
        role: role || user?.role || account?.roles?.[0] || account?.scope || '',
        authScope: account?.scope ?? '',
      };
      const context = await resolveCreateUserRequestContext(
        { company: input.values.company, branch: input.values.branch },
        input.ids,
        (path, params) => api.get<JsonValue>(path, params),
        roleCatalog,
        roleCode,
        directoryAuth,
      );
      const body = toCreateUserBody(input.values, context);
      const createdPayload = await api.post<JsonValue>(ApiUrlsV1.users.create, body);
      const userId = parseUserRecord(createdPayload)?.id ?? readUserId(createdPayload);
      if (!userId) return;

      if (roleCode) {
        const matched = roleCatalog.find(
          (r) => isMatch(r.code, roleCode) || isMatch(r.name, input.values.role),
        );
        const roleHints: RoleAssignmentHints = {
          companyId: context.companyId,
          branchId: context.branchId,
          scope: matched?.scope,
        };
        await assignOrReplaceUserRole(userId, roleCode, roleHints);
      }

      await syncUserPermissions(userId, input.categories);
    },
    onSuccess: async () => {
      await invalidateUserQueries(queryClient);
    },
  });
}

// ---------------------------------------------------------------------------
// Custom role template mutation
// ---------------------------------------------------------------------------

function enabledPermissionCodes(categories: readonly PermissionCategory[]): string[] {
  return categories.flatMap((category) =>
    category.permissions
      .filter((permission) => permission.enabled)
      .map((permission) => permission.code?.trim() || permission.id),
  );
}

export function useCreateCustomRole(scope: ScopeType = 'organization') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      values: CustomTemplateFormValues;
      categories: PermissionCategory[];
    }) => {
      const permissionCodes = enabledPermissionCodes(input.categories);
      await api.post<JsonValue>(
        ApiUrlsV1.roles.create,
        toCreateRoleBody({
          code: input.values.code,
          displayName: input.values.templateName,
          description: input.values.description,
          scope,
          permissionCodes,
        }),
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['api', ApiUrlsV1.roles.list] });
      await queryClient.invalidateQueries({ queryKey: ['api', ApiUrlsV1.roles.templates] });
    },
  });
}

// ---------------------------------------------------------------------------
// Role templates and grouped permissions (read)
// ---------------------------------------------------------------------------

export function useRoleCatalogQuery(scope?: ScopeType) {
  return useQuery({
    queryKey: ['api', ApiUrlsV1.roles.list, scope ?? 'all'],
    queryFn: async ({ signal }) =>
      parseRoleCatalog(await api.get<JsonValue>(ApiUrlsV1.roles.list, undefined, signal)),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });
}

export function useRolePermissions(
  roleId: string | number | undefined | null,
  options?: {
    scope?: ScopeType | string;
    companyId?: number | string | null;
    branchId?: number | string | null;
  },
) {
  const { context, account } = useSidebarStore.getState();
  const rawCompanyId = options?.companyId ?? context.companyId ?? account?.company_id;
  const rawBranchId = options?.branchId ?? context.branchId ?? account?.branch_id;

  const companyId = rawCompanyId != null && rawCompanyId !== '' ? Number(rawCompanyId) : undefined;
  const branchId = rawBranchId != null && rawBranchId !== '' ? Number(rawBranchId) : undefined;

  const requestedScope = options?.scope ?? UserRoleScope.Organization;
  let scopeType: UserRoleScope = UserRoleScope.Organization;
  if (requestedScope === UserRoleScope.Company && companyId != null && Number.isFinite(companyId)) {
    scopeType = UserRoleScope.Company;
  } else if (
    requestedScope === UserRoleScope.Branch &&
    branchId != null &&
    Number.isFinite(branchId)
  ) {
    scopeType = UserRoleScope.Branch;
  }

  return useQuery({
    queryKey: [
      'api',
      'roles',
      roleId != null && roleId !== '' ? String(roleId) : 'none',
      'permissions',
      scopeType,
      companyId != null ? String(companyId) : 'all',
      branchId != null ? String(branchId) : 'all',
    ],
    queryFn: async ({ signal }) => {
      if (roleId == null || roleId === '') return null;
      const params: ScopedRolePermissionsParams = {
        scope_type: scopeType,
        ...(companyId != null && Number.isFinite(companyId) ? { company_id: companyId } : {}),
        ...(scopeType === UserRoleScope.Branch && branchId != null && Number.isFinite(branchId)
          ? { branch_id: branchId }
          : {}),
        page_size: 100,
      };

      return api.get<JsonValue>(rolePermissionsPath(roleId), params, signal);
    },
    enabled: roleId != null && roleId !== '',
    staleTime: 60_000,
  });
}

export function useRoleTemplates(scope?: ScopeType) {
  return useQuery({
    queryKey: ['api', ApiUrlsV1.roles.list, 'templates', scope],
    queryFn: async ({ signal }) => {
      try {
        const rolesPayload = await api.get<JsonValue>(ApiUrlsV1.roles.list, undefined, signal);
        const parsed = parseRoleTemplates(rolesPayload);
        if (parsed.length > 0) return parsed;
      } catch {
        // Fallback to templates endpoint
      }

      try {
        const templatesPayload = await api.get<JsonValue>(
          ApiUrlsV1.roles.templates,
          undefined,
          signal,
        );
        return parseRoleTemplates(templatesPayload);
      } catch {
        return [];
      }
    },
    staleTime: 60_000,
  });
}

export function useGroupedPermissions(enabled = true) {
  return useQuery({
    queryKey: ['api', ApiUrlsV1.permissions.grouped],
    enabled,
    queryFn: async ({ signal }) => {
      try {
        const payload = await api.get<JsonValue>(ApiUrlsV1.permissions.grouped, undefined, signal);
        const parsed = parseGroupedPermissions(payload);
        if (parsed.length > 0) return parsed;
      } catch {
        // Fallback to default categories
      }

      return DEFAULT_STAFF_PROFILE_PERMISSIONS;
    },
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });
}

// ---------------------------------------------------------------------------
// Company / branch directory for create-user forms
// ---------------------------------------------------------------------------

export function useEmployeeDirectory(
  organizationId?: number,
  companyId?: number,
  options?: { scope?: ScopeType },
) {
  const storeOrgId = useSidebarStore(
    (state) => state.context.organizationId ?? state.account?.org_id ?? undefined,
  );
  const storeCompanyId = useSidebarStore(
    (state) => state.context.companyId ?? state.account?.company_id ?? undefined,
  );
  const role = useSidebarStore((state) => state.role || state.user?.role || '');
  const authScope = useSidebarStore((state) => state.account?.scope ?? '');
  const hasAccount = useSidebarStore((state) => Boolean(state.account));

  const resolvedOrgId = organizationId ?? storeOrgId ?? undefined;
  const resolvedCompanyId =
    options?.scope === 'organization' ? companyId : (companyId ?? storeCompanyId ?? undefined);

  const sessionReady = Boolean(role || hasAccount);
  const hasDirectoryScope = resolvedOrgId != null || resolvedCompanyId != null;

  return useQuery({
    queryKey: [
      'employees',
      'directory',
      resolvedOrgId ?? 'none',
      resolvedCompanyId ?? 'none',
      options?.scope ?? 'default',
      role,
      authScope,
    ],
    enabled: sessionReady && hasDirectoryScope,
    queryFn: async ({ signal }) => {
      const { context, account } = useSidebarStore.getState();
      const sessionRole = role || account?.roles?.[0] || account?.scope || '';
      const sessionAuthScope = authScope || account?.scope || '';
      const get = (
        path: string,
        params?: Record<string, string | number | boolean | null | undefined>,
      ) => api.get<JsonValue>(path, params, signal);

      const sessionHints = {
        companyId: resolvedCompanyId ?? undefined,
        companyName: context.companyName,
        branchId: context.branchId ?? account?.branch_id ?? undefined,
        branchName: context.branchName,
      };

      try {
        return await loadEmployeeDirectory(
          {
            organizationId: resolvedOrgId ?? undefined,
            companyId: resolvedCompanyId ?? undefined,
            session: sessionHints,
            role: sessionRole,
            authScope: sessionAuthScope,
            scope: options?.scope,
          },
          get,
        );
      } catch {
        return enrichDirectoryWithSession([], [], sessionHints);
      }
    },
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  });
}

function compact(record: Record<string, unknown>): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(record).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  ) as Record<string, string | number | boolean>;
}
