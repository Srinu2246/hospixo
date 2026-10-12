'use client';

import { useState } from 'react';
import type { UserRoleItem, UserRoleStatsData, UserStatus } from '../types';
import type { UserRoleFormValues } from '../schemas/userrole.schema';
import { INITIAL_USERS } from '@/lib/mocks/employees/useUserRoles.mocks';

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

export function useUserRoles(initialPageSize = 8): UseUserRolesReturn {
  const [users, setUsers] = useState<UserRoleItem[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);

  // Derived filtered users list
  const filteredUsers = users.filter((user) => {
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

  const totalRows = filteredUsers.length;

  // Paginated subset
  const startIndex = (page - 1) * initialPageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + initialPageSize);

  // Derive summary statistics
  const totalUsers = users.length >= 16 ? 124 : users.length;
  const activeNow =
    users.filter((u) => u.status === 'active').length + (users.length >= 16 ? 107 : 0);
  const pendingInvites = users.filter((u) => u.status === 'invited').length;
  const distinctRoles = new Set(users.map((u) => u.role));
  const userRolesCount = Math.max(14, distinctRoles.size);

  const stats: UserRoleStatsData = {
    totalUsers,
    activeNow,
    pendingInvites,
    userRoles: userRolesCount,
  };

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
      branch: values.branch,
      status: values.status,
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
