'use client';

import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { colors } from '@/lib/theme/mui/colors';
import {
  USER_LIST_SORT_FIELDS,
  USER_SORT_FIELD_LABELS,
  USER_STATUS_OPTIONS,
  type UserListSortBy,
  type UserListSortOrder,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';

export interface UserRoleFilterOption {
  code: string;
  name: string;
}

export interface UserEntityFilterOption {
  id: number;
  name: string;
  companyId?: number;
}

export interface UserListFilterPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;

  // Role filter
  selectedRole?: string;
  onRoleChange?: (roleCode: string) => void;
  roleOptions?: readonly (string | UserRoleFilterOption)[];

  // Status filter
  selectedStatus?: string;
  onStatusChange?: (status: string) => void;

  // Company filter (organization scope)
  showCompanyFilter?: boolean;
  selectedCompanyId?: number | null;
  onCompanyChange?: (companyId: number | null) => void;
  companyOptions?: readonly UserEntityFilterOption[];

  // Branch filter (organization & company scope)
  showBranchFilter?: boolean;
  selectedBranchId?: number | null;
  selectedBranchName?: string;
  onBranchChange?: (branchId: number | null, branchName?: string) => void;
  branchOptions?: readonly (string | UserEntityFilterOption)[];

  // Sorting
  sortBy?: UserListSortBy;
  sortOrder?: UserListSortOrder;
  onSortChange?: (field: UserListSortBy, order: UserListSortOrder) => void;

  // Reset
  onReset?: () => void;

  sx?: SxProps<Theme>;
}

