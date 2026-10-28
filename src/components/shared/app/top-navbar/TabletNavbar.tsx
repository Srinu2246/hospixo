'use client';

import React from 'react';
import Box from '@mui/material/Box';

import { ProfileMenu } from './ProfileMenu';
import { MobileBranchSelector } from './MobileBranchSelector';
import { NavMenuButton, NavNotificationButton } from './NavActionButtons';
import type { TabletNavbarProps } from './topNavbar.types';

export type { TabletNavbarProps };

/**
 * TabletNavbar
 *
 * Dedicated tablet navigation bar rendered on medium-small screens (`xs: 'none', sm: 'flex', md: 'none'`).
 * Sections:
 * - Left: Branch and outlet selector
 * - Right: Notifications and drawer menu trigger (or profile menu)
 */
export function TabletNavbar({
  branchMenuAnchor,
  onOpenBranchMenu,
  onCloseBranchMenu,
  mobileScopeLabel,
  mobileOutletLabel,
  mobileBranchOptions,
  mobileSelectedOutletSlug,
  onMobileOutletChange,
  hideOutletSelector = false,
  onNotificationClick,
  onOpenMenu,
  showProfileMenu = false,
  user,
  displayName = 'User',
  displayRole = 'User',
  sx,
}: Readonly<TabletNavbarProps>) {
  return (
    <Box
      sx={[
        {
          display: { xs: 'none', sm: 'flex', md: 'none' },
          alignItems: 'center',
          justifyContent: hideOutletSelector ? 'flex-end' : 'space-between',
          width: '100%',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {/* Tablet Left: Branches / Outlet selector */}
      {!hideOutletSelector ? (
        <MobileBranchSelector
          anchorEl={branchMenuAnchor}
          onOpen={onOpenBranchMenu}
          onClose={onCloseBranchMenu}
          scopeLabel={mobileScopeLabel}
          outletLabel={mobileOutletLabel}
          options={mobileBranchOptions}
          selectedSlug={mobileSelectedOutletSlug}
          onSelect={onMobileOutletChange}
          fontSize="0.875rem"
          maxLabelWidth={280}
        />
      ) : null}

      {/* Tablet Right: Notifications, Hamburger button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexShrink: 0, ml: 'auto' }}>
        <NavNotificationButton onClick={onNotificationClick} />
        {showProfileMenu ? (
          <ProfileMenu
            user={user}
            displayName={displayName}
            displayRole={displayRole}
            isBranchView
            sx={{
              p: 0.75,
              borderRadius: '8px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#F3F4F6',
              '&:hover': {
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#E5E7EB',
              },
            }}
          />
        ) : (
          <NavMenuButton onClick={onOpenMenu} />
        )}
      </Box>
    </Box>
  );
}
