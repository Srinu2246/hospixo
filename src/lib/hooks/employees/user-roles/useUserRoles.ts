'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  enrichUserListRoles,
  parseRoleCatalog,
  parseUserList,
  parseUserRecord,
  readUserId,
  resolveRoleId,
  toAssignRoleBody,
  toCreateUserBody,
  toReplaceRolesBody,
  toUserStatusBody,
  type RoleCatalogItem,
  type ScopeType,
  type UserRoleFormValues,
  type UserRoleItem,
  type UserRoleStatsData,
  type UserStatus,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';
import { api } from '@/services/api/browserClient';
import ApiUrlsV1, { userRolesPath, userStatusPath } from '@/services/api/ApiUrlsV1';
import { ApiError } from '@/services/api/types';

export interface UseUserRolesOptions {
  pageSize?: number;
  scope?: ScopeType;
  companyName?: string;
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

const usersQueryRoot = ['api', ApiUrlsV1.users.list] as const;

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
        };

  const pageSize = options.pageSize;
  const scope = options.scope;

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
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) return false;
      return failureCount < 2;
    },
    placeholderData: (previous) => previous,
  });

  const rolesQuery = useQuery({
    queryKey: ['api', ApiUrlsV1.roles.list, scope],
    queryFn: async ({ signal }) =>
      parseRoleCatalog(await api.get<unknown>(ApiUrlsV1.roles.list, undefined, signal)),
    staleTime: 60_000,
  });

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

function compact(record: Record<string, unknown>): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(record).filter(
      (entry): entry is [string, string | number] =>
        entry[1] !== undefined && entry[1] !== null && entry[1] !== '',
    ),
  ) as Record<string, string | number>;
}
