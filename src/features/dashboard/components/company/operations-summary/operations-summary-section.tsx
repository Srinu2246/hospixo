'use client';

import { Box, Typography } from '@mui/material';

import { SummaryDonutCard } from '@/features/dashboard/components/company/summary-donut';
import { companyLandingContent } from '@/features/dashboard/config/company';
import type { DashboardOverview } from '@/features/dashboard/types';

type OperationsSummarySectionProps = Readonly<{
  taxSummary: DashboardOverview['taxSummary'];
  discountsSummary: DashboardOverview['discountsSummary'];
}>;

export function OperationsSummarySection({
  taxSummary,
  discountsSummary,
}: OperationsSummarySectionProps) {
  const { sectionTitle, taxTitle, discountsTitle } = companyLandingContent.operationsSummary;

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
        {sectionTitle}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
          gap: 2,
        }}
      >
        <SummaryDonutCard title={taxTitle} total={taxSummary.total} items={taxSummary.items} />
        <SummaryDonutCard
          title={discountsTitle}
          total={discountsSummary.total}
          items={discountsSummary.items}
        />
      </Box>
    </Box>
  );
}
