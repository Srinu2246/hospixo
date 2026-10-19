'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useQuery } from '@/lib/hooks/api/useQuery';

import {
  autoEnableRolePermissions,
  enrichDirectoryWithSession,
  extractAssignedPermissionKeys,
  loadEmployeeDirectory,
  resolveAssignmentPermissionsPayload,
  resolveCreateUserRequestContext,
  type CreateUserIdHints,
} from '@/lib/helpers/employees/userRolesHelpers';
import {
  enrichUserListRoles,
  parseGroupedPermissions,
  parseRoleCatalog,
  parseRoleTemplates,
  parseUserList,
  parseUserRecord,
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
  type ParsedUserList,
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
  type UserRoleStatsData,
  type UserStatus,
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
import { ApiError } from '@/services/api/types';
import { useSidebarStore } from '@/stores/sidebarStore';
const usersQueryRoot = ['api', ApiUrlsV1.users.list] as const;

// ---------------------------------------------------------------------------
// Users list, filters, and CRUD mutations
// ---------------------------------------------------------------------------

export interface UseUserRolesOptions {
  pageSize?: number;
  scope?: ScopeType;
  companyName?: string;
  initialUserList?: ParsedUserList;
  companyId?: number;
  branchId?: number;
}

export interface UseUserRolesReturn {
  users: UserRoleItem[];
  paginatedUsers: UserRoleItem[];
  stats: UserRoleStatsData;
  roleOptions: string[];
  roleCatalog: RoleCatalogItem[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
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
      ? { pageSize: pageSizeOrOptions, scope: 'organization' as ScopeType }
      : {
          pageSize: pageSizeOrOptions.pageSize ?? 8,
          scope: pageSizeOrOptions.scope ?? 'company',
          companyName: pageSizeOrOptions.companyName,
          initialUserList: pageSizeOrOptions.initialUserList,
          companyId: pageSizeOrOptions.companyId,
          branchId: pageSizeOrOptions.branchId,
        };

  const pageSize = options.pageSize;
  const scope = options.scope;
  const initialUserList = options.initialUserList;

  const contextCompanyId = useSidebarStore((state) => state.context.companyId);
  const accountCompanyId = useSidebarStore((state) => state.account?.company_id);
  const contextBranchId = useSidebarStore((state) => state.context.branchId);
  const accountBranchId = useSidebarStore((state) => state.account?.branch_id);

  const resolvedCompanyId = options.companyId ?? contextCompanyId ?? accountCompanyId ?? undefined;
  const resolvedBranchId = options.branchId ?? contextBranchId ?? accountBranchId ?? undefined;

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
        search: searchQuery.trim() || undefined,
        role: selectedRole || undefined,
        branch: selectedBranch || undefined,
        status: selectedStatus || undefined,
        scope,
        scope_type: scope,
        company_id: resolvedCompanyId,
        branch_id: scope === 'branch' ? resolvedBranchId : undefined,
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
      parseUserList(await api.get<unknown>(ApiUrlsV1.users.list, listParams, signal)),
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
    retry: (failureCount, error) => {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) return false;
      return failureCount < 2;
    },
    placeholderData: (previous) => previous,
  });

  const rolesQuery = useRoleCatalogQuery(scope);

  const roleCatalog: RoleCatalogItem[] = useMemo(() => {
    if (Array.isArray(rolesQuery.data)) return rolesQuery.data;
    if (rolesQuery.data) return parseRoleCatalog(rolesQuery.data);
    return [];
  }, [rolesQuery.data]);

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
      (r) =>
        r.name.toLowerCase() === roleName.toLowerCase() ||
        String(r.id) === roleName ||
        r.code?.toLowerCase() === roleName.toLowerCase(),
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
      const createdPayload = await api.post<unknown>(
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
      api.get<unknown>(ApiUrlsV1.users.detail(userId!), undefined, signal),
  });

  const rolesQuery = useRoleCatalogQuery();
  const roleCatalog = useMemo(() => {
    if (Array.isArray(rolesQuery.data)) return rolesQuery.data;
    if (rolesQuery.data) return parseRoleCatalog(rolesQuery.data);
    return [];
  }, [rolesQuery.data]);

  const userItem = useMemo(() => {
    if (rawUserQuery.data) {
      return parseUserRecord(rawUserQuery.data);
    }
    const cachedList = queryClient.getQueryData<unknown>([...usersQueryRoot]);
    if (cachedList && userId) {
      const parsed = parseUserList(cachedList);
      const found = parsed.items.find((u: UserRoleItem) => String(u.id) === String(userId));
      if (found) return found;
    }
    return null;
  }, [rawUserQuery.data, queryClient, userId]);

  const profile = useMemo(() => {
    if (!userItem) return undefined;
    return staffProfileFromUser(userItem, rawUserQuery.data, roleCatalog);
  }, [userItem, rawUserQuery.data, roleCatalog]);

  const resolvedRoleId = useMemo(() => {
    if (userItem?.roleId) return userItem.roleId;
    if (profile?.roleName) return resolveRoleId(profile.roleName, roleCatalog);
    if (userItem?.role) return resolveRoleId(userItem.role, roleCatalog);
    return null;
  }, [userItem, profile, roleCatalog]);

  const matchedRole = useMemo(() => {
    if (!resolvedRoleId && !profile?.roleName && !userItem?.role) return undefined;
    return roleCatalog.find((r) => {
      if (resolvedRoleId != null && resolvedRoleId !== '') {
        return String(r.id) === String(resolvedRoleId);
      }
      if (profile?.roleName) {
        return r.name.toLowerCase() === profile.roleName.toLowerCase();
      }
      if (userItem?.role) {
        return r.name.toLowerCase() === userItem.role.toLowerCase();
      }
      return false;
    });
  }, [resolvedRoleId, profile, userItem, roleCatalog]);

  const userCompanyId = useMemo(() => {
    if (!rawUserQuery.data || typeof rawUserQuery.data !== 'object') return undefined;
    const rec = rawUserQuery.data as Record<string, unknown>;
    const data = (rec.data && typeof rec.data === 'object' ? rec.data : rec) as Record<
      string,
      unknown
    >;
    if (typeof data.company_id === 'number') return data.company_id;
    if (typeof data.companyId === 'number') return data.companyId;
    if (Array.isArray(data.branches) && data.branches[0] && typeof data.branches[0] === 'object') {
      const b = data.branches[0] as Record<string, unknown>;
      if (typeof b.company_id === 'number') return b.company_id;
    }
    return undefined;
  }, [rawUserQuery.data]);

  const userBranchId = useMemo(() => {
    if (!rawUserQuery.data || typeof rawUserQuery.data !== 'object') return undefined;
    const rec = rawUserQuery.data as Record<string, unknown>;
    const data = (rec.data && typeof rec.data === 'object' ? rec.data : rec) as Record<
      string,
      unknown
    >;
    if (typeof data.branch_id === 'number') return data.branch_id;
    if (typeof data.branchId === 'number') return data.branchId;
    if (Array.isArray(data.branches) && data.branches[0] && typeof data.branches[0] === 'object') {
      const b = data.branches[0] as Record<string, unknown>;
      if (typeof b.branch_id === 'number') return b.branch_id;
    }
    if (Array.isArray(data.roles) && data.roles[0] && typeof data.roles[0] === 'object') {
      const r = data.roles[0] as Record<string, unknown>;
      if (r.scope === 'branch' && typeof r.scope_id === 'number') return r.scope_id;
    }
    return undefined;
  }, [rawUserQuery.data]);

  const roleScope = matchedRole?.scope || userItem?.scope || options?.scope || 'branch';

  const rolePermissionsQuery = useRolePermissions(resolvedRoleId, {
    scope: roleScope,
    companyId: options?.companyId ?? userCompanyId,
    branchId: options?.branchId ?? userBranchId,
  });

  const permissionsQuery = useGroupedPermissions(enabled);

  const categories = useMemo(() => {
    const baseCategories = permissionsQuery.data ?? [];
    if (baseCategories.length === 0) return [];

    if (rolePermissionsQuery.data) {
      const assignedKeys = extractAssignedPermissionKeys(rolePermissionsQuery.data);
      if (assignedKeys.size > 0) {
        return autoEnableRolePermissions(baseCategories, assignedKeys);
      }
    }

    if (rawUserQuery.data) {
      const assignedKeys = extractAssignedPermissionKeys(rawUserQuery.data);
      if (assignedKeys.size > 0) {
        return autoEnableRolePermissions(baseCategories, assignedKeys);
      }
    }

    return baseCategories;
  }, [permissionsQuery.data, rolePermissionsQuery.data, rawUserQuery.data]);

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
        (!existingRoleName ||
          input.values.roleName.trim().toLowerCase() !== existingRoleName.trim().toLowerCase()),
      );

      if (roleChanged) {
        const matched = roleCatalog.find(
          (r) =>
            r.name.toLowerCase() === input.values.roleName.toLowerCase() ||
            String(r.id) === input.values.roleName ||
            r.code?.toLowerCase() === input.values.roleName.toLowerCase(),
        );
        const roleCode = matched?.code || resolveRoleCode(input.values.roleName, roleCatalog);
        if (roleCode) {
          const { context, account } = useSidebarStore.getState();
          const hints = {
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
            scope: matched?.scope || roleScope,
          };
          try {
            await api.put(userRolesPath(userId), toReplaceRolesBody(roleCode, hints));
          } catch {
            await api.post(userRolesPath(userId), toAssignRoleBody(roleCode, hints));
          }
        }
      }

      let userRoleId: string | null = null;
      try {
        const assignments = await api.get<unknown>(userAssignmentsPath(userId));
        userRoleId = readPrimaryUserRoleId(assignments);
      } catch {
        userRoleId = null;
      }

      if (userRoleId) {
        const payload = await resolveAssignmentPermissionsPayload(
          userId,
          userRoleId,
          input.categories,
          (path) => api.get(path),
        );

        let synced = false;
        try {
          await api.put(userRolePermissionsPath(userId, userRoleId), payload);
          synced = true;
        } catch {
          // fallback
        }

        if (!synced) {
          await api
            .put(
              `${ApiUrlsV1.users.list}/${encodeURIComponent(String(userId))}/permissions`,
              payload,
            )
            .catch(() => null);
        }
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['api', ApiUrlsV1.users.list] });
      if (userId) {
        await queryClient.invalidateQueries({ queryKey: ['api', ApiUrlsV1.users.list, userId] });
      }
    },
  });

  const activateMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Missing user id');
      await api.patch(userStatusPath(userId), toUserStatusBody('active'));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['api', ApiUrlsV1.users.list] });
      if (userId) {
        await queryClient.invalidateQueries({ queryKey: ['api', ApiUrlsV1.users.list, userId] });
      }
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Missing user id');
      await api.patch(userStatusPath(userId), toUserStatusBody('inactive'));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['api', ApiUrlsV1.users.list] });
      if (userId) {
        await queryClient.invalidateQueries({ queryKey: ['api', ApiUrlsV1.users.list, userId] });
      }
    },
  });

  const isPermissionsLoading =
    permissionsQuery.isLoading || (Boolean(resolvedRoleId) && rolePermissionsQuery.isLoading);

  return {
    profile,
    userItem,
    categories,
    matchedRole,
    roleCatalog,
    isLoading: (rawUserQuery.isLoading && !userItem) || isPermissionsLoading,
    isPermissionsLoading,
    isError: rawUserQuery.isError && !userItem,
    error: rawUserQuery.error,
    saveProfile: saveMutation.mutateAsync,
    activate: activateMutation.mutateAsync,
    deactivate: deactivateMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    isActivating: activateMutation.isPending,
    isDeactivating: deactivateMutation.isPending,
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
      const rolesPayload = await api.get<unknown>(ApiUrlsV1.roles.list);
      const roleCatalog = parseRoleCatalog(rolesPayload);
      const roleCode = resolveRoleCode(input.values.role, roleCatalog);
      const context = await resolveCreateUserRequestContext(
        { company: input.values.company, branch: input.values.branch },
        input.ids,
        (path, params) => api.get<unknown>(path, params),
        roleCatalog,
        roleCode,
      );
      const body = toCreateUserBody(input.values, context);
      const createdPayload = await api.post<unknown>(ApiUrlsV1.users.create, body);
      const userId = parseUserRecord(createdPayload)?.id ?? readUserId(createdPayload);
      if (!userId) return;

      if (roleCode) {
        const matched = roleCatalog.find(
          (r) =>
            r.code?.toLowerCase() === roleCode.toLowerCase() ||
            r.name.toLowerCase() === input.values.role.toLowerCase(),
        );
        const roleHints: RoleAssignmentHints = {
          companyId: context.companyId,
          branchId: context.branchId,
          scope: matched?.scope,
        };
        try {
          await api.put(userRolesPath(userId), toReplaceRolesBody(roleCode, roleHints));
        } catch {
          await api
            .post(userRolesPath(userId), toAssignRoleBody(roleCode, roleHints))
            .catch(() => null);
        }
      }

      let userRoleId: string | null = null;
      try {
        const assignments = await api.get<unknown>(userAssignmentsPath(userId));
        userRoleId = readPrimaryUserRoleId(assignments);
      } catch {
        userRoleId = null;
      }

      if (userRoleId) {
        const payload = await resolveAssignmentPermissionsPayload(
          userId,
          userRoleId,
          input.categories,
          (path) => api.get(path),
        );

        let synced = false;
        try {
          await api.put(userRolePermissionsPath(userId, userRoleId), payload);
          synced = true;
        } catch {
          // fallback
        }

        if (!synced) {
          await api
            .put(
              `${ApiUrlsV1.users.list}/${encodeURIComponent(String(userId))}/permissions`,
              payload,
            )
            .catch(() => null);
        }
      } else {
        const enabledPermissionIds = input.categories.flatMap((category) =>
          category.permissions
            .filter((permission) => permission.enabled)
            .map((permission) => permission.id),
        );
        const codesList = Array.from(new Set<string>(enabledPermissionIds));
        const fallbackPayload = {
          permission_codes: codesList,
          permission_ids: codesList,
        };

        await api
          .put(
            `${ApiUrlsV1.users.list}/${encodeURIComponent(String(userId))}/permissions`,
            fallbackPayload,
          )
          .catch(() => null);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['api', ApiUrlsV1.users.list] });
    },
  });
}

