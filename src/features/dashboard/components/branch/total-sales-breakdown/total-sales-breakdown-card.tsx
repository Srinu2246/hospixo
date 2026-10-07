'use client';

import { Box, Card, Chip, Stack, Typography } from '@mui/material';
import { TrendingUp } from 'lucide-react';

import { branchDashboardCopy } from '@/features/dashboard/config/branch/dashboard';
import type { BranchDashboardOverview } from '@/features/dashboard/types/branch-dashboard';
import { formatCurrency } from '@/features/dashboard/lib/format';

type TotalSalesBreakdownCardProps = Readonly<{
  breakdown: BranchDashboardOverview['paymentBreakdown'];
}>;

function formatSharePercent(amount: number, total: number) {
  if (total <= 0) return '0%';
  return `${Math.round((amount / total) * 100)}%`;
}

export function TotalSalesBreakdownCard({ breakdown }: TotalSalesBreakdownCardProps) {
  const total = Math.max(breakdown.total, 1);

  return (
    <Card
      variant="outlined"
      id="sales-breakdown"
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
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}
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
            {branchDashboardCopy.totalSalesBreakdownTitle}
          </Typography>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'text.primary', mt: 0.5 }}>
            {formatCurrency(breakdown.total)}
          </Typography>
        </Box>
        <Box
          sx={{
            width: '2.25rem',
            height: '2.25rem',
            borderRadius: '0.5rem',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(56, 189, 248, 0.16)'
                : 'rgba(14, 165, 233, 0.12)',
            color: 'info.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TrendingUp size={18} aria-hidden />
        </Box>
      </Box>

      {/* Segmented bar */}
      <Box
        sx={{
          display: 'flex',
          height: 10,
          borderRadius: 9999,
          overflow: 'hidden',
          bgcolor: 'action.hover',
          mb: 2.5,
        }}
        aria-hidden
      >
        {breakdown.items.map((item) =>
          item.amount > 0 ? (
            <Box
              key={item.label}
              sx={{
                width: `${(item.amount / total) * 100}%`,
                bgcolor: item.color,
                height: '100%',
              }}
            />
          ) : null,
        )}
      </Box>

      {/* Legend list */}
      <Stack spacing={1.5} sx={{ mt: 'auto' }}>
        {breakdown.items.map((item) => (
          <Box
            key={item.label}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8125rem',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: item.color,
                  flexShrink: 0,
                }}
              />
              <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.8125rem' }}>
                {item.label}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.8125rem' }}
              >
                {formatCurrency(item.amount)}
              </Typography>
              <Chip
                size="small"
                label={formatSharePercent(item.amount, total)}
                sx={{
                  fontSize: '0.6875rem',
                  height: 20,
                  bgcolor: 'action.hover',
                  color: 'text.secondary',
                }}
              />
            </Box>
          </Box>
        ))}
        {breakdown.items.length === 0 ? (
          <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
            No payment breakdown data.
          </Typography>
        ) : null}
      </Stack>
    </Card>
  );
}
