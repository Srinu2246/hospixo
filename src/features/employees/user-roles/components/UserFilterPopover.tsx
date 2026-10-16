'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { colors } from '@/lib/theme/mui/colors';
const STATUS_FILTER_OPTIONS = ['active', 'invited', 'disabled', 'inactive'] as const;

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
  roleOptions?: readonly string[];
  branchOptions?: readonly string[];
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
  roleOptions = [],
  branchOptions = [],
}: Readonly<UserFilterPopoverProps>) {
  const roleDropdownOptions = ['All Roles', ...roleOptions];
  const branchDropdownOptions = ['All Branches', ...branchOptions];
  const statusDropdownOptions = ['All Statuses', ...STATUS_FILTER_OPTIONS];

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
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? colors.surface.dark : colors.surface.default,
            border: (theme) =>
              `1px solid ${
                theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default
              }`,
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', color: 'text.primary' }}>
            Filter Users
          </Typography>
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
        </Box>

        <Divider />

        {/* Role Filter */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary' }}>
            Role
          </Typography>
          <Dropdown
            options={roleDropdownOptions}
            value={selectedRole || 'All Roles'}
            onChange={(val) => onRoleChange(val === 'All Roles' ? '' : val)}
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
            value={selectedBranch || 'All Branches'}
            onChange={(val) => onBranchChange(val === 'All Branches' ? '' : val)}
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
            value={selectedStatus || 'All Statuses'}
            onChange={(val) => onStatusChange(val === 'All Statuses' ? '' : val)}
            sx={{ width: '100%' }}
          />
        </Box>

        <Divider />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <ActionButton variant="primary" size="small" onClick={onClose} sx={{ width: '100%' }}>
            Apply Filters
          </ActionButton>
        </Box>
      </Box>
    </Popover>
  );
}

export default UserFilterPopover;
