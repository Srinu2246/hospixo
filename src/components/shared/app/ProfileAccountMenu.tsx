'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { CircleHelp, FileText, LogOut, PenLine, Shield, UserRound } from 'lucide-react';

import type { SidebarUserProfile } from '@/app/sidebar';
import { LogoutModal } from '@/components/shared/app/Logout';
import { buildStaffProfileHref } from '@/lib/helpers/employees/userRolesHelpers';
import { colors } from '@/lib/theme/mui/colors';
import { useSidebarStore } from '@/stores/sidebarStore';

export type ProfileMenuAction = 'profile' | 'help' | 'privacy' | 'terms' | 'blogs' | 'logout';

const PROFILE_MENU_ITEMS: ReadonlyArray<{
  id: Exclude<ProfileMenuAction, 'logout'>;
  label: string;
  icon: ReactNode;
}> = [
  { id: 'profile', label: 'My Profile', icon: <UserRound size={18} strokeWidth={1.75} /> },
  { id: 'help', label: 'Help & Support', icon: <CircleHelp size={18} strokeWidth={1.75} /> },
  { id: 'privacy', label: 'Privacy & Policy', icon: <Shield size={18} strokeWidth={1.75} /> },
  { id: 'terms', label: 'Terms & Conditions', icon: <FileText size={18} strokeWidth={1.75} /> },
  { id: 'blogs', label: 'Blogs', icon: <PenLine size={18} strokeWidth={1.75} /> },
];

function profileInitials(name?: string): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export type ProfileAccountMenuPlacement = 'navbar' | 'bottomNav';

export interface ProfileAccountMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  user?: SidebarUserProfile;
  displayName: string;
  displayRole: string;
  /** Menu position relative to the trigger (desktop navbar vs mobile footer). */
  placement?: ProfileAccountMenuPlacement;
}

/** Shared account menu: My Profile, support links, Logout (desktop navbar + mobile footer). */
export function ProfileAccountMenu({
  anchorEl,
  open,
  onClose,
  user,
  displayName,
  displayRole,
  placement = 'navbar',
}: Readonly<ProfileAccountMenuProps>) {
  const router = useRouter();
  const role = useSidebarStore((state) => state.role);
  const context = useSidebarStore((state) => state.context);
  const accountUserId = useSidebarStore((state) => state.account?.id);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const isBottomNav = placement === 'bottomNav';

  function handleAction(action: ProfileMenuAction) {
    onClose();
    if (action === 'profile') {
      if (accountUserId != null && role) {
        router.push(buildStaffProfileHref(accountUserId, { role, context }));
      }
      return;
    }
    if (action === 'logout') {
      setLogoutOpen(true);
    }
  }

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        anchorOrigin={
          isBottomNav
            ? { vertical: 'top', horizontal: 'center' }
            : { vertical: 'bottom', horizontal: 'right' }
        }
        transformOrigin={
          isBottomNav
            ? { vertical: 'bottom', horizontal: 'center' }
            : { vertical: 'top', horizontal: 'right' }
        }
        slotProps={{
          list: { dense: true, sx: { py: 0.5 } },
          paper: {
            sx: {
              width: 240,
              mt: isBottomNav ? 0 : 1,
              mb: isBottomNav ? 1 : 0,
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
            {profileInitials(displayName)}
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
            onClick={() => handleAction(item.id)}
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
          onClick={() => handleAction('logout')}
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
