'use client';

import React from 'react';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { SxProps, Theme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import type { SidebarUserProfile } from '@/app/sidebar';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Dropdown, type DropdownOption } from '@/components/shared/form-fields/Dropdown';
import { colors } from '@/lib/theme/mui/colors';

import { ProfileMenu } from './ProfileMenu';
import type { TopNavbarLevel } from './topNavbar.types';

/**
 * DesktopNavbarProps
 */
export interface DesktopNavbarProps {
  /** Active navbar organizational level */
  level?: TopNavbarLevel;
  /** Dropdown options list for outlets */
  outletOptions: DropdownOption<string>[];
  hideOutletSelector?: boolean;
  /** Currently selected outlet identifier */
  selectedOutletSlug: string;
  /** Callback fired when an outlet is changed */
  onOutletChange: (branchId: string, option?: DropdownOption<string>) => void;
  /** Branch name to display when at branch level */
  branchDisplayName?: string;
  /** Placeholder text for dropdown when no value is selected */
  placeholder?: string;
  /** Whether the current route is within a branch manager view */
  isBranchView: boolean;
  /** Active color theme mode ('light' | 'dark') */
  mode: 'light' | 'dark';
  /** Callback fired to toggle color mode */
  onToggleMode: () => void;
  /** Callback fired on notification button click */
  onNotificationClick?: () => void;
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
 * - Right: Action controls (Theme switch, Notifications, Profile menu)
 */
export function DesktopNavbar({
  level = 'branch',
  outletOptions,
  hideOutletSelector = false,
  selectedOutletSlug,
  onOutletChange,
  branchDisplayName,
  placeholder,
  isBranchView,
  mode,
  onToggleMode,
  onNotificationClick,
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
          justifyContent: hideOutletSelector ? 'flex-end' : 'space-between',
          width: '100%',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {/* DESKTOP Left Section - Outlets Dropdown or Branch Display */}
      {!hideOutletSelector ? (
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, gap: 1 }}>
          {level === 'branch' ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left',
                lineHeight: 1.15,
                py: 0.25,
                px: 0.75,
                borderRadius: '8px',
              }}
            >
              <Typography
                variant="caption"
                component="span"
                sx={{
                  fontSize: '1rem',
                  color: 'text..secondary',
                  fontWeight: 400,
                  mb: 0.25,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                }}
              >
                Outlets
              </Typography>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  maxWidth: '100%',
                }}
              >
                <PlaceOutlinedIcon
                  sx={{
                    fontSize: 16,
                    color: (theme) => theme.palette.text.primary,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  component="span"
                  sx={{
                    color: 'text.primary',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    lineHeight: 1.25,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: { xs: 140, sm: 200, md: 240 },
                  }}
                >
                  {branchDisplayName || 'Branch'}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Dropdown
              variant="outlet"
              label="Outlets"
              placeholder={placeholder}
              startIcon={
                <PlaceOutlinedIcon
                  sx={{
                    fontSize: 16,
                    color: (theme) => theme.palette.text.primary,
                    flexShrink: 0,
                  }}
                />
              }
              options={outletOptions}
              value={selectedOutletSlug}
              onChange={onOutletChange}
            />
          )}
        </Box>
      ) : null}

      {/* DESKTOP Right Section */}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', ml: 'auto' }}>
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
