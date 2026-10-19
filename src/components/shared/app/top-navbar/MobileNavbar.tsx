'use client';

import React from 'react';
import Image from 'next/image';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';

import logoLight from '@/assets/app/logo-light.svg';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import type { DropdownOption } from '@/components/shared/form-fields/Dropdown';
import { colors } from '@/lib/theme/mui/colors';

import { MobileBranchSelector } from './MobileBranchSelector';

/**
 * MobileNavbarProps
 */
export interface MobileNavbarProps {
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
  /** Callback fired on notification button click */
  onNotificationClick?: () => void;
  /** Callback fired on mobile hamburger menu click */
  onOpenMenu?: () => void;
  /** Optional layout style overrides from the caller */
  sx?: SxProps<Theme>;
}

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
