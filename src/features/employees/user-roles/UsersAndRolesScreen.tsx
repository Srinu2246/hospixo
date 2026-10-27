'use client';

import React, { useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';

import { Header } from '@/components/shared/ui/Header';
import { Toast, type ToastSeverity } from '@/components/shared/ui/Toast';
import { Card } from '@/components/shared/ui/Card';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { colors } from '@/lib/theme/mui/colors';

import {
  type UserRoleItem,
  type ScopeType,
  type ParsedUserList,
  type UserRoleFormValues,
  isUserEditDisabled,
  resolveScopeFromPathname,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';
import { resolveEmployeeDirectoryOptions } from '@/lib/helpers/employees/userRolesHelpers';
import { useEmployeeDirectory, useUserRoles } from '@/lib/hooks/employees/user-roles';
import { useResolvedCompanyName } from '@/lib/hooks/useResolvedCompanyName';
import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useUserRolesUiStore } from '@/stores/userRolesUiStore';

import {
  UserRoleStats,
  UserFilterPopover,
  UserRowActionsMenu,
  AddUserModal,
} from '@/components/features/user-roles';
import { UserRoleTableToolbar } from '@/components/features/user-roles/table/UserRoleTableToolbar';
import { UserRoleDataGrid } from '@/components/features/user-roles/table/UserRoleDataGrid';
import { CreateUserMultiformFlow } from './CreateUserMultiformFlow';

export interface UsersAndRolesScreenProps {
  scope?: ScopeType;
  companyName?: string;
  initialUserList?: ParsedUserList;
}

export function UsersAndRolesScreen({
  scope,
  companyName: propsCompanyName,
  initialUserList,
}: Readonly<UsersAndRolesScreenProps> = {}) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const resolvedScope = resolveScopeFromPathname(pathname, scope);
  const companyName = useResolvedCompanyName(propsCompanyName, { scope: resolvedScope });

  const setSelectedUserId = useUserRolesUiStore((state) => state.setSelectedUserId);
  const contextOrgId = useSidebarStore((state) => state.context.organizationId);
  const accountOrgId = useSidebarStore((state) => state.account?.org_id ?? undefined);
  const contextCompanyId = useSidebarStore((state) => state.context.companyId);
  const accountCompanyId = useSidebarStore((state) => state.account?.company_id ?? undefined);
  const contextBranchId = useSidebarStore((state) => state.context.branchId);
  const accountBranchId = useSidebarStore((state) => state.account?.branch_id ?? undefined);
  const role = useSidebarStore((state) => state.role || state.user?.role || '');
  const authScope = useSidebarStore((state) => state.account?.scope ?? '');

  const organizationId = contextOrgId ?? accountOrgId;
  const directoryQuery = useMemo(
    () =>
      resolveEmployeeDirectoryOptions({
        wizardScope: resolvedScope,
        contextCompanyId,
        accountCompanyId,
        role,
        authScope,
      }),
    [resolvedScope, contextCompanyId, accountCompanyId, role, authScope],
  );
  const directory = useEmployeeDirectory(organizationId, directoryQuery.companyId, {
    scope: directoryQuery.directoryScope,
  });

  const activeBranchId = contextBranchId ?? accountBranchId;

  const {
    paginatedUsers,
    stats,
    roleOptions,
    isLoading,
    isError,
    error,
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
  } = useUserRoles({
    pageSize: 8,
    scope: resolvedScope,
    companyName,
    companyId: directoryQuery.companyId,
    branchId: activeBranchId,
    initialUserList,
  });

  const branchOptions = (directory.data?.branches ?? []).map((branch) => branch.name);

  const [viewMode, setViewMode] = useState<'table' | 'multiform'>('table');
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedUserForAction, setSelectedUserForAction] = useState<UserRoleItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRoleItem | null>(null);

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
      showNotification(`User "${values.name}" added successfully.`);
    }
    handleCloseModal();
  };

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

  const handleOpenAddModal = () => {
    router.push(`${baseRoute}/template`);
  };

  const handleOpenFilter = (e: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(e.currentTarget);
  };

  const handleCloseFilter = () => {
    setFilterAnchorEl(null);
  };

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
      if (isUserEditDisabled(targetUser.scope, resolvedScope)) {
        showNotification(
          `Cannot edit ${targetUser.scope ?? 'higher'}-scope role at the ${resolvedScope} level.`,
          'warning',
        );
        return;
      }
      setSelectedUserId(targetUser.id);
      router.push(`${baseRoute}/edit?id=${encodeURIComponent(targetUser.id)}`);
    }
  };

  const handleViewProfileFromMenu = (user?: UserRoleItem) => {
    const targetUser = user || selectedUserForAction;
    handleCloseActionMenu();
    if (targetUser) {
      setSelectedUserId(targetUser.id);
      router.push(`${baseRoute}/profile?id=${encodeURIComponent(targetUser.id)}`);
    }
  };

  const handleDeleteFromMenu = (id?: string) => {
    const targetId = id || selectedUserForAction?.id;
    if (targetId) {
      deleteUser(targetId);
      showNotification(`User removed successfully.`);
    }
    handleCloseActionMenu();
  };

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
    setViewMode('table');
    showNotification('Invitation sent and user added successfully!');
  };

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
      <Header
        title="Users & Roles"
        subtitle="Manage your team members and their system access levels."
        actionSlot={
          <ActionButton
            variant="primary"
            onClick={handleOpenAddModal}
            startIcon={<PersonAddAlt1OutlinedIcon fontSize="small" />}
            sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
          >
            Add User
          </ActionButton>
        }
      />

      <UserRoleStats stats={stats} />

      {isLoading ? <AlertMessage variant="info" message="Loading users…" /> : null}

      {isError ? (
        <AlertMessage
          variant="error"
          message={error instanceof Error ? error.message : 'Unable to load users.'}
        />
      ) : null}

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
        <UserRoleTableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          hasActiveFilters={hasActiveFilters}
          activeFiltersCount={activeFiltersCount}
          selectedRole={selectedRole}
          selectedBranch={selectedBranch}
          selectedStatus={selectedStatus}
          onOpenFilter={handleOpenFilter}
          onClearRole={() => setSelectedRole('')}
          onClearBranch={() => setSelectedBranch('')}
          onClearStatus={() => setSelectedStatus('')}
          onResetFilters={resetFilters}
        />

        <UserRoleDataGrid
          users={paginatedUsers}
          isLoading={isLoading}
          page={page}
          pageSize={pageSize}
          totalRows={totalRows}
          scope={resolvedScope}
          companyName={companyName}
          onPageChange={setPage}
          onOpenActionMenu={handleOpenActionMenu}
        />
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

      <UserFilterPopover
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleCloseFilter}
        roleOptions={roleOptions}
        branchOptions={branchOptions}
        selectedRole={selectedRole}
        selectedBranch={selectedBranch}
        selectedStatus={selectedStatus}
        onRoleChange={setSelectedRole}
        onBranchChange={setSelectedBranch}
        onStatusChange={setSelectedStatus}
        onReset={resetFilters}
      />

      <UserRowActionsMenu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseActionMenu}
        user={selectedUserForAction}
        onEdit={handleEditFromMenu}
        onViewProfile={handleViewProfileFromMenu}
        onDelete={handleDeleteFromMenu}
        onStatusChange={(id, status) => {
          changeUserStatus(id, status);
          showNotification(`User is now ${status}.`, status === 'active' ? 'success' : 'info');
        }}
        isEditDisabled={
          selectedUserForAction
            ? isUserEditDisabled(selectedUserForAction.scope, resolvedScope)
            : false
        }
      />

      <Toast
        open={feedback.open}
        message={feedback.message}
        severity={feedback.severity}
        onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
      />
    </Box>
  );
}
