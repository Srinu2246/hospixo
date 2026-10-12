'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';

import { useThemeStore } from '@/stores/themeStore';
import { colors } from '@/lib/theme/mui/colors';
import {
  MOCK_SHIFT_METRICS,
  MOCK_ACTIVE_SHIFT,
  type ShiftMetricItem,
  type ActiveShiftDetails,
} from '@/lib/mocks/pos/usePosCashShift.mocks';

// ---------------------------------------------------------------------------
// Component Props
// ---------------------------------------------------------------------------

export interface MetricCardProps {
  label: string;
  value: string | number;
  hasLiveIndicator?: boolean;
  sx?: SxProps<Theme>;
}

export interface MetricCardsGridProps {
  items?: readonly ShiftMetricItem[];
  sx?: SxProps<Theme>;
}

export interface ActiveShiftBannerProps {
  shiftNumber?: string;
  openedBy?: string;
  startTime?: string;
  openingBalance?: string;
  sx?: SxProps<Theme>;
}

// ---------------------------------------------------------------------------
// 1. MetricCard Component
// ---------------------------------------------------------------------------

/**
 * MetricCard Component
 *
 * Renders an individual KPI metric card with uppercase label, bold value,
 * and optional live activity indicator dot using centralized theme tokens.
 */
export function MetricCard({
  label,
  value,
  hasLiveIndicator = false,
  sx,
}: Readonly<MetricCardProps>) {
  const mode = useThemeStore((state) => state.mode);

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        bgcolor: mode === 'dark' ? colors.surface.dark : colors.surface.default,
        border: `1px solid ${mode === 'dark' ? colors.border.dark : colors.border.default}`,
        borderRadius: '12px',
        p: { xs: 2, sm: 2.5 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 1.25,
        boxShadow: 'none',
        ...sx,
      }}
    >
      {/* Header Row: Label + Optional Live Dot */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Typography
          variant="caption"
          component="span"
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: mode === 'dark' ? colors.text.darkSecondary : colors.text.secondary,
            lineHeight: 1.2,
          }}
        >
          {label}
        </Typography>

        {hasLiveIndicator && (
          <Box
            component="span"
            aria-label="Active status indicator"
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: colors.success.default,
              boxShadow: `0 0 0 2px ${alpha(colors.success.default, 0.2)}`,
              flexShrink: 0,
            }}
          />
        )}
      </Box>

      {/* Main Quantitative Metric Value */}
      <Typography
        variant="h5"
        component="div"
        sx={{
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
          fontWeight: 800,
          color: mode === 'dark' ? colors.text.darkPrimary : colors.text.primary,
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
          wordBreak: 'break-word',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// 2. MetricCardsGrid Component (4-Column Row)
// ---------------------------------------------------------------------------

/**
 * MetricCardsGrid Component
 *
 * 4-column responsive grid displaying cash and shift metrics.
 */
export function MetricCardsGrid({
  items = MOCK_SHIFT_METRICS,
  sx,
}: Readonly<MetricCardsGridProps>) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)',
        },
        gap: { xs: 1.5, sm: 2 },
        width: '100%',
        flexShrink: 0,
        ...sx,
      }}
    >
      {items.map((item) => (
        <MetricCard
          key={item.id}
          label={item.label}
          value={item.value}
          hasLiveIndicator={item.hasLiveIndicator}
        />
      ))}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// 3. ActiveShiftBanner Component
// ---------------------------------------------------------------------------

/**
 * ActiveShiftBanner Component
 *
 * Tinted accent banner positioned directly below the metric cards.
 * Displays shift number, operator, start time, and opening balance.
 */
export function ActiveShiftBanner({
  shiftNumber = MOCK_ACTIVE_SHIFT.shiftNumber,
  openedBy = MOCK_ACTIVE_SHIFT.openedBy,
  startTime = MOCK_ACTIVE_SHIFT.startTime,
  openingBalance = MOCK_ACTIVE_SHIFT.openingBalance,
  sx,
}: Readonly<ActiveShiftBannerProps>) {
  const mode = useThemeStore((state) => state.mode);

  const bannerBg = alpha(colors.primary.default, mode === 'dark' ? 0.12 : 0.05);
  const bannerBorder = alpha(colors.primary.default, mode === 'dark' ? 0.25 : 0.18);
  const textMuted = mode === 'dark' ? colors.text.darkSecondary : colors.text.secondary;
  const textPrimary = mode === 'dark' ? colors.text.darkPrimary : colors.text.primary;

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: bannerBg,
        border: `1px solid ${bannerBorder}`,
        borderRadius: '12px',
        px: { xs: 2, sm: 3 },
        py: { xs: 1.5, sm: 2 },
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 2.5, sm: 5, md: 7 },
        flexWrap: 'wrap',
        flexShrink: 0,
        boxSizing: 'border-box',
        ...sx,
      }}
    >
      {/* 1. Active Shift */}
      <Box sx={{ minWidth: { xs: '120px', sm: 'auto' } }}>
        <Typography
          variant="caption"
          component="div"
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: colors.primary.default,
            mb: 0.5,
          }}
        >
          ACTIVE SHIFT
        </Typography>
        <Typography
          variant="body1"
          component="div"
          sx={{
            fontSize: { xs: '0.9375rem', sm: '1.0625rem' },
            fontWeight: 800,
            color: textPrimary,
            letterSpacing: '-0.01em',
          }}
        >
          {shiftNumber}
        </Typography>
      </Box>

      {/* 2. Opened By */}
      <Box sx={{ minWidth: { xs: '120px', sm: 'auto' } }}>
        <Typography
          variant="caption"
          component="div"
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: textMuted,
            mb: 0.5,
          }}
        >
          OPENED BY
        </Typography>
        <Typography
          variant="body2"
          component="div"
          sx={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: textPrimary,
          }}
        >
          {openedBy}
        </Typography>
      </Box>

      {/* 3. Start Time */}
      <Box sx={{ minWidth: { xs: '100px', sm: 'auto' } }}>
        <Typography
          variant="caption"
          component="div"
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: textMuted,
            mb: 0.5,
          }}
        >
          START TIME
        </Typography>
        <Typography
          variant="body2"
          component="div"
          sx={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: textPrimary,
          }}
        >
          {startTime}
        </Typography>
      </Box>

      {/* 4. Opening Balance */}
      <Box sx={{ minWidth: { xs: '120px', sm: 'auto' } }}>
        <Typography
          variant="caption"
          component="div"
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: textMuted,
            mb: 0.5,
          }}
        >
          OPENING BALANCE
        </Typography>
        <Typography
          variant="body2"
          component="div"
          sx={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: textPrimary,
          }}
        >
          {openingBalance}
        </Typography>
      </Box>
    </Box>
  );
}

export default MetricCardsGrid;
