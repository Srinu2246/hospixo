'use client';

import React from 'react';
import Image from 'next/image';
import Box from '@mui/material/Box';

import logoLight from '@/assets/app/logo-light.svg';

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
  onNotificationClick,
  onOpenMenu,
  sx,
}: Readonly<MobileNavbarProps>) {
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
        />
      </Box>

      {/* Mobile Right: Notifications bell & Hamburger menu button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <NavNotificationButton onClick={onNotificationClick} />
        <NavMenuButton onClick={onOpenMenu} />
      </Box>
    </Box>
  );
}
