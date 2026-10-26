'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import type { PosFloorTable } from '@/lib/schemas/pos/point-of-sale/dashboard/posDashboardSchema';
import { getTableStatusColor } from '@/lib/helpers';

export interface PosTableCardProps {
  table: PosFloorTable;
  onClick?: (table: PosFloorTable) => void;
}

export function PosTableCard({ table, onClick }: Readonly<PosTableCardProps>) {
  const dotColor = getTableStatusColor(table.status);

  return (
    <Box
      onClick={() => onClick?.(table)}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '8px',
        p: 1.25,
        minHeight: 64,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'action.hover' : '#FAFAFB'),
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        '&:hover': {
          borderColor: dotColor,
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: '0.9375rem',
          color: 'text.primary',
          lineHeight: 1.2,
        }}
      >
        {table.tableNumber}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          mt: 0.5,
        }}
      >
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            bgcolor: dotColor,
            flexShrink: 0,
          }}
        />
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.6875rem',
            color: 'text.secondary',
            fontWeight: 600,
          }}
        >
          {table.statusLabel}
        </Typography>
      </Box>
    </Box>
  );
}
