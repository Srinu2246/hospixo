'use client';

import React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import type { UserRoleItem, UserStatus } from '../types';
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
}: Readonly<UserRowActionsMenuProps>) {
  if (!user) return null;

  const handleViewProfileClick = () => {
    onViewProfile?.(user);
    onClose();
  };

  const handleEditClick = () => {
    onEdit(user);
    onClose();
  };

  const handleToggleStatus = () => {
    const nextStatus: UserStatus = user.status === 'active' ? 'disabled' : 'active';
    onStatusChange(user.id, nextStatus);
    onClose();
  };

  const handleDeleteClick = () => {
    onDelete(user.id);
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            minWidth: 160,
            borderRadius: '8px',
            border: '1px solid',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            p: 0.5,
          },
        },
      }}
    >
      {onViewProfile && (
        <MenuItem
          onClick={handleViewProfileClick}
          sx={{ fontSize: '0.875rem', borderRadius: '6px' }}
        >
          <ListItemIcon sx={{ minWidth: 28, color: 'text.secondary' }}>
            <VisibilityOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="View Profile"
            slotProps={{ primary: { sx: { fontSize: '0.875rem' } } }}
          />
        </MenuItem>
      )}

      <MenuItem onClick={handleEditClick} sx={{ fontSize: '0.875rem', borderRadius: '6px' }}>
        <ListItemIcon sx={{ minWidth: 28, color: 'text.secondary' }}>
          <EditOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText
          primary="Edit User"
          slotProps={{ primary: { sx: { fontSize: '0.875rem' } } }}
        />
      </MenuItem>

      <MenuItem onClick={handleToggleStatus} sx={{ fontSize: '0.875rem', borderRadius: '6px' }}>
        <ListItemIcon sx={{ minWidth: 28, color: 'text.secondary' }}>
          {user.status === 'active' ? (
            <BlockOutlinedIcon fontSize="small" />
          ) : (
            <CheckCircleOutlineOutlinedIcon fontSize="small" />
          )}
        </ListItemIcon>
        <ListItemText
          primary={user.status === 'active' ? 'Disable User' : 'Activate User'}
          slotProps={{ primary: { sx: { fontSize: '0.875rem' } } }}
        />
      </MenuItem>

      <MenuItem
        onClick={handleDeleteClick}
        sx={{ fontSize: '0.875rem', borderRadius: '6px', color: colors.danger.default }}
      >
        <ListItemIcon sx={{ minWidth: 28, color: colors.danger.default }}>
          <DeleteOutlineOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText
          primary="Delete User"
          slotProps={{ primary: { sx: { fontSize: '0.875rem', color: colors.danger.default } } }}
        />
      </MenuItem>
    </Menu>
  );
}

export default UserRowActionsMenu;
