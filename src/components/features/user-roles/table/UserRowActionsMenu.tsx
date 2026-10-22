'use client';

import React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import type { UserRoleItem, UserStatus } from '@/lib/schemas/employees/user-roles/userRolesSchema';
import { colors } from '@/lib/theme/mui/colors';

export interface UserRowActionsMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  user: UserRoleItem | null;
  onEdit: (user: UserRoleItem) => void;
  onViewProfile?: (user: UserRoleItem) => void;
  onStatusChange: (id: string, status: UserStatus) => void;
  onDelete: (id: string) => void;
  isEditDisabled?: boolean;
}

export function UserRowActionsMenu({
  anchorEl,
  open,
  onClose,
  user,
  onEdit,
  onViewProfile,
  onStatusChange,
  onDelete,
  isEditDisabled = false,
}: Readonly<UserRowActionsMenuProps>) {
  if (!user) return null;

  const handleViewProfileClick = () => {
    onViewProfile?.(user);
    onClose();
  };

  const handleEditClick = () => {
    if (isEditDisabled) return;
    onEdit(user);
    onClose();
  };

  const handleToggleStatus = () => {
    if (isEditDisabled) return;
    const nextStatus: UserStatus = user.status === 'active' ? 'inactive' : 'active';
    onStatusChange(user.id, nextStatus);
    onClose();
  };

  const handleDeleteClick = () => {
    if (isEditDisabled) return;
    onDelete(user.id);
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      slotProps={{
        paper: {
          sx: {
            minWidth: 160,
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: (theme) =>
              `1px solid ${
                theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default
              }`,
            py: 0.5,
          },
        },
      }}
    >
      {/* View Staff Profile */}
      <MenuItem onClick={handleViewProfileClick} sx={{ py: 1 }}>
        <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>
          <VisibilityOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: 'text.primary' }}>
            View Profile
          </Typography>
        </ListItemText>
      </MenuItem>

      {/* Edit Role & Branch (Modal / Page) */}
      <MenuItem onClick={handleEditClick} disabled={isEditDisabled} sx={{ py: 1 }}>
        <ListItemIcon
          sx={{ minWidth: 32, color: isEditDisabled ? 'text.disabled' : 'text.secondary' }}
        >
          <EditOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>
          <Typography
            sx={{
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: isEditDisabled ? 'text.disabled' : 'text.primary',
            }}
          >
            Edit Details
          </Typography>
        </ListItemText>
      </MenuItem>

      {/* Toggle Status (Active/Inactive) */}
      <MenuItem onClick={handleToggleStatus} disabled={isEditDisabled} sx={{ py: 1 }}>
        <ListItemIcon
          sx={{ minWidth: 32, color: isEditDisabled ? 'text.disabled' : 'text.secondary' }}
        >
          {user.status === 'active' ? (
            <BlockOutlinedIcon
              fontSize="small"
              sx={{ color: isEditDisabled ? 'text.disabled' : 'warning.main' }}
            />
          ) : (
            <CheckCircleOutlineOutlinedIcon
              fontSize="small"
              sx={{ color: isEditDisabled ? 'text.disabled' : 'success.main' }}
            />
          )}
        </ListItemIcon>
        <ListItemText>
          <Typography
            sx={{
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: isEditDisabled
                ? 'text.disabled'
                : user.status === 'active'
                  ? 'warning.main'
                  : 'success.main',
            }}
          >
            {user.status === 'active' ? 'Inactivate' : 'Activate'}
          </Typography>
        </ListItemText>
      </MenuItem>

      {/* Delete User */}
      <MenuItem onClick={handleDeleteClick} disabled={isEditDisabled} sx={{ py: 1 }}>
        <ListItemIcon sx={{ minWidth: 32, color: isEditDisabled ? 'text.disabled' : 'error.main' }}>
          <DeleteOutlineOutlinedIcon
            fontSize="small"
            sx={{ color: isEditDisabled ? 'text.disabled' : 'error.main' }}
          />
        </ListItemIcon>
        <ListItemText>
          <Typography
            sx={{
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: isEditDisabled ? 'text.disabled' : 'error.main',
            }}
          >
            Delete User
          </Typography>
        </ListItemText>
      </MenuItem>
    </Menu>
  );
}
