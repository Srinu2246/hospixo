'use client';

import React from 'react';
import HeadsetMicOutlinedIcon from '@mui/icons-material/HeadsetMicOutlined';
import Box from '@mui/material/Box';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';

import { MobileBranchSelector } from './MobileBranchSelector';
import { NavMenuButton, NavNotificationButton, NavSettingsButton } from './NavActionButtons';
import type { TabletNavbarProps } from './topNavbar.types';

export type { TabletNavbarProps };

/**
 * TabletNavbar
 *
 * Dedicated tablet navigation bar rendered on medium-small screens (`xs: 'none', sm: 'flex', md: 'none'`).
 * Sections:
 * - Left: Branch and outlet selector
 * - Right: AI Agent button, notifications, settings, and drawer menu trigger
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
  showManagementActions,
  onAiAgentClick,
  onNotificationClick,
  onSettingsClick,
  onOpenMenu,
  sx,
}: Readonly<TabletNavbarProps>) {
  return (
    <Box
      sx={[
        {
          display: { xs: 'none', sm: 'flex', md: 'none' },
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {/* Tablet Left: Branches / Outlet selector */}
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

      {/* Tablet Right: AI Agent, Notifications, Settings, Hamburger button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexShrink: 0 }}>
        {showManagementActions && (
          <ActionButton
            variant="outlined"
            size="medium"
            startIcon={<HeadsetMicOutlinedIcon sx={{ fontSize: 18 }} />}
            onClick={onAiAgentClick}
            sx={{
              borderRadius: '8px',
              borderColor: (theme) => theme.palette.divider,
              color: (theme) => theme.palette.text.primary,
              fontWeight: 600,
              fontSize: '0.8125rem',
              px: 1.5,
              '&:hover': {
                borderColor: (theme) => theme.palette.text.secondary,
                backgroundColor: 'action.hover',
              },
            }}
          >
            AI Agent
          </ActionButton>
        )}

        <NavNotificationButton onClick={onNotificationClick} />
        <NavSettingsButton onClick={onSettingsClick} />
        <NavMenuButton onClick={onOpenMenu} />
      </Box>
    </Box>
  );
}
