'use client';

import React from 'react';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import HeadsetMicOutlinedIcon from '@mui/icons-material/HeadsetMicOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { SxProps, Theme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';

import type { SidebarUserProfile } from '@/app/sidebar';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Dropdown, type DropdownOption } from '@/components/shared/form-fields/Dropdown';
import { colors } from '@/lib/theme/mui/colors';

import { ProfileMenu } from './ProfileMenu';

/**
 * DesktopNavbarProps
 */
export interface DesktopNavbarProps {
  /** Dropdown options list for outlets */
  outletOptions: DropdownOption<string>[];
  hideOutletSelector?: boolean;
  /** Currently selected outlet identifier */
  selectedOutletSlug: string;
  /** Callback fired when an outlet is changed */
  onOutletChange: (branchId: string, option?: DropdownOption<string>) => void;
  /** Whether management action buttons should be visible */
  showManagementActions: boolean;
  /** Whether the current route is within a branch manager view */
  isBranchView: boolean;
  /** Active color theme mode ('light' | 'dark') */
  mode: 'light' | 'dark';
  /** Callback fired to toggle color mode */
  onToggleMode: () => void;
  /** Callback fired on AI Agent button click */
  onAiAgentClick?: () => void;
  /** Callback fired on Explore Products button click */
  onExploreProductsClick?: () => void;
  /** Callback fired on notification button click */
  onNotificationClick?: () => void;
  /** Callback fired on settings button click */
  onSettingsClick?: () => void;
  /** Active user profile data */
  user?: SidebarUserProfile;
  /** Formatted user display name */
  displayName: string;
  /** Formatted user display role */
  displayRole: string;
  /** Optional layout style overrides from the caller */
  sx?: SxProps<Theme>;
}

/**
 * DesktopNavbar
 *
 * Dedicated desktop navigation bar rendered on medium-and-larger screens (`xs: 'none', md: 'flex'`).
 * Sections:
 * - Left: Outlets dropdown selector
 * - Right: Action controls (AI Agent, Explore Products, Theme switch, Notifications, Settings, Profile menu)
 */
export function DesktopNavbar({
  outletOptions,
  hideOutletSelector = false,
  selectedOutletSlug,
  onOutletChange,
  showManagementActions,
  isBranchView,
  mode,
  onToggleMode,
  onAiAgentClick,
  onExploreProductsClick,
  onNotificationClick,
  onSettingsClick,
  user,
  displayName,
  displayRole,
  sx,
}: Readonly<DesktopNavbarProps>) {
  return (
    <Box
      sx={[
        {
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {/* DESKTOP Left Section - Outlets Dropdown */}
      {!hideOutletSelector ? (
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, gap: 1 }}>
          <Dropdown
            variant="outlet"
            label="Outlets"
            startIcon={
              <PlaceOutlinedIcon
                sx={{
                  fontSize: 18,
                  color: (theme) => theme.palette.text.primary,
                  flexShrink: 0,
                }}
              />
            }
            options={outletOptions}
            value={selectedOutletSlug}
            onChange={onOutletChange}
          />
        </Box>
      ) : null}

      {/* DESKTOP Right Section */}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        {/* AI Agent Button */}
        {showManagementActions && (
          <ActionButton
            variant="outlined"
            size="medium"
            startIcon={<HeadsetMicOutlinedIcon sx={{ fontSize: 18 }} />}
            onClick={onAiAgentClick}
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              borderRadius: '8px',
              borderColor: (theme) => theme.palette.divider,
              color: (theme) => theme.palette.text.primary,
              fontWeight: 600,
              fontSize: '0.84375rem',
              '&:hover': {
                borderColor: (theme) => theme.palette.text.secondary,
                backgroundColor: 'action.hover',
              },
            }}
          >
            AI Agent
          </ActionButton>
        )}

        {/* Explore Products Button (hidden on branch-manager routes as per Figma) */}
        {showManagementActions && !isBranchView && (
          <ActionButton
            variant="primary"
            size="medium"
            startIcon={<GridViewOutlinedIcon sx={{ fontSize: 18 }} />}
            onClick={onExploreProductsClick}
            sx={{
              borderRadius: '8px',
              backgroundColor: colors.primary.default,
              color: colors.white.default,
              fontWeight: 600,
              fontSize: '0.84375rem',
              boxShadow: `0 2px 8px ${colors.sidebar.activeGlow}`,
              '&:hover': {
                backgroundColor: colors.primary.dark,
              },
            }}
          >
            Explore Products
          </ActionButton>
        )}

        {/* Theme toggle — available for every role that uses the top navbar */}
        <Tooltip title={mode === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}>
          <span>
            <ActionButton
              variant="icon"
              size="medium"
              ariaLabel="Toggle theme mode"
              onClick={onToggleMode}
              sx={{
                borderRadius: '8px',
                borderColor: (theme) => theme.palette.divider,
                color: (theme) => theme.palette.text.secondary,
                '&:hover': {
                  color: (theme) => theme.palette.text.primary,
                  backgroundColor: 'action.hover',
                },
              }}
            >
              {mode === 'dark' ? (
                <LightModeOutlinedIcon sx={{ fontSize: 20, color: colors.warning.light }} />
              ) : (
                <DarkModeOutlinedIcon sx={{ fontSize: 20 }} />
              )}
            </ActionButton>
          </span>
        </Tooltip>

        {/* Notifications Button */}
        <Tooltip title="Notifications">
          <span>
            <ActionButton
              variant="icon"
              size="medium"
              ariaLabel="View notifications"
              onClick={onNotificationClick}
              sx={{
                borderRadius: '8px',
                borderColor: (theme) => theme.palette.divider,
                color: (theme) => theme.palette.text.secondary,
                '&:hover': {
                  color: (theme) => theme.palette.text.primary,
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <NotificationsNoneOutlinedIcon sx={{ fontSize: 20 }} />
            </ActionButton>
          </span>
        </Tooltip>

        {/* Settings Button */}
        <Tooltip title="Settings">
          <span>
            <ActionButton
              variant="icon"
              size="medium"
              ariaLabel="Open settings"
              onClick={onSettingsClick}
              sx={{
                borderRadius: '8px',
                borderColor: (theme) => theme.palette.divider,
                color: (theme) => theme.palette.text.secondary,
                '&:hover': {
                  color: (theme) => theme.palette.text.primary,
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <SettingsOutlinedIcon sx={{ fontSize: 20 }} />
            </ActionButton>
          </span>
        </Tooltip>

        {/* User Profile Avatar & Dropdown */}
        <ProfileMenu
          user={user}
          displayName={displayName}
          displayRole={displayRole}
          isBranchView={isBranchView}
        />
      </Stack>
    </Box>
  );
}
