'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import type { PosTableItem, PosTableStatus } from '@/lib/mocks/pos/usePosTables.mocks';
import { colors } from '@/lib/theme/mui/colors';

export interface PosFloorTableCardProps {
  table: PosTableItem;
  isSelected?: boolean;
  onClick?: (table: PosTableItem) => void;
}

const STATUS_INDICATOR_COLORS: Record<PosTableStatus, string> = {
  available: colors.success.default,
  occupied: colors.primary.default,
  reserved: colors.warning.default,
  billing: colors.secondary.default,
  cleaning: colors.gray.default,
};

export function PosFloorTableCard({
  table,
  isSelected = false,
  onClick,
}: Readonly<PosFloorTableCardProps>) {
  const statusColor = STATUS_INDICATOR_COLORS[table.status] || colors.gray.default;

  return (
    <Box
      onClick={() => onClick?.(table)}
      sx={{
        height: 150,
        boxSizing: 'border-box',
        borderRadius: '12px',
        bgcolor: (theme) => theme.palette.background.paper,
        border: (theme) =>
          isSelected
            ? `2px solid ${colors.primary.default}`
            : `1px solid ${theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default}`,
        p: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        transition: 'all 0.15s ease-in-out',
        position: 'relative',
        boxShadow: isSelected ? '0 4px 16px rgba(51, 84, 244, 0.12)' : 'none',
        '&:hover': {
          borderColor: isSelected ? colors.primary.default : colors.primary.light,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark'
              ? 'action.hover'
              : isSelected
                ? 'background.paper'
                : 'rgba(51, 84, 244, 0.03)',
          boxShadow: isSelected
            ? '0 6px 20px rgba(51, 84, 244, 0.16)'
            : (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 4px 12px rgba(0, 0, 0, 0.4)'
                  : '0 6px 20px rgba(51, 84, 244, 0.08)',
        },
      }}
    >
      {/* Status Accent Line on left border, aligned with table name row */}
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

      {/* Top Header Row: Table Name + StatusChip */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          sx={{
            fontSize: '1.125rem',
            fontWeight: 800,
            color: 'text.primary',
            lineHeight: 1,
          }}
        >
          {table.name}
        </Typography>

        <StatusChip status={table.status} label={table.status.toUpperCase()} showDot size="small" />
      </Box>

      {/* Middle/Bottom Content Area */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
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
                fontSize: '0.8125rem',
                mt: 0.25,
              }}
            >
              {table.guests !== undefined && (
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.35 }}>
                  <GroupOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography
                    component="span"
                    sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary' }}
                  >
                    {table.guests}
                  </Typography>
                </Box>
              )}

              {table.waiter && (
                <>
                  <Typography
                    component="span"
                    sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
                  >
                    ·
                  </Typography>
                  <Typography
                    component="span"
                    sx={{ fontSize: '0.8125rem', fontWeight: 500, color: 'text.secondary' }}
                  >
                    {table.waiter}
                  </Typography>
                </>
              )}

              {table.time && (
                <>
                  <Typography
                    component="span"
                    sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
                  >
                    ·
                  </Typography>
                  <Typography
                    component="span"
                    sx={{ fontSize: '0.8125rem', fontWeight: 500, color: 'text.secondary' }}
                  >
                    {table.time}
                  </Typography>
                </>
              )}
            </Box>
          </>
        ) : (
          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'text.secondary',
              mt: 'auto',
            }}
          >
            {table.message || 'Tap to open'}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
