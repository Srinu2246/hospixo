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
  type UserListSortBy,
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
    roleCatalog,
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
    activeFilterCount,
    resetFilters,
    clearFilter,
    sortBy,
    sortOrder,
    setSort,
    selectedCompanyId,
    setSelectedCompanyId,
    selectedBranchId,
    setSelectedBranchId,
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
    companies: directory.data?.companies,
    initialUserList,
  });

  const branchOptions = (directory.data?.branches ?? []).map((branch) => branch.name);

  const companyOptions = useMemo(
    () =>
      (directory.data?.companies ?? []).map((c) => ({
        id: Number(c.id),
        name: c.name,
      })),
    [directory.data?.companies],
  );

  const branchFilterOptions = useMemo(
    () =>
      (directory.data?.branches ?? []).map((b) => ({
        id: Number(b.id),
        name: b.name,
        companyId: b.companyId != null ? Number(b.companyId) : undefined,
      })),
    [directory.data?.branches],
  );

  const filterRoleOptions = useMemo(
    () =>
      roleCatalog.length > 0
        ? roleCatalog.map((r) => ({ code: r.code || r.name, name: r.name }))
        : roleOptions,
    [roleCatalog, roleOptions],
  );

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

  const handleOpenFilter = (e: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl((prev) => (prev ? null : e.currentTarget));
  };

  const handleCloseFilter = () => {
    setFilterAnchorEl(null);
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
          selectedRole={selectedRole}
          onClearRole={() => clearFilter('role')}
          roleOptions={filterRoleOptions}
          selectedStatus={selectedStatus}
          onClearStatus={() => clearFilter('status')}
          showCompanyFilter={resolvedScope === 'organization'}
          selectedCompanyId={selectedCompanyId}
          onClearCompany={() => clearFilter('company')}
          companyOptions={companyOptions}
          showBranchFilter={resolvedScope !== 'branch'}
          selectedBranchId={selectedBranchId}
          selectedBranchName={selectedBranch}
          onClearBranch={() => clearFilter('branch')}
          branchOptions={branchFilterOptions}
          sortBy={sortBy}
          sortOrder={sortOrder}
          hasActiveFilters={hasActiveFilters}
          activeFiltersCount={activeFilterCount}
          onOpenFilter={handleOpenFilter}
          onResetFilters={resetFilters}
          onClearFilter={clearFilter}
        />

        <UserRoleDataGrid
          users={paginatedUsers}
          isLoading={isLoading}
          page={page}
          pageSize={pageSize}
          totalRows={totalRows}
          scope={resolvedScope}
          companyName={companyName}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(field, direction) => setSort(field as UserListSortBy, direction)}
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
        roleOptions={filterRoleOptions}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        showCompanyFilter={resolvedScope === 'organization'}
        companyOptions={companyOptions}
        selectedCompanyId={selectedCompanyId}
        onCompanyChange={setSelectedCompanyId}
        showBranchFilter={resolvedScope !== 'branch'}
        branchOptions={branchFilterOptions}
        selectedBranchId={selectedBranchId}
        selectedBranchName={selectedBranch}
        onBranchChange={(branchId, branchName) => {
          setSelectedBranchId(branchId);
          setSelectedBranch(branchName ?? '');
        }}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(field, order) => setSort(field as UserListSortBy, order)}
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
