'use client';

import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Chip, { type ChipProps } from '@mui/material/Chip';
import type { SxProps, Theme } from '@mui/material/styles';

export type StatusChipVariant =
  'warning' | 'success' | 'info' | 'role' | 'default' | 'reserved' | 'kot' | 'danger';

export interface StatusChipStyle {
  color: string; // Text color
  bg: string; // Background color with alpha opacity
}

// Status Variations Palette
export const STATUS_CHIP_PALETTE: Record<StatusChipVariant, StatusChipStyle> = {
  warning: {
    color: '#F59E0B',
    bg: '#F59E0B1F',
  },
  success: {
    color: '#10B981',
    bg: '#10B9811F',
  },
  info: {
    color: '#1B59F8',
    bg: '#EFF4FE',
  },
  role: {
    color: '#1B59F8',
    bg: '#EFF4FE',
  },
  default: {
    color: '#64748B',
    bg: '#64748B1F',
  },
  reserved: {
    color: '#F5610B',
    bg: '#F5610B1A',
  },
  kot: {
    color: '#0891B2',
    bg: '#0891B21F',
  },
  danger: {
    color: '#EF4444',
    bg: '#EF44441F',
  },
};

// Normalize key or label for case-insensitive matching
function normalizeStatusKey(value?: string | null): string {
  if (!value) return '';
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .toLowerCase()
    .trim();
}

// Resolve status variant from normalized key or label
export function resolveStatusVariant(statusOrLabel?: string | null): StatusChipVariant {
  const normalized = normalizeStatusKey(statusOrLabel);

  switch (normalized) {
    case 'role':
    case 'inventory':
    case 'barista':
    case 'branch manager':
    case 'company manager':
    case 'restaurant manager':
    case 'pos counter':
    case 'captain':
    case 'kitchen staff':
    case 'cashier':
    case 'staff':
      return 'role';

    case 'reserved': // Reserved: text #F5610B, bg #F5610B1A
      return 'reserved';

    case 'invited':
    case 'pending':
    case 'pending invites':
    case 'preparing': // Warning: Preparing
    case 'billing': // Warning: Billing (orange pill)
    case 'waiting driver': // Warning: Waiting Driver
    case 'driver waiting':
    case 'draft': // Warning: Draft order
      return 'warning';

    case 'active':
    case 'available': // Green: Available
    case 'ready': // Success: Ready
    case 'ready to serve': // Success: Ready to Serve
    case 'served':
    case 'upi': // Success: UPI
    case 'confirmed':
      return 'success';

    case 'disabled':
    case 'inactive':
    case 'cancelled': // Danger: Cancelled
    case 'canceled':
      return 'danger';

    case 'kot': // KOT Sent
    case 'kot sent':
    case 'sent':
      return 'kot';

    case 'cash': // Default: Cash
    case 'cleaning': // Default: Cleaning
      return 'default';

    default:
      return 'default';
  }
}

// Get text and background style for a status key or label
export function getStatusChipStyle(
  statusOrLabel?: string | null,
  overrideVariant?: StatusChipVariant,
): StatusChipStyle {
  const variant = overrideVariant ?? resolveStatusVariant(statusOrLabel);
  return STATUS_CHIP_PALETTE[variant];
}

export interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status?: string; // Status key to determine color (e.g. preparing, readyToServe, upi, card, cash)
  label?: ReactNode; // Text or element rendered inside the chip
  variantType?: StatusChipVariant; // Explicit variant override: warning | success | info | role | default
  textColor?: string; // Custom text color override
  bgColor?: string; // Custom background color override
  dotColor?: string; // Custom dot color override (default: style.color)
  showDot?: boolean; // Display colored status dot before label (default: false)
  pill?: boolean; // When true, renders with fully rounded pill shape (borderRadius: '9999px')
  sx?: SxProps<Theme>; // Custom MUI style overrides
}

const DEFAULT_STATUS_LABELS: Record<string, string> = {
  invited: 'Invited',
  active: 'Active',
  disabled: 'Disabled',
  preparing: 'Preparing',
  billing: 'Billing',
  'waiting driver': 'Waiting Driver',
  available: 'Available',
  ready: 'Ready',
  'ready to serve': 'Ready to Serve',
  served: 'Served',
  upi: 'UPI',
  occupied: 'Occupied',
  'waiting pickup': 'Waiting Pickup',
  card: 'Card',
  kot: 'KOT Sent',
  'kot sent': 'KOT Sent',
  cash: 'Cash',
  cleaning: 'Cleaning',
  reserved: 'Reserved',
  confirmed: 'Confirmed',
  'checked in': 'Checked In',
  cancelled: 'Cancelled',
  draft: 'Draft',
};

function formatStatusFallback(status?: string | null): string {
  if (!status) return '';
  const normalized = normalizeStatusKey(status);
  if (DEFAULT_STATUS_LABELS[normalized]) {
    return DEFAULT_STATUS_LABELS[normalized];
  }
  return status
    .replace(/([A-Z])/g, ' $1')
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// Global status chip component with 24px height and 6px border radius
export function StatusChip({
  status,
  label,
  variantType,
  textColor,
  bgColor,
  dotColor,
  showDot = false,
  pill = false,
  size = 'small',
  sx,
  ...chipProps
}: Readonly<StatusChipProps>) {
  // Resolve style from status prop, falling back to label if it is a string
  const lookupKey = status ?? (typeof label === 'string' ? label : '');
  const resolvedVariant = variantType ?? resolveStatusVariant(lookupKey);
  const style = getStatusChipStyle(lookupKey, resolvedVariant);
  const isPill = pill || resolvedVariant === 'role';

  // Apply explicit color overrides if provided
  const resolvedColor = textColor ?? style.color;
  const resolvedBg = bgColor ?? style.bg;
  const resolvedDotColor = dotColor ?? style.color;

  // Use provided label, or fallback to auto-formatted status text
  const displayLabel = label ?? formatStatusFallback(status);

  return (
    <Chip
      size={size}
      label={
        showDot ? (
          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
            <Box
              component="span"
              aria-hidden
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: resolvedDotColor,
                flexShrink: 0,
              }}
            />
            <span>{displayLabel}</span>
          </Box>
        ) : (
          displayLabel
        )
      }
      sx={{
        height: isPill ? 26 : 24,
        fontSize: isPill ? '12px' : '11px',
        fontWeight: isPill ? 700 : 600,
        borderRadius: isPill ? '9999px' : '6px',
        border: 'none',
        color: (theme) => {
          if (textColor) return textColor;
          if (resolvedVariant === 'role' || resolvedVariant === 'info') {
            return theme.palette.mode === 'dark' ? '#93C5FD' : '#1B59F8';
          }
          return resolvedColor;
        },
        bgcolor: (theme) => {
          if (bgColor) return bgColor;
          if (resolvedVariant === 'role' || resolvedVariant === 'info') {
            return theme.palette.mode === 'dark' ? 'rgba(51, 84, 244, 0.22)' : '#EFF4FE';
          }
          return resolvedBg;
        },
        '& .MuiChip-label': {
          px: isPill ? 1.5 : 1,
          lineHeight: 1,
          fontSize: isPill ? '12px' : '11px',
          fontWeight: isPill ? 700 : 600,
        },
        ...sx,
      }}
      {...chipProps}
    />
  );
}
