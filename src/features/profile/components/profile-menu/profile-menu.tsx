'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Avatar, Box, Divider, Menu, MenuItem, Typography } from '@mui/material';
import { HelpCircle, FileText, LogOut, PenLine, Shield, UserRound } from 'lucide-react';

import { routes } from '@/config/routes';
import { useAuth } from '@/context/auth';
import { LogoutDialog } from '@/features/profile/components/logout-dialog/logout-dialog';
import { profileMenuCopy } from '@/features/profile/config/profile';
import { buildUserProfile } from '@/features/profile/lib/build-user-profile';

type ProfileMenuProps = Readonly<{
  initials: string;
}>;

const menuLinks = [
  {
    href: routes.dashboard.profile,
    label: profileMenuCopy.myProfile,
    icon: UserRound,
  },
  {
    href: routes.marketing.helpCenter,
    label: profileMenuCopy.helpSupport,
    icon: HelpCircle,
  },
  {
    href: routes.marketing.privacy,
    label: profileMenuCopy.privacyPolicy,
    icon: Shield,
  },
  {
    href: routes.marketing.terms,
    label: profileMenuCopy.termsConditions,
    icon: FileText,
  },
  {
    href: routes.marketing.blogResources,
    label: profileMenuCopy.blogs,
    icon: PenLine,
  },
] as const;

export function ProfileMenu({ initials }: ProfileMenuProps) {
  const { user } = useAuth();
  const profile = buildUserProfile(user);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Box
        component="button"
        type="button"
        aria-label={profileMenuCopy.menuLabel}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 0,
          border: 'none',
          bgcolor: 'transparent',
          cursor: 'pointer',
          borderRadius: '50%',
          outline: 'none',
          '&:focus-visible': {
            boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}`,
          },
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            fontSize: '0.8125rem',
            fontWeight: 700,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          {initials}
        </Avatar>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            elevation: 4,
            sx: {
              mt: 1,
              minWidth: 230,
              borderRadius: '0.75rem',
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 10px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.5)'
                  : '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.06)',
              py: 0.5,
            },
          },
        }}
      >
        {/* Menu Header */}
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              fontSize: '0.875rem',
              fontWeight: 700,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            {initials}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'text.primary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {profile.name}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: 'text.secondary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {profile.roleLabel}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 0.5 }} />

        {/* Links */}
        {menuLinks.map((item) => {
          const Icon = item.icon;
          return (
            <MenuItem
              key={item.label}
              component={Link}
              href={item.href}
              onClick={handleClose}
              sx={{
                fontSize: '0.8125rem',
                fontWeight: 500,
                borderRadius: '0.375rem',
                mx: 0.75,
                my: 0.25,
                py: 0.75,
                px: 1.25,
                gap: 1.25,
                color: 'text.primary',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Icon size={16} style={{ opacity: 0.75 }} />
              <span>{item.label}</span>
            </MenuItem>
          );
        })}

        <Divider sx={{ my: 0.5 }} />

        {/* Logout */}
        <MenuItem
          onClick={() => {
            handleClose();
            setLogoutOpen(true);
          }}
          sx={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            borderRadius: '0.375rem',
            mx: 0.75,
            my: 0.25,
            py: 0.75,
            px: 1.25,
            gap: 1.25,
            color: 'error.main',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <LogOut size={16} />
          <span>{profileMenuCopy.logout}</span>
        </MenuItem>
      </Menu>

      <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
    </>
  );
}
