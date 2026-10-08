'use client';

import { Box, Divider, Stack, Typography } from '@mui/material';

import type { DashboardExpenseItem } from '@/features/dashboard/types';
import { formatCurrency } from '@/features/dashboard/lib/format';

export type ExpenseSummaryBodyProps = Readonly<{
  items: readonly DashboardExpenseItem[];
  total: number;
  totalLabel: string;
}>;

export function ExpenseSummaryBody({ items, total, totalLabel }: ExpenseSummaryBodyProps) {
  return (
    <>
      <Stack spacing={1.5} sx={{ mb: 'auto' }}>
        {items.map((item) => (
          <Box
            key={item.label}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8125rem',
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
              {item.label}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.primary', fontWeight: 500, fontSize: '0.8125rem' }}
            >
              {formatCurrency(item.amount)}
            </Typography>
          </Box>
        ))}
        {items.length === 0 ? (
          <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
            No expenses recorded.
          </Typography>
        ) : null}
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {totalLabel}
        </Typography>
        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: 'text.primary' }}>
          {formatCurrency(total)}
        </Typography>
      </Box>
    </>
  );
}
