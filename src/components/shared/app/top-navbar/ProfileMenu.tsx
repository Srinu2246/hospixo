'use client';

import React, { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import type { SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { CircleHelp, FileText, LogOut, PenLine, Shield, UserRound } from 'lucide-react';

import type { SidebarUserProfile } from '@/app/sidebar';
import { LogoutModal } from '@/components/shared/app/Logout';
import { colors } from '@/lib/theme/mui/colors';

/**
 * Action keys for the user profile dropdown menu.
 */
export type ProfileMenuAction = 'profile' | 'help' | 'privacy' | 'terms' | 'blogs' | 'logout';

const PROFILE_MENU_ITEMS: ReadonlyArray<{
  id: Exclude<ProfileMenuAction, 'logout'>;
  label: string;
  icon: React.ReactNode;
}> = [
  { id: 'profile', label: 'My Profile', icon: <UserRound size={18} strokeWidth={1.75} /> },
  { id: 'help', label: 'Help & Support', icon: <CircleHelp size={18} strokeWidth={1.75} /> },
  { id: 'privacy', label: 'Privacy & Policy', icon: <Shield size={18} strokeWidth={1.75} /> },
  { id: 'terms', label: 'Terms & Conditions', icon: <FileText size={18} strokeWidth={1.75} /> },
  { id: 'blogs', label: 'Blogs', icon: <PenLine size={18} strokeWidth={1.75} /> },
];

/**
 * Extracts uppercase initials from a user's display name.
 */
function initials(name?: string): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * ProfileMenuProps
 */
export interface ProfileMenuProps {
  /** User profile data including optional avatar url */
  user?: SidebarUserProfile;
  /** Formatted user display name */
  displayName: string;
  /** Formatted user display role */
  displayRole: string;
  /** Whether currently in branch view */
  isBranchView: boolean;
  /** Optional layout style overrides from the caller */
  sx?: SxProps<Theme>;
}

/**
 * ProfileMenu
 *
 * User profile avatar trigger button with expandable dropdown menu and logout confirmation modal.
 */
export function ProfileMenu({
  user,
  displayName,
  displayRole,
  isBranchView,
  sx,
}: Readonly<ProfileMenuProps>) {
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const closeProfileMenu = () => setProfileAnchor(null);

  const handleProfileMenuAction = (action: ProfileMenuAction) => {
    closeProfileMenu();
    if (action === 'logout') {
      setLogoutOpen(true);
    }
  };

  return (
    <>
      <Box
        component="button"
        type="button"
        aria-label="Open profile menu"
        aria-haspopup="menu"
        aria-expanded={profileAnchor ? true : undefined}
        onClick={(event) => setProfileAnchor(event.currentTarget)}
        sx={[
          {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: isBranchView ? 0 : '2px',
            borderRadius: '50%',
            border: isBranchView ? 'none' : `2px solid ${colors.primary.default}`,
            bgcolor: 'transparent',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: `0 0 10px ${colors.sidebar.activeGlow}`,
            },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <Avatar
          src={user?.avatar}
          alt={user?.name || 'User'}
          sx={{
            width: 32,
            height: 32,
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor: isBranchView ? colors.text.primary : colors.surface.muted,
            color: isBranchView ? colors.white.default : colors.primary.default,
          }}
        >
          {initials(user?.name)}
        </Avatar>
      </Box>

      <Menu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={closeProfileMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          list: { dense: true, sx: { py: 0.5 } },
          paper: {
            sx: {
              width: 240,
              mt: 1,
              borderRadius: '12px',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
              overflow: 'hidden',
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 1.75, py: 1.5 }}>
          <Avatar
            src={user?.avatar}
            alt={displayName}
            sx={{
              width: 40,
              height: 40,
              fontSize: '0.9375rem',
              fontWeight: 700,
              bgcolor: colors.text.primary,
              color: colors.white.default,
            }}
          >
            {initials(displayName)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: 'text.primary',
                lineHeight: 1.25,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {displayName}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.8125rem',
                fontWeight: 400,
                color: 'text.secondary',
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {displayRole}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'divider' }} />

        {PROFILE_MENU_ITEMS.map((item) => (
          <MenuItem
            key={item.id}
            onClick={() => handleProfileMenuAction(item.id)}
            sx={{
              mx: 0.5,
              my: 0.25,
              px: 1.25,
              py: 1,
              borderRadius: '8px',
              gap: 0.5,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: 'text.primary' }}>{item.icon}</ListItemIcon>
            <ListItemText>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}>
                {item.label}
              </Typography>
            </ListItemText>
          </MenuItem>
        ))}

        <Divider sx={{ borderColor: 'divider', my: 0.5 }} />

        <MenuItem
          onClick={() => handleProfileMenuAction('logout')}
          sx={{
            mx: 0.5,
            mb: 0.5,
            px: 1.25,
            py: 1,
            borderRadius: '8px',
            gap: 0.5,
            color: colors.danger.default,
            '&:hover': {
              bgcolor: 'action.hover',
              color: colors.danger.default,
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
            <LogOut size={18} strokeWidth={1.75} />
          </ListItemIcon>
          <ListItemText>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'inherit' }}>
              Logout
            </Typography>
          </ListItemText>
        </MenuItem>
      </Menu>

      <LogoutModal open={logoutOpen} onClose={() => setLogoutOpen(false)} />
    </>
  );
}
