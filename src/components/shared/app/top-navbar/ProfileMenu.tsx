'use client';

import React, { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';

import type { SidebarUserProfile } from '@/app/sidebar';
import { ProfileAccountMenu } from '@/components/shared/app/ProfileAccountMenu';
import { colors } from '@/lib/theme/mui/colors';

function initials(name?: string): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export interface ProfileMenuProps {
  user?: SidebarUserProfile;
  displayName: string;
  displayRole: string;
  isBranchView: boolean;
  sx?: SxProps<Theme>;
}

/** Desktop navbar avatar trigger + shared account menu. */
export function ProfileMenu({
  user,
  displayName,
  displayRole,
  isBranchView,
  sx,
}: Readonly<ProfileMenuProps>) {
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);

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

      <ProfileAccountMenu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={() => setProfileAnchor(null)}
        user={user}
        displayName={displayName}
        displayRole={displayRole}
        placement="navbar"
      />
    </>
  );
}
