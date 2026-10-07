'use client';

import { Box, Card, Chip, Typography } from '@mui/material';

import { companyLandingContent } from '@/features/dashboard/config/company';
import { AreaLineChart } from '@/features/dashboard/components/company/shared';
import { formatCurrency } from '@/features/dashboard/lib/format';

type RevenueForecastCardProps = Readonly<{
  total: number;
  confidence: string;
  series: readonly number[];
}>;

export function RevenueForecastCard({ total, confidence, series }: RevenueForecastCardProps) {
  const { title, subtitle } = companyLandingContent.revenueForecast;

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
          gap: 1.5,
          mb: 1.5,
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
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', fontSize: '0.8125rem', mt: 0.25 }}
          >
            {subtitle}
          </Typography>
        </Box>
        <Chip
          size="small"
          label={confidence}
          color="info"
          variant="outlined"
          sx={{ fontSize: '0.75rem', height: 24, fontWeight: 600 }}
        />
      </Box>

      <Typography
        sx={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'text.primary',
          mb: 2,
        }}
      >
        {formatCurrency(total)}
      </Typography>

      <Box sx={{ mt: 'auto', pt: 1 }}>
        <AreaLineChart
          series={series}
          gradientId="revenueForecastFill"
          ariaLabel="Revenue forecast trend"
        />
      </Box>
    </Card>
  );
}
