'use client';

import React from 'react';
import Image from 'next/image';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import logoLight from '@/assets/app/logo-light.svg';

import { ProfileMenu } from './ProfileMenu';
import { MobileBranchSelector } from './MobileBranchSelector';
import { NavMenuButton, NavNotificationButton } from './NavActionButtons';
import type { MobileNavbarProps } from './topNavbar.types';

export type { MobileNavbarProps };

/**
 * MobileNavbar
 *
 * Dedicated mobile navigation bar rendered on extra-small screens (`xs: 'flex', sm: 'none'`).
 * Sections:
 * - Left: Hospixo compact logo + branch selector
 * - Right: Notifications button + hamburger menu trigger
 */
export function MobileNavbar({
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
  captainWorkspaceTitle,
  captainWorkspaceSubtitle,
  showBranchSelector = false,
  showProfileMenu = false,
  user,
  displayName = 'User',
  displayRole = 'User',
  isReadOnly = false,
  sx,
}: Readonly<MobileNavbarProps>) {
  const captainWorkspace = Boolean(captainWorkspaceTitle);
  const branchSelector = (
    <MobileBranchSelector
      anchorEl={branchMenuAnchor}
      onOpen={onOpenBranchMenu}
      onClose={onCloseBranchMenu}
      scopeLabel={mobileScopeLabel}
      outletLabel={mobileOutletLabel}
      options={mobileBranchOptions}
      selectedSlug={mobileSelectedOutletSlug}
      onSelect={onMobileOutletChange}
      fontSize="0.8125rem"
      maxLabelWidth={{ xs: 150, sm: 220 }}
      hideScopeLabel={showBranchSelector && captainWorkspace}
      isReadOnly={isReadOnly}
    />
  );
  return (
    <Box
      sx={[
        {
          display: { xs: 'flex', sm: 'none' },
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          position: 'relative',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {/* Mobile Left: Logo icon + Branches beside logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flexShrink: 1 }}>
        {captainWorkspace && showBranchSelector ? (
          <Box sx={{ display: 'flex', minWidth: 0 }}>{branchSelector}</Box>
        ) : captainWorkspace ? (
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: '1.05rem',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
              }}
            >
              {captainWorkspaceTitle}
            </Typography>
            {captainWorkspaceSubtitle ? (
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: { xs: 200, sm: 280 },
                }}
              >
                {captainWorkspaceSubtitle}
              </Typography>
            ) : null}
          </Box>
        ) : (
          <>
            <Box
              sx={{
                width: 38,
                height: 40,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                flexShrink: 0,
              }}
            >
              <Image
                src={logoLight}
                alt="Hospixo"
                width={180}
                height={40}
                priority
                style={{
                  minWidth: 180,
                  height: 40,
                  display: 'block',
                }}
              />
            </Box>

            {!hideOutletSelector ? branchSelector : null}
          </>
        )}
      </Box>

      {/* Mobile Right: Notifications + profile (waiter) or sidebar menu */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
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
