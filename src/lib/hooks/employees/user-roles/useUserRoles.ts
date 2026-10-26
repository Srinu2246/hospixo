'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { useQuery } from '@/lib/hooks/api/useQuery';
import type { JsonObject, JsonValue } from '@/types/json';

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
  totalRows: number;
  hasActiveFilters: boolean;
  resetFilters: () => void;
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
  const [searchQuery, setSearchQueryState] = useState('');
  const [selectedRole, setSelectedRoleState] = useState('');
  const [selectedBranch, setSelectedBranchState] = useState('');
  const [selectedStatus, setSelectedStatusState] = useState('');
  const [page, setPage] = useState(1);

  const listParams = useMemo(
    () =>
      compact({
        page,
        page_size: pageSize,
        ...(searchQuery.trim() ? { search: searchQuery.trim() } : {}),
        ...(selectedRole ? { role: selectedRole } : {}),
        ...(selectedBranch ? { branch: selectedBranch } : {}),
        ...(selectedStatus ? { status: selectedStatus } : {}),
        scope,
        scope_type: scope,
        ...(resolvedCompanyId != null ? { company_id: resolvedCompanyId } : {}),
        ...(scope === 'branch' && resolvedBranchId != null ? { branch_id: resolvedBranchId } : {}),
      }),
    [
      page,
      pageSize,
      searchQuery,
      selectedRole,
      selectedBranch,
      selectedStatus,
      scope,
      resolvedCompanyId,
      resolvedBranchId,
    ],
  );

  const usersQuery = useQuery({
    queryKey: [...usersQueryRoot, listParams, scope, resolvedCompanyId, resolvedBranchId],
    queryFn: async ({ signal }) =>
      parseUserList(await api.get<JsonValue>(ApiUrlsV1.users.list, listParams, signal)),
    enabled: scope !== 'branch' || Boolean(resolvedBranchId),
    initialData:
      initialUserList &&
      page === 1 &&
      !searchQuery.trim() &&
      !selectedRole &&
      !selectedBranch &&
      !selectedStatus
        ? initialUserList
        : undefined,
    placeholderData: (previous) => previous,
    staleTime: 60_000,
  });

  const rolesQuery = useRoleCatalogQuery(scope);
  const roleCatalog = useResolvedRoleCatalog(rolesQuery.data);

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
    const activeNow = list.filter((user) => user.status === 'active').length;
    const pendingInvites = list.filter((user) => user.status === 'invited').length;
    return {
      totalUsers: totalRows,
      activeNow,
      pendingInvites,
      userRoles: new Set(list.map((user) => user.role).filter(Boolean)).size,
    };
  }, [users, totalRows]);

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
    searchQuery,
    setSearchQuery: (query: string) => {
      setSearchQueryState(query);
      setPage(1);
    },
    selectedRole,
    setSelectedRole: (role: string) => {
      setSelectedRoleState(role);
      setPage(1);
    },
    selectedBranch,
    setSelectedBranch: (branch: string) => {
      setSelectedBranchState(branch);
      setPage(1);
    },
    selectedStatus,
    setSelectedStatus: (status: string) => {
      setSelectedStatusState(status);
      setPage(1);
    },
    page,
    setPage,
    pageSize,
    totalRows,
    hasActiveFilters: Boolean(
      searchQuery.trim() || selectedRole || selectedBranch || selectedStatus,
    ),
    resetFilters: () => {
      setSearchQueryState('');
      setSelectedRoleState('');
      setSelectedBranchState('');
      setSelectedStatusState('');
      setPage(1);
    },
    addUser: (values) => {
      createMutation.mutate(values);
      setPage(1);
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
      const parsed = parseUserList(cachedList);
      const found = parsed.items.find((u: UserRoleItem) => isMatch(u.id, userId));
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
      let roleCatalog: RoleCatalogItem[] = [];
      try {
        const rolesPayload = await api.get<JsonValue>(ApiUrlsV1.roles.list);
        roleCatalog = parseRoleCatalog(rolesPayload);
      } catch {
        roleCatalog = [];
      }

      const roleCode = resolveRoleCode(input.values.role, roleCatalog);
      const { role, account, user, context: storeContext } = useSidebarStore.getState();
      const isBranchScope =
        account?.scope === 'branch' || storeContext.branchId != null || input.ids.branchId != null;
      const directoryAuth = {
        role: role || user?.role || account?.roles?.[0] || account?.scope || '',
        authScope: account?.scope ?? '',
        scope: isBranchScope ? ('branch' as const) : undefined,
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

      if (userId && roleCode) {
        const matched = roleCatalog.find(
          (r) => isMatch(r.code, roleCode) || isMatch(r.name, input.values.role),
        );
        const roleHints: RoleAssignmentHints = {
          companyId: context.companyId,
          branchId: context.branchId,
          scope: matched?.scope,
        };
        try {
          await assignOrReplaceUserRole(userId, roleCode, roleHints);
        } catch (err) {
          console.warn('assignOrReplaceUserRole failed:', err);
        }
      }

      if (userId && input.categories.length > 0) {
        try {
          await syncUserPermissions(userId, input.categories);
        } catch (err) {
          console.warn('syncUserPermissions failed:', err);
        }
      }

      return { id: userId, payload: createdPayload };
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
  const accountScope = useSidebarStore((state) => state.account?.scope);
  const requestedScope = (options?.scope ?? accountScope ?? UserRoleScope.Organization)
    .toString()
    .toLowerCase();

  const scopeType: UserRoleScope =
    requestedScope === 'branch'
      ? UserRoleScope.Branch
      : requestedScope === 'company'
        ? UserRoleScope.Company
        : UserRoleScope.Organization;

  const numericRoleId = Number(roleId);
  const isValidRoleId =
    roleId != null &&
    roleId !== '' &&
    roleId !== 'custom-role' &&
    Number.isFinite(numericRoleId) &&
    numericRoleId > 0;

  return useQuery({
    queryKey: [
      'api',
      'roles',
      isValidRoleId ? String(numericRoleId) : 'none',
      'permissions',
      scopeType,
    ],
    queryFn: async ({ signal }) => {
      if (!isValidRoleId) return null;
      const params: ScopedRolePermissionsParams = {
        scope_type: scopeType,
        page_size: 100,
      };

      return api.get<JsonValue>(rolePermissionsPath(numericRoleId), params, signal);
    },
    enabled: isValidRoleId,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });
}

export function useRoleTemplates(scope?: ScopeType) {
  return useQuery({
    queryKey: ['api', ApiUrlsV1.roles.list, 'templates', scope ?? 'all'],
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
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
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

  const normalizedScope: ScopeType =
    options?.scope ??
    (authScope === 'branch' ? 'branch' : resolvedCompanyId != null ? 'company' : 'organization');

  return useQuery({
    queryKey: [
      'employees',
      'directory',
      resolvedOrgId ?? 'all',
      resolvedCompanyId ?? 'all',
      normalizedScope,
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
            scope: normalizedScope,
          },
          get,
        );
      } catch {
        return enrichDirectoryWithSession([], [], sessionHints);
      }
    },
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    placeholderData: (previous) => previous,
  });
}

function compact(record: JsonObject): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(record).filter(
      (entry): entry is [string, string | number] =>
        entry[1] !== undefined && entry[1] !== null && entry[1] !== '',
    ),
  ) as Record<string, string | number>;
}