// ---------------------------------------------------------------------------
// Custom role template mutation
// ---------------------------------------------------------------------------

export function useCreateCustomRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      values: CustomTemplateFormValues;
      categories: PermissionCategory[];
    }) => {
      const created = await api.post<unknown>(
        ApiUrlsV1.roles.create,
        toCreateRoleBody(input.values.templateName, input.values.description),
      );
      const roleId =
        typeof created === 'object' && created && 'id' in created
          ? String((created as { id: string | number }).id)
          : null;
      const enabledPermissionIds = input.categories.flatMap((category) =>
        category.permissions
          .filter((permission) => permission.enabled)
          .map((permission) => permission.id),
      );
      if (roleId && enabledPermissionIds.length > 0) {
        await api.put(rolePermissionsPath(roleId), { permission_ids: enabledPermissionIds });
      }
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
      parseRoleCatalog(await api.get<unknown>(ApiUrlsV1.roles.list, undefined, signal)),
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
  const rawCompanyId = options?.companyId ?? context.companyId ?? account?.company_id ?? undefined;
  const rawBranchId = options?.branchId ?? context.branchId ?? account?.branch_id ?? undefined;

  const companyId = rawCompanyId != null && rawCompanyId !== '' ? Number(rawCompanyId) : undefined;
  const branchId = rawBranchId != null && rawBranchId !== '' ? Number(rawBranchId) : undefined;

  const requestedScope = options?.scope || 'branch';
  let scopeType: ScopeType = 'organization';
  if (requestedScope === 'branch') {
    scopeType =
      branchId != null && Number.isFinite(branchId)
        ? 'branch'
        : companyId != null && Number.isFinite(companyId)
          ? 'company'
          : 'organization';
  } else if (requestedScope === 'company') {
    scopeType = companyId != null && Number.isFinite(companyId) ? 'company' : 'organization';
  } else {
    scopeType = 'organization';
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
        ...(scopeType === 'branch' && branchId != null && Number.isFinite(branchId)
          ? { branch_id: branchId }
          : {}),
        page_size: 100,
      };

      return api.get<unknown>(rolePermissionsPath(roleId), params, signal);
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
        const rolesPayload = await api.get<unknown>(ApiUrlsV1.roles.list, undefined, signal);
        const parsed = parseRoleTemplates(rolesPayload);
        if (parsed.length > 0) return parsed;
      } catch {
        // Fallback to templates endpoint
      }

      try {
        const templatesPayload = await api.get<unknown>(
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
        const payload = await api.get<unknown>(ApiUrlsV1.permissions.grouped, undefined, signal);
        const parsed = parseGroupedPermissions(payload);
        if (parsed.length > 0) return parsed;
      } catch {
        // Try fallback endpoint
      }

      try {
        const fallback = await api.get<unknown>('/v1/permissions', undefined, signal);
        return parseGroupedPermissions(fallback);
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });
}

