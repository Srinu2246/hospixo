'use client';

import React, { type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import type { SxProps, Theme } from '@mui/material/styles';

import { colors } from '@/lib/theme/mui/colors';
import { screen } from '@/lib/theme/mui/breakpoints';
import { ActionButton, type ActionButtonProps } from '@/components/shared/form-fields/ActionButton';

export interface HeaderActionButtonProps {
  label: string;
  onClick?: () => void;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  variant?: ActionButtonProps['variant'];
  disabled?: boolean;
  loading?: boolean;
}

export interface HeaderProps {
  /** Page or section title */
  title: string;
  /** Optional descriptive subtitle */
  subtitle?: string;
  /** Shorter subtitle on mobile/tablet; desktop keeps `subtitle`. */
  compactSubtitle?: string;
  /** Optional badge/chip label next to title */
  badge?: string;
  /** Color theme for the badge chip */
  badgeColor?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  /** Optional breadcrumbs element to display at the top of the header */
  breadcrumbs?: ReactNode;
  /** Custom action slot (rendered on the right on desktop, below on mobile) */
  actionSlot?: ReactNode;
  /** Convenience action button definition */
  actionButton?: HeaderActionButtonProps;
  /** Optional decorative vertical pill bar accent on the left of the title (POS style) */
  showAccentPill?: boolean;
  /** Optional subordinate content such as filter bars, tabs, or metrics */
  children?: ReactNode;
  /** Stack title and actions vertically until desktop (mobile/tablet layouts). */
  stackActionsUntilDesktop?: boolean;
  /** Title left, action right on one row (grid) on all breakpoints. */
  actionEndGrid?: boolean;
  /** Layout override styles */
  sx?: SxProps<Theme>;
}

/**
 * Global Reusable Header Component
 *
 * Implements standard page and module header layouts consistently:
 * 1. Optional breadcrumb navigation line.
 * 2. Primary title with optional accent pill and status/badge chip.
 * 3. Subtitle description with secondary text token.
 * 4. Flexible action slot / action button for primary page actions.
 * 5. Optional child section for filter bars, tabs, or progress bars.
 */
export function Header({
  title,
  subtitle,
  compactSubtitle,
  badge,
  badgeColor = 'default',
  breadcrumbs,
  actionSlot,
  actionButton,
  showAccentPill = false,
  children,
  stackActionsUntilDesktop = false,
  actionEndGrid = false,
  sx,
}: Readonly<HeaderProps>) {
  const titleBlock = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        {showAccentPill ? (
          <Box
            sx={{
              width: 4,
              height: 24,
              borderRadius: '4px',
              bgcolor: colors.primary.default,
              flexShrink: 0,
            }}
          />
        ) : null}

        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.625rem' },
            fontWeight: 700,
            color: 'text.primary',
            letterSpacing: '-0.02em',
            lineHeight: 1.25,
          }}
        >
          {title}
        </Typography>

        {badge ? (
          <Chip
            label={badge}
            size="small"
            color={badgeColor === 'default' ? undefined : badgeColor}
            variant="outlined"
            sx={{
              fontWeight: 600,
              fontSize: '0.75rem',
              height: 24,
              borderRadius: '6px',
            }}
          />
        ) : null}
      </Box>

      {compactSubtitle || subtitle ? (
        <>
          {compactSubtitle ? (
            <Typography
              variant="body2"
              sx={{
                display: {
                  [screen.mobile]: 'block',
                  [screen.tablet]: 'block',
                  [screen.desktop]: 'none',
                },
                color: colors.text.secondary,
                fontSize: '0.875rem',
                lineHeight: 1.4,
              }}
            >
              {compactSubtitle}
            </Typography>
          ) : null}
          {subtitle ? (
            <Typography
              variant="body2"
              sx={{
                display: compactSubtitle
                  ? {
                      [screen.mobile]: 'none',
                      [screen.tablet]: 'none',
                      [screen.desktop]: 'block',
                    }
                  : 'block',
                color: colors.text.secondary,
                fontSize: '0.875rem',
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </Typography>
          ) : null}
        </>
      ) : null}
    </Box>
  );

  const actionsBlock =
    actionSlot || actionButton ? (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          alignSelf: actionEndGrid
            ? 'auto'
            : {
                xs: 'stretch',
                sm: 'auto',
              },
          justifySelf: actionEndGrid ? 'end' : undefined,
          flexShrink: 0,
        }}
      >
        {actionSlot}

        {actionButton ? (
          <ActionButton
            variant={actionButton.variant ?? 'primary'}
            onClick={actionButton.onClick}
            startIcon={actionButton.startIcon}
            endIcon={actionButton.endIcon}
            disabled={actionButton.disabled}
            loading={actionButton.loading}
            sx={{
              width: actionEndGrid ? 'auto' : { xs: '100%', sm: 'auto' },
            }}
          >
            {actionButton.label}
          </ActionButton>
        ) : null}
      </Box>
    ) : null;

  const rowSx: SxProps<Theme> = actionEndGrid
    ? {
        display: 'grid',
        width: '100%',
        gap: 1.5,
        alignItems: 'start',
        gridTemplateColumns: {
          [screen.mobile]: 'minmax(0, 1fr) auto',
          [screen.tablet]: 'minmax(0, 1fr) auto',
          [screen.desktop]: 'minmax(0, 1fr) auto',
        },
      }
    : {
        display: 'flex',
        flexDirection: stackActionsUntilDesktop
          ? {
              [screen.mobile]: 'column',
              [screen.tablet]: 'column',
              [screen.desktop]: 'row',
            }
          : { xs: 'column', sm: 'row' },
        alignItems: stackActionsUntilDesktop
          ? {
              [screen.mobile]: 'stretch',
              [screen.tablet]: 'stretch',
              [screen.desktop]: 'center',
            }
          : { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        width: '100%',
      };

  return (
    <Box
      sx={[
        {
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {breadcrumbs ? <Box sx={{ width: '100%' }}>{breadcrumbs}</Box> : null}

      <Box sx={rowSx}>
        {titleBlock}
        {actionsBlock}
      </Box>

      {children ? <Box sx={{ width: '100%' }}>{children}</Box> : null}
    </Box>
  );
}
