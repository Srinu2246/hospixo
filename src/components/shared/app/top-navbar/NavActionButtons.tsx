'use client';

import React from 'react';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import type { SxProps, Theme } from '@mui/material/styles';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { colors } from '@/lib/theme/mui/colors';

/**
 * Reusable icon button for top navbar notifications.
 */
export function NavNotificationButton({
  onClick,
  sx,
}: Readonly<{
  onClick?: () => void;
  sx?: SxProps<Theme>;
}>) {
  return (
    <ActionButton
      variant="icon"
      size="medium"
      ariaLabel="View notifications"
      onClick={onClick}
      sx={{
        p: 0.75,
        color: colors.text.secondary,
        borderRadius: '8px',
        '&:hover': { color: 'text.primary', bgcolor: 'action.hover' },
        ...((sx as object) || {}),
      }}
    >
      <NotificationsNoneOutlinedIcon sx={{ fontSize: 20 }} />
    </ActionButton>
  );
}

/**
 * Reusable icon button for top navbar settings.
 * Hidden as this feature is not currently available; commented out until feature is ready.
 */
/*
export function NavSettingsButton({
  onClick,
  sx,
}: Readonly<{
  onClick?: () => void;
  sx?: SxProps<Theme>;
}>) {
  return (
    <ActionButton
      variant="icon"
      size="medium"
      ariaLabel="Open settings"
      onClick={onClick}
      sx={{
        p: 0.75,
        color: colors.text.secondary,
        borderRadius: '8px',
        '&:hover': { color: 'text.primary', bgcolor: 'action.hover' },
        ...((sx as object) || {}),
      }}
    >
      <SettingsOutlinedIcon sx={{ fontSize: 20 }} />
    </ActionButton>
  );
}
*/

/**
 * Reusable icon button for top navbar mobile/tablet hamburger menu.
 */
export function NavMenuButton({
  onClick,
  sx,
}: Readonly<{
  onClick?: () => void;
  sx?: SxProps<Theme>;
}>) {
  return (
    <ActionButton
      variant="icon"
      size="medium"
      ariaLabel="Open navigation"
      onClick={onClick}
      sx={{
        p: 0.75,
        borderRadius: '8px',
        border: '1px solid',
        borderColor: (theme) => theme.palette.divider,
        color: 'text.primary',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#F3F4F6'),
        '&:hover': {
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#E5E7EB'),
        },
        ...((sx as object) || {}),
      }}
    >
      <MenuOutlinedIcon sx={{ fontSize: 20 }} />
    </ActionButton>
  );
}
