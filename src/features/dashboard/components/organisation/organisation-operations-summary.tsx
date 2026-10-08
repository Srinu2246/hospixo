'use client';

import { Box, Card, Stack, Typography } from '@mui/material';

import { SummaryDonutCard } from '@/features/dashboard/components/company/summary-donut';
import { organisationDashboardCopy } from '@/features/dashboard/config/organisation/dashboard';
import { formatCurrency } from '@/features/dashboard/lib/format';
import { organisationChartColors } from '@/features/dashboard/lib/organisation-chart-colors';
import type { OrganisationDashboardOverview } from '@/features/dashboard/types/organisation-dashboard';

type OrganisationOperationsSummaryProps = Readonly<{
  taxSummary: OrganisationDashboardOverview['taxSummary'];
  financialBreakdown: OrganisationDashboardOverview['financialBreakdown'];
}>;

const stackColorMap = {
  cogs: organisationChartColors.blue,
  expenses: organisationChartColors.pink,
  profit: organisationChartColors.green,
  taxes: organisationChartColors.amber,
} as const;

export function OrganisationOperationsSummary({
  taxSummary,
  financialBreakdown,
}: OrganisationOperationsSummaryProps) {
  return (
    <Box>
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 700,
          color: 'text.primary',
          mb: 2,
        }}
      >
        {organisationDashboardCopy.operationsSummaryTitle}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
          gap: 2,
        }}
      >
        <SummaryDonutCard
          title={organisationDashboardCopy.taxSummaryTitle}
          total={taxSummary.total}
          items={taxSummary.items}
        />

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
            {organisationDashboardCopy.financialBreakdownTitle}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              height: 12,
              borderRadius: 9999,
              overflow: 'hidden',
              bgcolor: 'action.hover',
              mb: 3,
            }}
            aria-hidden
          >
            {financialBreakdown.map((slice) =>
              slice.percent > 0 ? (
                <Box
                  key={slice.id}
                  sx={{
                    bgcolor: stackColorMap[slice.tone],
                    width: `${slice.percent}%`,
                    height: '100%',
                  }}
                />
              ) : null,
            )}
          </Box>

          <Stack spacing={1.5} sx={{ mt: 'auto' }}>
            {financialBreakdown.map((slice) => (
              <Box
                key={slice.id}
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
                      bgcolor: stackColorMap[slice.tone],
                    }}
                  />
                  <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.8125rem' }}>
                    {slice.label}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.8125rem' }}
                >
                  {formatCurrency(slice.amount)} ({slice.percent}%)
                </Typography>
              </Box>
            ))}
          </Stack>
        </Card>
      </Box>
    </Box>
  );
}
