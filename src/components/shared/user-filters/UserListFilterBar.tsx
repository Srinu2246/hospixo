'use client';

import React, { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import type { SxProps, Theme } from '@mui/material/styles';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { SearchBar } from '@/components/shared/form-fields/SearchBar';
import { colors } from '@/lib/theme/mui/colors';
import {
  USER_STATUS_OPTIONS,
  type UserListSortBy,
  type UserListSortOrder,
} from '@/lib/schemas/users/userListFilterSchema';
import {
  UserListFilterPopover,
  type UserEntityFilterOption,
  type UserRoleFilterOption,
} from './UserListFilterPopover';

export type { UserEntityFilterOption, UserRoleFilterOption };

export interface UserListFilterBarProps {
  // Search
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  // Active filters and counter
  hasActiveFilters?: boolean;
  activeFiltersCount?: number;

  // Filter dialog trigger
  onOpenFilter?: (e: React.MouseEvent<HTMLButtonElement>) => void;

  // Role filter & chip
  selectedRole?: string;
  selectedRoleLabel?: string;
  onRoleChange?: (roleCode: string) => void;
  onClearRole?: () => void;
  roleOptions?: readonly (string | UserRoleFilterOption)[];

  // Status filter & chip
  selectedStatus?: string;
  selectedStatusLabel?: string;
  onStatusChange?: (status: string) => void;
  onClearStatus?: () => void;

  // Company filter & chip (organization scope)
  showCompanyFilter?: boolean;
  selectedCompanyId?: number | null;
  selectedCompanyLabel?: string;
  onCompanyChange?: (companyId: number | null) => void;
  onClearCompany?: () => void;
  companyOptions?: readonly UserEntityFilterOption[];

  // Branch filter & chip (organization & company scope)
  showBranchFilter?: boolean;
  selectedBranchId?: number | null;
  selectedBranchName?: string;
  selectedBranchLabel?: string;
  onBranchChange?: (branchId: number | null, branchName?: string) => void;
  onClearBranch?: () => void;
  branchOptions?: readonly (string | UserEntityFilterOption)[];

  // Sorting
  sortBy?: UserListSortBy;
  sortOrder?: UserListSortOrder;
  onSortChange?: (field: UserListSortBy, order: UserListSortOrder) => void;

  // Reset
  onResetFilters?: () => void;
  onClearFilter?: (key: 'search' | 'role' | 'status' | 'company' | 'branch') => void;

  sx?: SxProps<Theme>;
}

export function UserListFilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search users by name, email, or username...',
  hasActiveFilters = false,
  activeFiltersCount = 0,
  onOpenFilter,
  selectedRole = '',
  selectedRoleLabel: customRoleLabel,
  onRoleChange,
  onClearRole,
  roleOptions = [],
  selectedStatus = '',
  selectedStatusLabel: customStatusLabel,
  onStatusChange,
  onClearStatus,
  showCompanyFilter = false,
  selectedCompanyId = null,
  selectedCompanyLabel: customCompanyLabel,
  onCompanyChange,
  onClearCompany,
  companyOptions = [],
  showBranchFilter = false,
  selectedBranchId = null,
  selectedBranchName = '',
  selectedBranchLabel: customBranchLabel,
  onBranchChange,
  onClearBranch,
  branchOptions = [],
  sortBy = 'created_at',
  sortOrder = 'desc',
  onSortChange,
  onResetFilters,
  onClearFilter,
  sx,
}: Readonly<UserListFilterBarProps>) {
  const [internalAnchorEl, setInternalAnchorEl] = useState<HTMLElement | null>(null);

  // If onOpenFilter is not supplied, use internal anchor element for popover
  const handleFilterClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onOpenFilter) {
      onOpenFilter(e);
    } else {
      setInternalAnchorEl((prev) => (prev ? null : e.currentTarget));
    }
  };

  const handleCloseInternalPopover = () => {
    setInternalAnchorEl(null);
  };

  // Resolved chip labels
  const roleChipLabel = useMemo(() => {
    if (customRoleLabel) return customRoleLabel;
    if (!selectedRole) return '';
    const match = roleOptions.find((r) => {
      if (typeof r === 'string') return r.toLowerCase() === selectedRole.toLowerCase();
      return (
        r.code.toLowerCase() === selectedRole.toLowerCase() ||
        r.name.toLowerCase() === selectedRole.toLowerCase()
      );
    });
    if (match) return typeof match === 'string' ? match : match.name;
    return selectedRole;
  }, [selectedRole, customRoleLabel, roleOptions]);

  const statusChipLabel = useMemo(() => {
    if (customStatusLabel) return customStatusLabel;
    if (!selectedStatus) return '';
    const match = USER_STATUS_OPTIONS.find((s) => s.value === selectedStatus);
    return match?.label ?? selectedStatus;
  }, [selectedStatus, customStatusLabel]);

  const companyChipLabel = useMemo(() => {
    if (customCompanyLabel) return customCompanyLabel;
    if (selectedCompanyId == null) return '';
    const match = companyOptions.find((c) => c.id === selectedCompanyId);
    return match?.name ?? `Company #${selectedCompanyId}`;
  }, [selectedCompanyId, customCompanyLabel, companyOptions]);

  const branchChipLabel = useMemo(() => {
    if (customBranchLabel) return customBranchLabel;
    if (selectedBranchName) return selectedBranchName;
    if (selectedBranchId == null) return '';
    const match = branchOptions.find((b) => {
      if (typeof b === 'string') return false;
      return b.id === selectedBranchId;
    });
    if (match && typeof match !== 'string') return match.name;
    return `Branch #${selectedBranchId}`;
  }, [selectedBranchId, selectedBranchName, customBranchLabel, branchOptions]);

  return (
    <Stack spacing={1.5} sx={[{ width: '100%', pb: 2 }, ...(Array.isArray(sx) ? sx : [sx])]}>
      {/* Search Bar + Controls */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
        }}
      >
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 260 } }}>
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            onClear={() => onSearchChange('')}
            placeholder={searchPlaceholder}
            fullWidth
          />
        </Box>

        <Box sx={{ flexShrink: 0 }}>
          {/* Filters Popover Trigger */}
          <ActionButton
            variant={hasActiveFilters ? 'primary' : 'outlined'}
            size="medium"
            onClick={handleFilterClick}
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
      </Box>

      {/* Internal Popover if caller does not control their own anchor */}
      {!onOpenFilter && (
        <UserListFilterPopover
          anchorEl={internalAnchorEl}
          open={Boolean(internalAnchorEl)}
          onClose={handleCloseInternalPopover}
          selectedRole={selectedRole}
          onRoleChange={onRoleChange}
          roleOptions={roleOptions}
          selectedStatus={selectedStatus}
          onStatusChange={onStatusChange}
          showCompanyFilter={showCompanyFilter}
          selectedCompanyId={selectedCompanyId}
          onCompanyChange={onCompanyChange}
          companyOptions={companyOptions}
          showBranchFilter={showBranchFilter}
          selectedBranchId={selectedBranchId}
          selectedBranchName={selectedBranchName}
          onBranchChange={onBranchChange}
          branchOptions={branchOptions}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={onSortChange}
          onReset={onResetFilters}
        />
      )}

      {/* Active Filter Chips */}
      {hasActiveFilters ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
          {searchQuery.trim() ? (
            <Chip
              label={`Search: "${searchQuery.trim()}"`}
              size="small"
              onDelete={onClearFilter ? () => onClearFilter('search') : () => onSearchChange('')}
              sx={{ borderRadius: '6px' }}
            />
          ) : null}
          {roleChipLabel ? (
            <Chip
              label={`Role: ${roleChipLabel}`}
              size="small"
              onDelete={
                onClearRole
                  ? onClearRole
                  : onClearFilter
                    ? () => onClearFilter('role')
                    : onRoleChange
                      ? () => onRoleChange('')
                      : undefined
              }
              sx={{ borderRadius: '6px' }}
            />
          ) : null}
          {statusChipLabel ? (
            <Chip
              label={`Status: ${statusChipLabel}`}
              size="small"
              onDelete={
                onClearStatus
                  ? onClearStatus
                  : onClearFilter
                    ? () => onClearFilter('status')
                    : onStatusChange
                      ? () => onStatusChange('')
                      : undefined
              }
              sx={{ borderRadius: '6px' }}
            />
          ) : null}
          {companyChipLabel ? (
            <Chip
              label={`Company: ${companyChipLabel}`}
              size="small"
              onDelete={
                onClearCompany
                  ? onClearCompany
                  : onClearFilter
                    ? () => onClearFilter('company')
                    : onCompanyChange
                      ? () => onCompanyChange(null)
                      : undefined
              }
              sx={{ borderRadius: '6px' }}
            />
          ) : null}
          {branchChipLabel ? (
            <Chip
              label={`Branch: ${branchChipLabel}`}
              size="small"
              onDelete={
                onClearBranch
                  ? onClearBranch
                  : onClearFilter
                    ? () => onClearFilter('branch')
                    : onBranchChange
                      ? () => onBranchChange(null, '')
                      : undefined
              }
              sx={{ borderRadius: '6px' }}
            />
          ) : null}
          {onResetFilters ? (
            <ActionButton
              variant="text"
              size="small"
              onClick={onResetFilters}
              sx={{
                fontSize: '0.75rem',
                color: colors.primary.default,
                p: 0.5,
                minWidth: 'auto',
                fontWeight: 600,
              }}
            >
              Reset all
            </ActionButton>
          ) : null}
        </Box>
      ) : null}
    </Stack>
  );
}
