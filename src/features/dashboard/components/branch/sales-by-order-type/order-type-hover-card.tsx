'use client';

import { Box, Paper, Typography } from '@mui/material';

import { formatCurrency } from '@/features/dashboard/lib/format';
import type { BranchOrderTypeRow } from '@/features/dashboard/types/branch-dashboard';

type OrderTypeHoverCardProps = Readonly<{
  row: BranchOrderTypeRow;
  sx?: object;
}>;

export function OrderTypeHoverCard({ row, sx }: OrderTypeHoverCardProps) {
  return (
    <Paper
      elevation={8}
      role="tooltip"
      sx={{
        position: 'absolute',
        bottom: 'calc(100% + 8px)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1400,
        width: 180,
        p: 1.5,
        borderRadius: '0.5rem',
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        pointerEvents: 'none',
        ...sx,
      }}
    >
      <Typography
        sx={{
          fontSize: '0.8125rem',
          fontWeight: 700,
          color: 'text.primary',
          mb: 1,
          borderBottom: 1,
          borderColor: 'divider',
          pb: 0.5,
        }}
      >
        {row.label}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Orders
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>
            {row.orders.toLocaleString('en-IN')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Sales
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>
            {formatCurrency(row.sales)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
