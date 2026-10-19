'use client';

import React from 'react';
import HeadsetMicOutlinedIcon from '@mui/icons-material/HeadsetMicOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import type { DropdownOption } from '@/components/shared/form-fields/Dropdown';
import { colors } from '@/lib/theme/mui/colors';

import { MobileBranchSelector } from './MobileBranchSelector';

/**
 * TabletNavbarProps
 */
export interface TabletNavbarProps {
  /** Anchor element for the branch selector menu */
  branchMenuAnchor: HTMLElement | null;
  /** Callback fired to open branch selector menu */
  onOpenBranchMenu: (el: HTMLElement) => void;
  /** Callback fired to close branch selector menu */
  onCloseBranchMenu: () => void;
  /** Organizational scope label */
  mobileScopeLabel: string;
  /** Active outlet or branch label */
  mobileOutletLabel: string;
  /** Branch options list */
  mobileBranchOptions: DropdownOption<string>[];
  /** Selected outlet id */
  mobileSelectedOutletSlug: string;
  /** Callback fired when an outlet option is chosen */
  onMobileOutletChange: (id: string, option?: DropdownOption<string>) => void;
  /** Whether management action buttons should be visible */
  showManagementActions: boolean;
  /** Callback fired on AI Agent button click */
  onAiAgentClick?: () => void;
  /** Callback fired on notification button click */
  onNotificationClick?: () => void;
  /** Callback fired on settings button click */
  onSettingsClick?: () => void;
  /** Callback fired on mobile/tablet menu button click */
  onOpenMenu?: () => void;
  /** Optional layout style overrides from the caller */
  sx?: SxProps<Theme>;
}

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

        <ActionButton
          variant="icon"
          size="medium"
          ariaLabel="View notifications"
          onClick={onNotificationClick}
          sx={{
            p: 0.75,
            color: colors.text.secondary,
            borderRadius: '8px',
            '&:hover': { color: 'text.primary', bgcolor: 'action.hover' },
          }}
        >
          <NotificationsNoneOutlinedIcon sx={{ fontSize: 20 }} />
        </ActionButton>

        <ActionButton
          variant="icon"
          size="medium"
          ariaLabel="Open settings"
          onClick={onSettingsClick}
          sx={{
            p: 0.75,
            color: colors.text.secondary,
            borderRadius: '8px',
            '&:hover': { color: 'text.primary', bgcolor: 'action.hover' },
          }}
        >
          <SettingsOutlinedIcon sx={{ fontSize: 20 }} />
        </ActionButton>

        <ActionButton
          variant="icon"
          size="medium"
          ariaLabel="Open navigation"
          onClick={onOpenMenu}
          sx={{
            p: 0.75,
            borderRadius: '8px',
            border: '1px solid',
            borderColor: (theme) => theme.palette.divider,
            color: 'text.primary',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#F3F4F6',
            '&:hover': {
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#E5E7EB',
            },
          }}
        >
          <MenuOutlinedIcon sx={{ fontSize: 20 }} />
        </ActionButton>
      </Box>
    </Box>
  );
}