export function UserListFilterPopover({
  anchorEl,
  open,
  onClose,
  selectedRole = '',
  onRoleChange,
  roleOptions = [],
  selectedStatus = '',
  onStatusChange,
  showCompanyFilter = false,
  selectedCompanyId = null,
  onCompanyChange,
  companyOptions = [],
  showBranchFilter = false,
  selectedBranchId = null,
  selectedBranchName = '',
  onBranchChange,
  branchOptions = [],
  sortBy = 'created_at',
  sortOrder = 'desc',
  onSortChange,
  onReset,
  sx,
}: Readonly<UserListFilterPopoverProps>) {
  // Normalize role options
  const normalizedRoles = useMemo(() => {
    return roleOptions.map((r) => {
      if (typeof r === 'string') return { code: r, label: r };
      return { code: r.code || r.name, label: r.name };
    });
  }, [roleOptions]);

  const roleDropdownOptions = useMemo(
    () => ['All Roles', ...normalizedRoles.map((r) => r.label)],
    [normalizedRoles],
  );

  const selectedRoleLabel = useMemo(() => {
    if (!selectedRole) return 'All Roles';
    const found = normalizedRoles.find(
      (r) =>
        r.code.toLowerCase() === selectedRole.toLowerCase() ||
        r.label.toLowerCase() === selectedRole.toLowerCase(),
    );
    return found?.label ?? selectedRole;
  }, [selectedRole, normalizedRoles]);

  // Normalize company options
  const companyDropdownOptions = useMemo(
    () => ['All Companies', ...companyOptions.map((c) => c.name)],
    [companyOptions],
  );

  const selectedCompanyLabel = useMemo(() => {
    if (selectedCompanyId == null) return 'All Companies';
    const found = companyOptions.find((c) => c.id === selectedCompanyId);
    return found?.name ?? 'All Companies';
  }, [selectedCompanyId, companyOptions]);

  // Normalize and filter branch options by selected company
  const normalizedBranches: UserEntityFilterOption[] = useMemo(() => {
    return branchOptions.map((b, idx) => {
      if (typeof b === 'string') return { id: idx + 1, name: b };
      return b;
    });
  }, [branchOptions]);

  const availableBranches = useMemo(() => {
    if (selectedCompanyId != null) {
      return normalizedBranches.filter(
        (b) => b.companyId == null || b.companyId === selectedCompanyId,
      );
    }
    return normalizedBranches;
  }, [normalizedBranches, selectedCompanyId]);

  const branchDropdownOptions = useMemo(
    () => ['All Branches', ...availableBranches.map((b) => b.name)],
    [availableBranches],
  );

  const selectedBranchLabel = useMemo(() => {
    if (selectedBranchId != null) {
      const found = normalizedBranches.find((b) => b.id === selectedBranchId);
      if (found?.name) return found.name;
    }
    if (selectedBranchName) return selectedBranchName;
    return 'All Branches';
  }, [selectedBranchId, selectedBranchName, normalizedBranches]);

  // Status options
  const statusDropdownOptions = useMemo(
    () => ['All Statuses', ...USER_STATUS_OPTIONS.map((s) => s.label)],
    [],
  );

  const selectedStatusLabel = useMemo(() => {
    if (!selectedStatus) return 'All Statuses';
    const found = USER_STATUS_OPTIONS.find((s) => s.value === selectedStatus);
    return found?.label ?? selectedStatus;
  }, [selectedStatus]);

  // Sort dropdown options
  const sortDropdownOptions = useMemo(
    () => USER_LIST_SORT_FIELDS.map((field) => USER_SORT_FIELD_LABELS[field]),
    [],
  );

  const selectedSortLabel = USER_SORT_FIELD_LABELS[sortBy] ?? 'Date Created';

  const handleRoleSelect = (label: string) => {
    if (!onRoleChange) return;
    if (label === 'All Roles') {
      onRoleChange('');
      return;
    }
    const found = normalizedRoles.find((r) => r.label === label);
    onRoleChange(found?.code ?? label);
  };

  const handleStatusSelect = (label: string) => {
    if (!onStatusChange) return;
    if (label === 'All Statuses') {
      onStatusChange('');
      return;
    }
    const found = USER_STATUS_OPTIONS.find((s) => s.label === label);
    onStatusChange(found?.value ?? label.toLowerCase());
  };

  const handleCompanySelect = (name: string) => {
    if (!onCompanyChange) return;
    if (name === 'All Companies') {
      onCompanyChange(null);
      return;
    }
    const found = companyOptions.find((c) => c.name === name);
    onCompanyChange(found ? found.id : null);
  };

  const handleBranchSelect = (name: string) => {
    if (!onBranchChange) return;
    if (name === 'All Branches') {
      onBranchChange(null, '');
      return;
    }
    const found = normalizedBranches.find((b) => b.name === name);
    onBranchChange(found ? found.id : null, name);
  };

  const handleSortFieldSelect = (label: string) => {
    if (!onSortChange) return;
    const entry = Object.entries(USER_SORT_FIELD_LABELS).find(([, val]) => val === label);
    const field = (entry ? entry[0] : 'created_at') as UserListSortBy;
    onSortChange(field, sortOrder);
  };

  // Determine placement: below, above, or side to never cover the trigger button
  const placementConfig = useMemo(() => {
    if (!anchorEl || typeof window === 'undefined') {
      return {
        anchorOrigin: { vertical: 'bottom' as const, horizontal: 'right' as const },
        transformOrigin: { vertical: 'top' as const, horizontal: 'right' as const },
        marginSx: { mt: '8px' },
        maxHeight: 'calc(100vh - 48px)',
      };
    }

    const rect = anchorEl.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const spaceLeft = rect.left;
    const spaceRight = viewportWidth - rect.right;

    const MIN_POPOVER_HEIGHT = 360;

    // 1. Below: If space below is sufficient (or greater than above and >= 280)
    if (spaceBelow >= MIN_POPOVER_HEIGHT || (spaceBelow >= spaceAbove && spaceBelow >= 280)) {
      return {
        anchorOrigin: { vertical: 'bottom' as const, horizontal: 'right' as const },
        transformOrigin: { vertical: 'top' as const, horizontal: 'right' as const },
        marginSx: { mt: '8px' },
        maxHeight: Math.max(260, spaceBelow - 20),
      };
    }

    // 2. Above: If space above is sufficient (or greater than below and >= 280)
    if (spaceAbove >= MIN_POPOVER_HEIGHT || (spaceAbove > spaceBelow && spaceAbove >= 280)) {
      return {
        anchorOrigin: { vertical: 'top' as const, horizontal: 'right' as const },
        transformOrigin: { vertical: 'bottom' as const, horizontal: 'right' as const },
        marginSx: { mb: '8px' },
        maxHeight: Math.max(260, spaceAbove - 20),
      };
    }

    // 3. Side (left of the button): If vertical space is cramped, but left side has room
    if (spaceLeft >= 340) {
      return {
        anchorOrigin: { vertical: 'top' as const, horizontal: 'left' as const },
        transformOrigin: { vertical: 'top' as const, horizontal: 'right' as const },
        marginSx: { mr: '8px' },
        maxHeight: Math.max(260, viewportHeight - 32),
      };
    }

    // 4. Side (right of the button): If right side has room
    if (spaceRight >= 340) {
      return {
        anchorOrigin: { vertical: 'top' as const, horizontal: 'right' as const },
        transformOrigin: { vertical: 'top' as const, horizontal: 'left' as const },
        marginSx: { ml: '8px' },
        maxHeight: Math.max(260, viewportHeight - 32),
      };
    }

    // 5. Fallback: Whichever vertical side has more room
    if (spaceBelow >= spaceAbove) {
      return {
        anchorOrigin: { vertical: 'bottom' as const, horizontal: 'right' as const },
        transformOrigin: { vertical: 'top' as const, horizontal: 'right' as const },
        marginSx: { mt: '8px' },
        maxHeight: Math.max(220, spaceBelow - 16),
      };
    }

    return {
      anchorOrigin: { vertical: 'top' as const, horizontal: 'right' as const },
      transformOrigin: { vertical: 'bottom' as const, horizontal: 'right' as const },
      marginSx: { mb: '8px' },
      maxHeight: Math.max(220, spaceAbove - 16),
    };
  }, [anchorEl]);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      marginThreshold={8}
      anchorOrigin={placementConfig.anchorOrigin}
      transformOrigin={placementConfig.transformOrigin}
      slotProps={{
        paper: {
          sx: [
            {
              width: 320,
              maxHeight: placementConfig.maxHeight,
              overflowY: 'auto',
              p: 2.5,
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? colors.surface.dark : colors.surface.default,
              border: (theme) =>
                `1px solid ${
                  theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default
                }`,
              ...placementConfig.marginSx,
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ],
        },
      }}
    >
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', color: 'text.primary' }}>
            Filter Users
          </Typography>
          {onReset ? (
            <ActionButton
              variant="text"
              size="small"
              onClick={onReset}
              sx={{
                color: colors.primary.default,
                p: 0,
                minWidth: 'auto',
                fontWeight: 600,
                '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
              }}
            >
              Reset All
            </ActionButton>
          ) : null}
        </Box>

        <Divider />

        {/* Role Filter */}
        {onRoleChange ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary' }}>
              Role
            </Typography>
            <Dropdown
              options={roleDropdownOptions}
              value={selectedRoleLabel}
              onChange={handleRoleSelect}
              placeholder="Select role"
              sx={{ width: '100%' }}
            />
          </Box>
        ) : null}

        {/* Status Filter */}
        {onStatusChange ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary' }}>
              Status
            </Typography>
            <Dropdown
              options={statusDropdownOptions}
              value={selectedStatusLabel}
              onChange={handleStatusSelect}
              placeholder="Select status"
              sx={{ width: '100%' }}
            />
          </Box>
        ) : null}

        {/* Company Filter (Organization scope) */}
        {showCompanyFilter && onCompanyChange ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary' }}>
              Company
            </Typography>
            <Dropdown
              options={companyDropdownOptions}
              value={selectedCompanyLabel}
              onChange={handleCompanySelect}
              placeholder="Select company"
              sx={{ width: '100%' }}
            />
          </Box>
        ) : null}

        {/* Branch Filter */}
        {showBranchFilter && onBranchChange ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary' }}>
              Branch
            </Typography>
            <Dropdown
              options={branchDropdownOptions}
              value={selectedBranchLabel}
              onChange={handleBranchSelect}
              placeholder="Select branch"
              sx={{ width: '100%' }}
            />
          </Box>
        ) : null}

        {/* Sort By Filter */}
        {onSortChange ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary' }}>
              Sort By
            </Typography>
            <Dropdown
              options={sortDropdownOptions}
              value={selectedSortLabel}
              onChange={handleSortFieldSelect}
              placeholder="Select sort field"
              sx={{ width: '100%' }}
            />
          </Box>
        ) : null}

        <Divider />

        <ActionButton variant="primary" size="small" onClick={onClose} fullWidth>
          Apply Filters
        </ActionButton>
      </Stack>
    </Popover>
  );
}
