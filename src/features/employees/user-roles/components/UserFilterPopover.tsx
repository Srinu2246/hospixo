'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { colors } from '@/lib/theme/mui/colors';
import {
  ROLE_OPTIONS,
  BRANCH_OPTIONS,
  STATUS_OPTIONS,
} from '@/lib/mocks/employees/useUserRoles.mocks';

export interface UserFilterPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  selectedRole: string;
  onRoleChange: (role: string) => void;
  selectedBranch: string;
  onBranchChange: (branch: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onReset: () => void;
}

export function UserFilterPopover({
  anchorEl,
  open,
  onClose,
  selectedRole,
  onRoleChange,
  selectedBranch,
  onBranchChange,
  selectedStatus,
  onStatusChange,
  onReset,
}: Readonly<UserFilterPopoverProps>) {
  const roleDropdownOptions = [
    { id: '', label: 'All Roles' },
    ...ROLE_OPTIONS.map((r) => ({ id: r, label: r })),
  ];
  const branchDropdownOptions = [
    { id: '', label: 'All Branches' },
    ...BRANCH_OPTIONS.map((b) => ({ id: b, label: b })),
  ];
  const statusDropdownOptions = [{ id: '', label: 'All Statuses' }, ...STATUS_OPTIONS];

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      slotProps={{
        paper: {
          sx: {
            width: 320,
            p: 2.5,
            borderRadius: '10px',
            border: '1px solid',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? colors.surface.dark : colors.surface.default,
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: 'text.primary' }}>
          Filter Users
        </Typography>
        <ActionButton variant="text" size="small" onClick={onReset}>
          Reset All
        </ActionButton>
      </Box>

      <Divider
        sx={{
          mb: 2,
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? theme.palette.divider : colors.divider.default,
        }}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Role Filter */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary' }}>
            Role
          </Typography>
          <Dropdown
            options={roleDropdownOptions}
            value={selectedRole}
            onChange={(val) => onRoleChange(val)}
            sx={{ width: '100%' }}
          />
        </Box>

        {/* Branch Filter */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary' }}>
            Branch
          </Typography>
          <Dropdown
            options={branchDropdownOptions}
            value={selectedBranch}
            onChange={(val) => onBranchChange(val)}
            sx={{ width: '100%' }}
          />
        </Box>

        {/* Status Filter */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary' }}>
            Status
          </Typography>
          <Dropdown
            options={statusDropdownOptions}
            value={selectedStatus}
            onChange={(val) => onStatusChange(val)}
            sx={{ width: '100%' }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
          <ActionButton variant="primary" size="small" onClick={onClose} fullWidth>
            Apply Filters
          </ActionButton>
        </Box>
      </Box>
    </Popover>
  );
}

export default UserFilterPopover;
