'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  enrichDirectoryWithSession,
  loadEmployeeDirectory,
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
  type RoleCatalogItem,
  type ScopeType,
  type ScopedRolePermissionsParams,
  type StaffProfileFormValues,
  type UserRoleFormValues,
  type UserRoleItem,
  type UserRoleStatsData,
  type UserStatus,
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
}

export interface UseUserRolesReturn {
  users: UserRoleItem[];
  paginatedUsers: UserRoleItem[];
  stats: UserRoleStatsData;
  roleOptions: string[];
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
        };

  const pageSize = options.pageSize;
  const scope = options.scope;
  const initialUserList = options.initialUserList;

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
      }),
    [page, pageSize, searchQuery, selectedRole, selectedBranch, selectedStatus],
  );

  const usersQuery = useQuery({
    queryKey: [...usersQueryRoot, listParams, scope],
    queryFn: async ({ signal }) =>
      parseUserList(await api.get<unknown>(ApiUrlsV1.users.list, listParams, signal)),
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
      if (error instanceof ApiError && error.status === 401) return false;
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
    const roleId = resolveRoleId(roleName, catalog);
    if (!roleId) return;
    try {
      await api.put(userRolesPath(userId), toReplaceRolesBody([roleId]));
    } catch {
      await api.post(userRolesPath(userId), toAssignRoleBody(roleId));
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
      await api.patch(userStatusPath(id), toUserStatusBody('disabled'));
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
  };
}

// ---------------------------------------------------------------------------
// Staff profile (edit) queries and mutations
// ---------------------------------------------------------------------------

export function useStaffProfile(userId: string | null | undefined) {
  const queryClient = useQueryClient();
  const enabled = Boolean(userId);

  const userQuery = useQuery({
    queryKey: ['api', ApiUrlsV1.users.list, userId],
    enabled,
    queryFn: async ({ signal }) =>
      parseUserRecord(await api.get<unknown>(ApiUrlsV1.users.detail(userId!), undefined, signal)),
  });

  const permissionsQuery = useGroupedPermissions(enabled);

  const profile = userQuery.data ? staffProfileFromUser(userQuery.data) : undefined;

  const saveMutation = useMutation({
    mutationFn: async (input: {
      values: StaffProfileFormValues;
      categories: PermissionCategory[];
    }) => {
      if (!userId) throw new Error('Missing user id');
      await api.put(ApiUrlsV1.users.update(userId), toUpdateUserBody(input.values));
      await api.patch(
        userStatusPath(userId),
        toUserStatusBody(input.values.userStatus ? 'active' : 'disabled'),
      );

      const rolesPayload = await api.get<unknown>(ApiUrlsV1.roles.list);
      const roleId = resolveRoleId(input.values.roleName, parseRoleCatalog(rolesPayload));
      if (roleId) {
        try {
          await api.put(userRolesPath(userId), toReplaceRolesBody([roleId]));
        } catch {
          await api.post(userRolesPath(userId), toAssignRoleBody(roleId));
        }
      }

      const assignments = await api.get<unknown>(userAssignmentsPath(userId));
      const userRoleId = readPrimaryUserRoleId(assignments);
      const enabledPermissionIds = input.categories.flatMap((category) =>
        category.permissions
          .filter((permission) => permission.enabled)
          .map((permission) => permission.id),
      );
      if (userRoleId && enabledPermissionIds.length > 0) {
        await api.put(userRolePermissionsPath(userId, userRoleId), {
          permission_ids: enabledPermissionIds,
        });
      }
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
      await api.patch(userStatusPath(userId), toUserStatusBody('disabled'));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['api', ApiUrlsV1.users.list] });
      if (userId) {
        await queryClient.invalidateQueries({ queryKey: ['api', ApiUrlsV1.users.list, userId] });
      }
    },
  });

  return {
    profile,
    categories: permissionsQuery.data ?? [],
    isLoading: userQuery.isLoading || permissionsQuery.isLoading,
    isError: userQuery.isError,
    error: userQuery.error,
    saveProfile: saveMutation.mutateAsync,
    deactivate: deactivateMutation.mutateAsync,
    isSaving: saveMutation.isPending,
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

      const assignments = await api.get<unknown>(userAssignmentsPath(userId));
      const userRoleId = readPrimaryUserRoleId(assignments);
      const enabledPermissionIds = input.categories.flatMap((category) =>
        category.permissions
          .filter((permission) => permission.enabled)
          .map((permission) => permission.id),
      );
      if (userRoleId && enabledPermissionIds.length > 0) {
        await api.put(userRolePermissionsPath(userId, userRoleId), {
          permission_ids: enabledPermissionIds,
        });
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
  const scopeType = options?.scope || 'branch';
  const companyId = options?.companyId;
  const branchId = options?.branchId;

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
        scope_type: (scopeType as ScopeType) || 'branch',
        ...(companyId != null && companyId !== ''
          ? { company_id: Number(companyId) || String(companyId) }
          : {}),
        ...(branchId != null && branchId !== ''
          ? { branch_id: Number(branchId) || String(branchId) }
          : {}),
        page_size: 100,
      };
      return api.get<unknown>(rolePermissionsPath(roleId), params, signal);
    },
    enabled: roleId != null && roleId !== '',
    staleTime: 60_000,
  });
}

export function useRoleTemplates(scope: ScopeType = 'organization') {
  return useQuery({
    queryKey: ['api', ApiUrlsV1.roles.templates, scope],
    queryFn: async ({ signal }) => {
      const templatesPayload = await api.get<unknown>(ApiUrlsV1.roles.templates, undefined, signal);
      const fromTemplates = parseRoleTemplates(templatesPayload);
      if (fromTemplates.length > 0) return fromTemplates;

      const rolesPayload = await api.get<unknown>(ApiUrlsV1.roles.list, undefined, signal);
      return parseRoleTemplates(rolesPayload);
    },
    staleTime: 60_000,
  });
}

export function useGroupedPermissions(enabled = true) {
  return useQuery({
    queryKey: ['api', ApiUrlsV1.permissions.grouped],
    enabled,
    queryFn: async ({ signal }) =>
      parseGroupedPermissions(
        await api.get<unknown>(ApiUrlsV1.permissions.grouped, undefined, signal),
      ),
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
