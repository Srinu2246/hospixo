'use client';

import { Box, Paper, Typography } from '@mui/material';

import type { OutletSalesRow } from '@/features/dashboard/types';
import { formatCurrency } from '@/features/dashboard/lib/format';

type OutletSalesHoverCardProps = Readonly<{
  row: OutletSalesRow;
  placement?: 'start' | 'center' | 'end';
  sx?: object;
}>;

const fields: ReadonlyArray<{
  label: string;
  value: (row: OutletSalesRow) => string;
}> = [
  { label: 'Orders', value: (row) => String(row.orders) },
  { label: 'Sales', value: (row) => formatCurrency(row.sales) },
  { label: 'Net Sales', value: (row) => formatCurrency(row.netSales) },
  { label: 'Tax', value: (row) => formatCurrency(row.tax) },
  { label: 'Discount', value: (row) => formatCurrency(row.discount) },
  { label: 'Modified', value: (row) => String(row.modified) },
  { label: 'Re-printed', value: (row) => String(row.reprinted) },
  { label: 'Waived Charges', value: (row) => formatCurrency(row.waivedCharges) },
];

export function OutletSalesHoverCard({ row, placement = 'center', sx }: OutletSalesHoverCardProps) {
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
        {row.outletName}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {fields.map((field) => (
          <Box
            key={field.label}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {field.label}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>
              {field.value(row)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
