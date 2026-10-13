'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import { Toast, type ToastSeverity } from '@/components/shared/ui/Toast';
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import { Card } from '@/components/shared/ui/Card';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import { DataGrid, type DataGridColumn } from '@/components/shared/ui/DataGrid';
import { SearchBar } from '@/components/shared/form-fields/SearchBar';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { colors } from '@/lib/theme/mui/colors';

import type { UserRoleItem, UserStatus, ScopeType } from '@/types/user-roles';
import type { UserRoleFormValues } from '@/lib/schemas/user-roles';
import { useUserRoles } from '@/lib/hooks/user-roles';
import {
  ROLE_OPTIONS,
  BRANCH_OPTIONS,
  COMPANY_ROLE_OPTIONS,
  COMPANY_BRANCH_OPTIONS,
  BRANCH_ROLE_OPTIONS,
  BRANCH_BRANCH_OPTIONS,
} from '@/lib/mocks/employees/useUserRoles.mocks';
import {
  UserRoleStats,
  AddUserModal,
  UserFilterPopover,
  UserRowActionsMenu,
} from '@/components/features/user-roles';
import { CreateUserMultiformFlow } from './CreateUserMultiformFlow';

export interface UsersAndRolesScreenProps {
  scope?: ScopeType;
  companyName?: string;
}

