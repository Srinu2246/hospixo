'use client';

import { Box, Paper, Typography } from '@mui/material';

import { formatCurrency } from '@/features/dashboard/lib/format';
import type { OrganisationCompanyPerformanceRow } from '@/features/dashboard/types/organisation-dashboard';

type CompanyPerformanceHoverCardProps = Readonly<{
  row: OrganisationCompanyPerformanceRow;
  metricLabel: string;
  metricValue: string;
  placement?: 'start' | 'center' | 'end';
  sx?: object;
}>;

export function CompanyPerformanceHoverCard({
  row,
  metricLabel,
  metricValue,
  placement = 'center',
  sx,
}: CompanyPerformanceHoverCardProps) {
  const items = [
    { label: metricLabel, value: metricValue },
    { label: 'Branches', value: String(row.branches) },
    { label: 'Revenue', value: formatCurrency(row.revenue) },
    { label: 'Orders', value: row.orders.toLocaleString('en-IN') },
    { label: 'Expenses', value: formatCurrency(row.expenses) },
    { label: 'Profit', value: formatCurrency(row.profit) },
  ];

  const placementSx =
    placement === 'start'
      ? { left: 0, right: 'auto', transform: 'none' }
      : placement === 'end'
        ? { right: 0, left: 'auto', transform: 'none' }
        : { left: '50%', right: 'auto', transform: 'translateX(-50%)' };

  return (
    <Paper
      elevation={8}
      role="tooltip"
      sx={{
        position: 'absolute',
        bottom: 'calc(100% + 8px)',
        zIndex: 1400,
        width: 220,
        p: 1.5,
        borderRadius: '0.5rem',
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        pointerEvents: 'none',
        ...placementSx,
        ...sx,
      }}
    >
      <Typography
        sx={{
          fontSize: '0.875rem',
          fontWeight: 700,
          color: 'text.primary',
          mb: 1,
          borderBottom: 1,
          borderColor: 'divider',
          pb: 0.5,
        }}
      >
        {row.companyName}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {items.map((item) => (
          <Box
            key={item.label}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {item.label}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>
              {item.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
