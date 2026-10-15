'use client';

import { useState, useMemo } from 'react';
import type { UserRoleItem, UserRoleStatsData, UserStatus, ScopeType } from '@/types/user-roles';
import type { UserRoleFormValues } from '@/lib/schemas/user-roles/userrole.schema';
import {
  INITIAL_USERS,
  COMPANY_INITIAL_USERS,
  COMPANY_USER_ROLE_STATS,
  BRANCH_INITIAL_USERS,
  BRANCH_USER_ROLE_STATS,
} from '@/lib/mocks/employees/useUserRoles.mocks';

export interface UseUserRolesOptions {
  pageSize?: number;
  scope?: ScopeType;
  companyName?: string;
}

export interface UseUserRolesReturn {
  users: UserRoleItem[];
  paginatedUsers: UserRoleItem[];
  stats: UserRoleStatsData;
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
      ? { pageSize: pageSizeOrOptions, scope: 'organization' as ScopeType, companyName: 'VJITVI' }
      : {
          pageSize: pageSizeOrOptions.pageSize ?? 8,
          scope: pageSizeOrOptions.scope ?? 'company',
          companyName: pageSizeOrOptions.companyName ?? 'VJITVI',
        };

  const initialPageSize = options.pageSize;
  const scope = options.scope;
  const companyName = options.companyName;

  const [users, setUsers] = useState<UserRoleItem[]>(() => {
    if (scope === 'branch') {
      return [...BRANCH_INITIAL_USERS];
    }
    if (scope === 'company') {
      return [...COMPANY_INITIAL_USERS];
    }
    return [...INITIAL_USERS];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);

  // Derived filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // In branch scope, enforce branch isolation
      if (scope === 'branch' && user.branch && user.branch !== 'Downtown Branch') {
        return false;
      }

      // In company scope, enforce company isolation
      if (scope === 'company' && user.company && user.company !== companyName) {
        return false;
      }

      // Search query matching full name or email
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = user.name.toLowerCase().includes(q);
        const matchesEmail = user.email.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail) {
          return false;
        }
      }

      // Role filter
      if (selectedRole && user.role !== selectedRole) {
        return false;
      }

      // Branch filter
      if (selectedBranch && user.branch !== selectedBranch) {
        return false;
      }

      // Status filter
      if (selectedStatus && user.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [users, scope, companyName, searchQuery, selectedRole, selectedBranch, selectedStatus]);

  const totalRows = filteredUsers.length;

  // Paginated subset
  const startIndex = (page - 1) * initialPageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + initialPageSize);

  // Derive summary statistics scoped appropriately
  const stats: UserRoleStatsData = useMemo(() => {
    if (scope === 'branch') {
      const activeCount = users.filter((u) => u.status === 'active').length;
      const pendingCount = users.filter((u) => u.status === 'invited').length;
      const distinctRoles = new Set(users.map((u) => u.role));
      return {
        totalUsers: users.length >= 6 ? BRANCH_USER_ROLE_STATS.totalUsers : users.length,
        activeNow: users.length >= 6 ? BRANCH_USER_ROLE_STATS.activeNow : activeCount,
        pendingInvites: pendingCount,
        userRoles: Math.max(BRANCH_USER_ROLE_STATS.userRoles, distinctRoles.size),
      };
    }

    if (scope === 'company') {
      const activeCount = users.filter((u) => u.status === 'active').length;
      const pendingCount = users.filter((u) => u.status === 'invited').length;
      const distinctRoles = new Set(users.map((u) => u.role));
      return {
        totalUsers: users.length >= 16 ? COMPANY_USER_ROLE_STATS.totalUsers : users.length,
        activeNow: users.length >= 16 ? COMPANY_USER_ROLE_STATS.activeNow : activeCount,
        pendingInvites: pendingCount,
        userRoles: Math.max(COMPANY_USER_ROLE_STATS.userRoles, distinctRoles.size),
      };
    }

    const totalUsers = users.length >= 16 ? 124 : users.length;
    const activeNow =
      users.filter((u) => u.status === 'active').length + (users.length >= 16 ? 107 : 0);
    const pendingInvites = users.filter((u) => u.status === 'invited').length;
    const distinctRoles = new Set(users.map((u) => u.role));
    const userRolesCount = Math.max(14, distinctRoles.size);

    return {
      totalUsers,
      activeNow,
      pendingInvites,
      userRoles: userRolesCount,
    };
  }, [users, scope]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() || selectedRole || selectedBranch || selectedStatus,
  );

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedRole('');
    setSelectedBranch('');
    setSelectedStatus('');
    setPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    setPage(1);
  };

  const handleBranchChange = (branch: string) => {
    setSelectedBranch(branch);
    setPage(1);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setPage(1);
  };

  const addUser = (values: UserRoleFormValues) => {
    const newUser: UserRoleItem = {
      id: `usr-${Date.now()}`,
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      role: values.role,
      branch: scope === 'branch' ? 'Downtown Branch' : values.branch,
      status: values.status,
      company: values.company || companyName,
      scope,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + (users.length % 50)}?auto=format&fit=crop&w=120&q=80`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setUsers((prev) => [newUser, ...prev]);
    setPage(1);
  };

  const updateUser = (id: string, values: UserRoleFormValues) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              name: values.name.trim(),
              email: values.email.trim().toLowerCase(),
              role: values.role,
              branch: values.branch,
              status: values.status,
              company: values.company || user.company || companyName,
            }
          : user,
      ),
    );
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
  };

  const changeUserStatus = (id: string, status: UserStatus) => {
    setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, status } : user)));
  };

  return {
    users,
    paginatedUsers,
    stats,
    searchQuery,
    setSearchQuery: handleSearchChange,
    selectedRole,
    setSelectedRole: handleRoleChange,
    selectedBranch,
    setSelectedBranch: handleBranchChange,
    selectedStatus,
    setSelectedStatus: handleStatusChange,
    page,
    setPage,
    pageSize: initialPageSize,
    totalRows,
    hasActiveFilters,
    resetFilters,
    addUser,
    updateUser,
    deleteUser,
    changeUserStatus,
  };
}