export function UsersAndRolesScreen({
  scope,
  companyName = 'VJITVI',
}: Readonly<UsersAndRolesScreenProps> = {}) {
  const router = useRouter();
  const pathname = usePathname() || '';

  const resolvedScope: ScopeType =
    scope ||
    (pathname.includes('/company')
      ? 'company'
      : pathname.includes('/branch')
        ? 'branch'
        : 'organization');

  const {
    paginatedUsers,
    stats,
    searchQuery,
    setSearchQuery,
    selectedRole,
    setSelectedRole,
    selectedBranch,
    setSelectedBranch,
    selectedStatus,
    setSelectedStatus,
    page,
    setPage,
    pageSize,
    totalRows,
    hasActiveFilters,
    resetFilters,
    addUser,
    updateUser,
    deleteUser,
    changeUserStatus,
  } = useUserRoles({ pageSize: 8, scope: resolvedScope, companyName });

  const roleOptions =
    resolvedScope === 'branch'
      ? BRANCH_ROLE_OPTIONS
      : resolvedScope === 'company'
        ? COMPANY_ROLE_OPTIONS
        : ROLE_OPTIONS;
  const branchOptions =
    resolvedScope === 'branch'
      ? BRANCH_BRANCH_OPTIONS
      : resolvedScope === 'company'
        ? COMPANY_BRANCH_OPTIONS
        : BRANCH_OPTIONS;

  // View mode fallback: 'table' or 'multiform'
  const [viewMode, setViewMode] = useState<'table' | 'multiform'>('table');

  // Modal & Menu states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRoleItem | null>(null);

  // Filter Popover state
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);

  // Action Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedUserForAction, setSelectedUserForAction] = useState<UserRoleItem | null>(null);

  // Feedback Notification state
  const [feedback, setFeedback] = useState<{
    open: boolean;
    message: string;
    severity: ToastSeverity;
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showNotification = (message: string, severity: ToastSeverity = 'success') => {
    setFeedback({ open: true, message, severity });
  };

  // Compute base route correctly preserving company, branch, or org context
  const getBaseRoute = () => {
    const cleanBase = pathname.replace(/\/$/, '');
    if (cleanBase.endsWith('users-and-roles')) return cleanBase;
    if (resolvedScope === 'company') return '/company/employees/users-and-roles';
    if (resolvedScope === 'branch') return '/branch-manager/employees/users-and-roles';
    return pathname.startsWith('/users-and-roles')
      ? '/users-and-roles'
      : '/organization/employees/users-and-roles';
  };
  const baseRoute = getBaseRoute();

  // Route-based Multiform navigation
  const handleOpenAddModal = () => {
    router.push(`${baseRoute}/template`);
  };

  const handleOpenEditModal = (user: UserRoleItem) => {
    setEditingUser(user);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = (values: UserRoleFormValues) => {
    if (editingUser) {
      updateUser(editingUser.id, values);
      showNotification(`User "${values.name}" updated successfully.`);
    } else {
      addUser(values);
      showNotification(`User "${values.name}" created successfully.`);
    }
  };

  // Filter Popover handlers
  const handleOpenFilter = (e: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(e.currentTarget);
  };

  const handleCloseFilter = () => {
    setFilterAnchorEl(null);
  };

  // Row Action Menu handlers
  const handleOpenActionMenu = (e: React.MouseEvent<HTMLButtonElement>, user: UserRoleItem) => {
    setSelectedUserForAction(user);
    setMenuAnchorEl(e.currentTarget);
  };

  const handleCloseActionMenu = () => {
    setMenuAnchorEl(null);
    setSelectedUserForAction(null);
  };

  const handleEditFromMenu = (user?: UserRoleItem) => {
    const targetUser = user || selectedUserForAction;
    handleCloseActionMenu();
    if (targetUser) {
      router.push(`${baseRoute}/edit`);
    }
  };

  const handleViewProfileFromMenu = (user?: UserRoleItem) => {
    const targetUser = user || selectedUserForAction;
    handleCloseActionMenu();
    if (targetUser) {
      router.push(`${baseRoute}/profile`);
    }
  };

  const handleDeleteFromMenu = () => {
    if (selectedUserForAction) {
      deleteUser(selectedUserForAction.id);
      showNotification(`User "${selectedUserForAction.name}" removed.`);
    }
    handleCloseActionMenu();
  };

  const handleToggleStatusFromMenu = () => {
    if (selectedUserForAction) {
      const nextStatus: UserStatus =
        selectedUserForAction.status === 'active' ? 'disabled' : 'active';
      changeUserStatus(selectedUserForAction.id, nextStatus);
      showNotification(`Status updated to "${nextStatus}".`);
    }
    handleCloseActionMenu();
  };

  // Multiform flow user created callback
  const handleMultiformUserCreated = (values: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    branch: string;
  }) => {
    addUser({
      name: `${values.firstName} ${values.lastName}`.trim(),
      email: values.email,
      role: values.role,
      branch: values.branch,
      status: 'invited',
    });
    showNotification(`Invitation sent to ${values.email}.`);
    setViewMode('table');
  };

  // Table columns definition with shared StatusChip reuse
  const columns: DataGridColumn<UserRoleItem>[] = [
    {
      field: 'name',
      headerName: 'FULL NAME',
      minWidth: 220,
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            src={row.avatar}
            alt={row.name}
            sx={{
              width: 32,
              height: 32,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(51, 84, 244, 0.25)'
                  : 'rgba(51, 84, 244, 0.12)',
              color: colors.primary.default,
              fontSize: '0.8125rem',
              fontWeight: 700,
            }}
          >
            {row.name.charAt(0)}
          </Avatar>
          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'text.primary',
              letterSpacing: '-0.01em',
            }}
          >
            {row.name}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: 'EMAIL',
      minWidth: 230,
      render: (row) => (
        <Typography sx={{ fontSize: '0.875rem', color: colors.text.secondary }}>
          {row.email}
        </Typography>
      ),
    },
    {
      field: 'role',
      headerName: 'ROLE',
      minWidth: 150,
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
          <StatusChip label={row.role} variantType="role" pill sx={{ ml: '3px' }} />
        </Box>
      ),
    },
    {
      field: 'branch',
      headerName: 'BRANCH',
      minWidth: 160,
      render: (row) => (
        <Typography
          sx={{
            fontSize: '0.875rem',
            color: 'text.primary',
            fontWeight: 500,
          }}
        >
          {row.branch}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'STATUS',
      minWidth: 130,
      render: (row) => (
        <StatusChip
          label={row.status}
          status={row.status}
          showDot
          sx={{
            height: 24,
            fontWeight: 600,
            fontSize: '0.8125rem',
            borderRadius: '6px',
            bgcolor: 'transparent',
            textTransform: 'lowercase',
            '& .MuiChip-label': { px: 0.5 },
          }}
        />
      ),
    },
    {
      field: 'actions',
      headerName: '',
      align: 'right',
      width: 50,
      minWidth: 50,
      sortable: false,
      render: (row) => (
        <IconButton
          size="small"
          aria-label={`Actions for ${row.name}`}
          onClick={(e) => handleOpenActionMenu(e, row)}
          sx={{
            color: colors.text.secondary,
            '&:hover': {
              color: 'text.primary',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'action.hover' : colors.surface.muted,
            },
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  const activeFiltersCount = [selectedRole, selectedBranch, selectedStatus].filter(Boolean).length;

  if (viewMode === 'multiform') {
    return (
      <CreateUserMultiformFlow
        onExit={() => setViewMode('table')}
        onUserCreated={handleMultiformUserCreated}
      />
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 2, md: 2.5 },
      }}
    >
      {/* ---------------------------------------------------------------- */}
      {/* Page Header: Title, Subtitle and Add User Button                 */}
      {/* ---------------------------------------------------------------- */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontSize: { xs: '1.375rem', sm: '1.625rem' },
              fontWeight: 700,
              color: 'text.primary',
              letterSpacing: '-0.02em',
            }}
          >
            Users & Roles
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: colors.text.secondary,
              mt: 0.25,
              fontSize: '0.875rem',
            }}
          >
            Manage your team members and their system access levels.
          </Typography>
        </Box>

        <ActionButton
          variant="primary"
          onClick={handleOpenAddModal}
          startIcon={<PersonAddAlt1OutlinedIcon fontSize="small" />}
          sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
        >
          Add User
        </ActionButton>
      </Box>

      {/* ---------------------------------------------------------------- */}
      {/* 4 Summary Stats Cards                                            */}
      {/* ---------------------------------------------------------------- */}
      <UserRoleStats stats={stats} />

      {/* ---------------------------------------------------------------- */}
      {/* Main Table Card with Search, Filters and Internal Scrolling      */}
      {/* ---------------------------------------------------------------- */}
      <Card
        variant="outlined"
        padding={2.5}
        sx={{
          width: '100%',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? colors.surface.dark : colors.surface.default,
          borderRadius: '12px',
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          boxShadow: 'none',
        }}
      >
        {/* Table Toolbar: Global SearchBar + Filters Button */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
          }}
        >
          <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 260 } }}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
              placeholder="Search users..."
              fullWidth
            />
          </Box>

          <ActionButton
            variant={hasActiveFilters ? 'primary' : 'outlined'}
            onClick={handleOpenFilter}
            startIcon={<TuneOutlinedIcon fontSize="small" />}
            sx={{
              borderColor: (theme) =>
                hasActiveFilters
                  ? undefined
                  : theme.palette.mode === 'dark'
                    ? theme.palette.divider
                    : colors.border.default,
              minWidth: 100,
            }}
          >
            Filters{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}
          </ActionButton>
        </Box>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
            {selectedRole && (
              <Chip
                label={`Role: ${selectedRole}`}
                size="small"
                onDelete={() => setSelectedRole('')}
                sx={{ borderRadius: '6px' }}
              />
            )}
            {selectedBranch && (
              <Chip
                label={`Branch: ${selectedBranch}`}
                size="small"
                onDelete={() => setSelectedBranch('')}
                sx={{ borderRadius: '6px' }}
              />
            )}
            {selectedStatus && (
              <Chip
                label={`Status: ${selectedStatus}`}
                size="small"
                onDelete={() => setSelectedStatus('')}
                sx={{ borderRadius: '6px' }}
              />
            )}
            <ActionButton variant="text" size="small" onClick={resetFilters}>
              Clear All
            </ActionButton>
          </Box>
        )}

        {/* DataGrid Table Container with Independent Internal Scrolling */}
        <Box
          sx={{
            width: '100%',
            overflowX: 'auto',
            maxHeight: { xs: 400, md: 'calc(100vh - 350px)' },
            overflowY: 'auto',
            pr: 0.5,
            '&::-webkit-scrollbar': {
              width: 6,
              height: 6,
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
              borderRadius: 3,
            },
          }}
        >
          <DataGrid
            columns={columns}
            rows={paginatedUsers}
            getRowId={(row) => row.id}
            stickyHeader
            pagination
            page={page}
            pageSize={pageSize}
            totalRows={totalRows}
            onPageChange={setPage}
            paginationEntityName="users"
            emptyTitle="No users found"
            emptySubtitle="No team members match your active search or filters."
            sx={{
              border: 'none',
              boxShadow: 'none',
              bgcolor: 'transparent',
              '& .MuiTableHead-root .MuiTableRow-root': {
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? colors.surface.dark : colors.surface.default,
              },
              '& .MuiTableCell-head': {
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? colors.surface.dark : colors.surface.default,
                borderColor: (theme) =>
                  theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: colors.text.secondary,
                py: 1.25,
                px: 2,
              },
              '& .MuiTableCell-body': {
                borderColor: (theme) =>
                  theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
                py: 1.5,
                px: 2,
              },
              '& .MuiTableRow-root:hover': {
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'action.hover' : colors.surface.muted,
              },
            }}
          />
        </Box>
      </Card>

      {/* Add / Edit User Modal */}
      <AddUserModal
        open={isAddModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveUser}
        editUser={editingUser}
        roleOptions={roleOptions}
        branchOptions={branchOptions}
      />

      {/* Filter Popover */}
      <UserFilterPopover
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleCloseFilter}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        selectedBranch={selectedBranch}
        onBranchChange={setSelectedBranch}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onReset={resetFilters}
        roleOptions={roleOptions}
        branchOptions={branchOptions}
      />

      {/* Row Action Menu */}
      <UserRowActionsMenu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseActionMenu}
        user={selectedUserForAction}
        onViewProfile={handleViewProfileFromMenu}
        onEdit={handleEditFromMenu}
        onDelete={handleDeleteFromMenu}
        onStatusChange={(id, status) => {
          changeUserStatus(id, status);
          showNotification(`Status updated to "${status}".`);
        }}
      />

      {/* Global Toast Feedback */}
      <Toast
        open={feedback.open}
        message={feedback.message}
        severity={feedback.severity}
        onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
      />
    </Box>
  );
}

export default UsersAndRolesScreen;
