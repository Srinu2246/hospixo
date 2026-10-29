'use client';

import React from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import type { SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Check } from 'lucide-react';

import type { DropdownOption } from '@/components/shared/form-fields/Dropdown';
import { colors } from '@/lib/theme/mui/colors';

/**
 * MobileBranchSelectorProps
 */
export interface MobileBranchSelectorProps {
  /** Anchor element for the branch selection dropdown menu */
  anchorEl: HTMLElement | null;
  /** Callback fired when the selector trigger is clicked */
  onOpen: (el: HTMLElement) => void;
  /** Callback fired to close the branch selection menu */
  onClose: () => void;
  /** Uppercase scope title (e.g. BRANCHES, COMPANIES, ORGANIZATIONS) */
  scopeLabel: string;
  /** Formatted active outlet or branch label */
  outletLabel: string;
  /** Available branch/outlet options for the user */
  options: DropdownOption<string>[];
  /** Currently selected outlet identifier */
  selectedSlug: string;
  /** Callback fired when an outlet option is chosen */
  onSelect: (id: string, option?: DropdownOption<string>) => void;
  /** Optional typography size override for the outlet label */
  fontSize?: string | Record<string, string>;
  /** Maximum pixel width constraint for long outlet names */
  maxLabelWidth?: number | Record<string, number>;
  /** Optional layout style overrides from the caller */
  sx?: SxProps<Theme>;
  /** Hide the uppercase scope row (e.g. on captain workspace). */
  hideScopeLabel?: boolean;
  /** Whether the selector is read-only (non-interactive, no dropdown arrow) */
  isReadOnly?: boolean;
}

/**
 * MobileBranchSelector
 *
 * Compact branch and outlet selector button with popup menu for mobile and tablet viewports.
 */
export function MobileBranchSelector({
  anchorEl,
  onOpen,
  onClose,
  scopeLabel,
  outletLabel,
  options,
  selectedSlug,
  onSelect,
  fontSize = { xs: '0.8125rem', sm: '0.875rem' },
  maxLabelWidth = { xs: 150, sm: 220, md: 280 },
  hideScopeLabel = false,
  isReadOnly = false,
  sx,
}: Readonly<MobileBranchSelectorProps>) {
  return (
    <>
      <Box
        onClick={isReadOnly ? undefined : (e) => onOpen(e.currentTarget)}
        sx={[
          {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            cursor: isReadOnly ? 'default' : 'pointer',
            textAlign: 'left',
            userSelect: 'none',
            minWidth: 0,
            py: 0.5,
            px: 0.5,
            borderRadius: '8px',
            transition: 'background-color 0.15s ease',
            ...(isReadOnly
              ? {}
              : {
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }),
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {hideScopeLabel ? null : (
          <Typography
            sx={{
              fontSize: { xs: '0.9rem', sm: '1rem' },
              fontWeight: 600,
              color: 'text.secondary',
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
              mb: 0.2,
            }}
          >
            {scopeLabel}
          </Typography>
        )}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mt: hideScopeLabel ? 0 : 0.25,
            minWidth: 0,
          }}
        >
          <PlaceOutlinedIcon sx={{ fontSize: 16, color: 'text.primary', flexShrink: 0 }} />
          <Typography
            sx={{
              fontSize,
              fontWeight:
                outletLabel === 'Select Company' || outletLabel === 'Select Branch' ? 500 : 700,
              color:
                outletLabel === 'Select Company' || outletLabel === 'Select Branch'
                  ? 'text.secondary'
                  : 'text.primary',
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: maxLabelWidth,
            }}
          >
            {outletLabel}
          </Typography>
          {!isReadOnly ? (
            <KeyboardArrowDownIcon
              sx={{
                fontSize: 16,
                color: colors.text.secondary,
                flexShrink: 0,
                transform: anchorEl ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s ease',
              }}
            />
          ) : null}
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 190,
              maxWidth: 260,
              borderRadius: '12px',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 10px 25px -5px rgba(0, 0, 0, 0.6)'
                  : '0 10px 25px -5px rgba(0, 0, 0, 0.12)',
              border: '1px solid',
              borderColor: 'divider',
            },
          },
        }}
      >
        {options.map((option) => {
          const isSelected = option.id === selectedSlug;
          return (
            <MenuItem
              key={option.id}
              selected={isSelected}
              onClick={() => {
                onSelect(option.id, option);
                onClose();
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                fontSize: '0.84375rem',
                fontWeight: isSelected ? 600 : 400,
                py: 1,
                px: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: 'inherit',
                  fontWeight: 'inherit',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {option.label}
              </Typography>
              {isSelected && (
                <Check size={16} color={colors.primary.default} style={{ flexShrink: 0 }} />
              )}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
