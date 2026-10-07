'use client';

import { Box, Card, Divider, Stack, Typography } from '@mui/material';

import { branchDashboardCopy } from '@/features/dashboard/config/branch/dashboard';
import type {
  BranchDashboardOverview,
  BranchDashboardPeriod,
} from '@/features/dashboard/types/branch-dashboard';
import { formatCurrency, formatPercent } from '@/features/dashboard/lib/format';
import { PeriodSelect } from '@/features/dashboard/components/branch/shared/period-select';

type BranchExpensesCardProps = Readonly<{
  expenses: BranchDashboardOverview['expenses'];
  period: BranchDashboardPeriod;
  onPeriodChange: (period: BranchDashboardPeriod) => void;
}>;

export function BranchExpensesCard({ expenses, period, onPeriodChange }: BranchExpensesCardProps) {
  const isPositive = expenses.changePercent >= 0;
  const { title, totalLabel } = branchDashboardCopy.expenses;

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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'text.secondary',
            }}
          >
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: 'text.primary' }}>
              {formatCurrency(expenses.headerAmount)}
            </Typography>
            {expenses.headerAmount > 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem' }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: isPositive ? 'success.main' : 'error.main',
                  }}
                >
                  {formatPercent(expenses.changePercent)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', ml: 0.5 }}>
                  {expenses.changeLabel}
                </Typography>
              </Box>
            ) : null}
          </Box>
        </Box>
        <PeriodSelect value={period} onChange={onPeriodChange} ariaLabel="Expenses period" />
      </Box>

      <Stack spacing={1.5} sx={{ mb: 'auto' }}>
        {expenses.items.map((item) => (
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
        {expenses.items.length === 0 ? (
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
          {formatCurrency(expenses.total)}
        </Typography>
      </Box>
    </Card>
  );
}
