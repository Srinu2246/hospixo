'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import type {
  PosTableItem,
  PosTableStatus,
} from '@/lib/schemas/pos/point-of-sale/tables/posTableViewSchema';
import { colors } from '@/lib/theme/mui/colors';

export interface PosFloorTableCardProps {
  table: PosTableItem;
  isSelected?: boolean;
  onClick?: (table: PosTableItem) => void;
  /** Captain-flow mobile/tablet card density (Figma). */
  compact?: boolean;
}

const STATUS_INDICATOR_COLORS: Record<PosTableStatus, string> = {
  available: colors.success.default,
  occupied: colors.warning.default,
  reserved: colors.danger.default,
  billing: colors.secondary.default,
  cleaning: colors.gray.default,
};

export function PosFloorTableCard({
  table,
  isSelected = false,
  onClick,
  compact = false,
}: Readonly<PosFloorTableCardProps>) {
  const statusColor = STATUS_INDICATOR_COLORS[table.status] || colors.gray.default;
  const guestCount = table.guests ?? table.capacity;

  return (
    <Box
      onClick={() => onClick?.(table)}
      sx={{
        height: compact ? 'auto' : 150,
        minHeight: compact ? 108 : 150,
        boxSizing: 'border-box',
        borderRadius: '12px',
        bgcolor: 'background.paper',
        border: (theme) =>
          isSelected
            ? `2px solid ${colors.captainFlow.primary}`
            : `1px solid ${theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default}`,
        p: compact ? '12px 14px' : '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: compact ? 1 : 0,
        cursor: 'pointer',
        transition: 'all 0.15s ease-in-out',
        position: 'relative',
        boxShadow: compact
          ? '0 1px 2px rgba(15, 23, 42, 0.04)'
          : isSelected
            ? '0 4px 16px rgba(37, 99, 235, 0.12)'
            : 'none',
        '&:hover': {
          borderColor: isSelected ? colors.captainFlow.primary : colors.primary.light,
        },
      }}
    >
      {!compact ? (
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 16,
            width: 4,
            height: 24,
            borderTopRightRadius: '3px',
            borderBottomRightRadius: '3px',
            bgcolor: statusColor,
            zIndex: 1,
          }}
        />
      ) : null}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          sx={{
            fontSize: compact ? '1.0625rem' : '1.125rem',
            fontWeight: 800,
            color: 'text.primary',
            lineHeight: 1,
          }}
        >
          {table.name}
        </Typography>

        <StatusChip
          status={table.status}
          variantType={
            table.status === 'reserved'
              ? 'danger'
              : table.status === 'occupied'
                ? 'warning'
                : table.status === 'available'
                  ? 'success'
                  : undefined
          }
          showDot
          size="small"
          pill
        />
      </Box>

      {compact && guestCount != null ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: 'text.secondary' }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <GroupOutlinedIcon sx={{ fontSize: 15 }} />
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
              {guestCount} {guestCount === 1 ? 'Guest' : 'Guests'}
            </Typography>
          </Box>
          {table.time ? (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.35 }}>
              <AccessTimeOutlinedIcon sx={{ fontSize: 14 }} />
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>{table.time}</Typography>
            </Box>
          ) : null}
        </Box>
      ) : null}

      {!compact && table.capacity != null ? (
        <Box
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}
        >
          <GroupOutlinedIcon sx={{ fontSize: 16 }} />
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
            {table.capacity} seats
          </Typography>
        </Box>
      ) : null}

      <Box sx={{ display: compact ? 'none' : 'flex', flexDirection: 'column', gap: 0.5 }}>
        {table.amount ? (
          <>
            <Typography
              sx={{
                fontSize: '1.1875rem',
                fontWeight: 800,
                color: 'text.primary',
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
              }}
            >
              {table.amount}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                color: 'text.secondary',
                mt: 0.25,
              }}
            >
              {table.guests !== undefined && (
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.35 }}>
                  <GroupOutlinedIcon sx={{ fontSize: 16 }} />
                  <Typography component="span" sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                    {table.guests}
                  </Typography>
                </Box>
              )}
              {table.waiter ? (
                <>
                  <Typography component="span" sx={{ fontSize: '0.75rem' }}>
                    ·
                  </Typography>
                  <Typography component="span" sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                    {table.waiter}
                  </Typography>
                </>
              ) : null}
              {table.time ? (
                <>
                  <Typography component="span" sx={{ fontSize: '0.75rem' }}>
                    ·
                  </Typography>
                  <Typography component="span" sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                    {table.time}
                  </Typography>
                </>
              ) : null}
            </Box>
          </>
        ) : (
          <Typography
            sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.secondary', mt: 'auto' }}
          >
            {table.message || 'Tap to open'}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