// ---------------------------------------------------------------------------
// Company / branch directory for create-user forms
// ---------------------------------------------------------------------------

export function useEmployeeDirectory(organizationId?: number, companyId?: number) {
  const account = useSidebarStore((state) => state.account);
  const context = useSidebarStore((state) => state.context);
  const role = useSidebarStore((state) => state.role);

  const resolvedOrgId = organizationId ?? context.organizationId ?? account?.org_id ?? undefined;
  const resolvedCompanyId = companyId ?? context.companyId ?? account?.company_id ?? undefined;

  const sessionReady = Boolean(role || account);
  const hasDirectoryScope = resolvedOrgId != null || resolvedCompanyId != null;

  return useQuery({
    queryKey: ['employees', 'directory', resolvedOrgId ?? 'none', resolvedCompanyId ?? 'none'],
    enabled: sessionReady && hasDirectoryScope,
    queryFn: async ({ signal }) => {
      const get = (
        path: string,
        params?: Record<string, string | number | boolean | null | undefined>,
      ) => api.get<unknown>(path, params, signal);

      const sessionHints = {
        companyId: resolvedCompanyId,
        companyName: context.companyName,
        branchId: context.branchId ?? account?.branch_id ?? undefined,
        branchName: context.branchName,
      };

      try {
        return await loadEmployeeDirectory(
          {
            organizationId: resolvedOrgId,
            companyId: resolvedCompanyId,
            session: sessionHints,
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

function compact(record: Record<string, unknown>): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(record).filter(
      (entry): entry is [string, string | number] =>
        entry[1] !== undefined && entry[1] !== null && entry[1] !== '',
    ),
  ) as Record<string, string | number>;
}
