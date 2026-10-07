'use client';

import { Box, Card, Divider, Stack, Typography } from '@mui/material';

import { companyLandingContent } from '@/features/dashboard/config/company';
import type { DashboardExpenseItem } from '@/features/dashboard/types';
import { formatCurrency } from '@/features/dashboard/lib/format';

type ExpensesCardProps = Readonly<{
  total: number;
  items: readonly DashboardExpenseItem[];
}>;

export function ExpensesCard({ total, items }: ExpensesCardProps) {
  const { title, totalLabel } = companyLandingContent.expenses;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: '0.75rem',
        p: { xs: 2, sm: '1.25rem 1.5rem' },
        bgcolor: 'background.paper',
        borderColor: 'divider',
        boxShadow: '0 1px 2px rgb(0 0 0 / 0.04)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography
        sx={{
          fontSize: '0.6875rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'text.secondary',
          mb: 2,
        }}
      >
        {title}
      </Typography>

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
    </Card>
  );
}
