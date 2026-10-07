'use client';

import { Box, Card, Skeleton, Stack } from '@mui/material';

const KPI_COUNT = 4;
const CHART_BAR_COUNT = 6;
const CHART_BAR_HEIGHTS = [72, 58, 85, 64, 91, 55];

function KpiCardSkeleton() {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: '0.75rem',
        p: '1.25rem 1.5rem',
        bgcolor: 'background.paper',
        borderColor: 'divider',
        boxShadow: '0 1px 2px rgb(0 0 0 / 0.04)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 1.5,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ width: '60%' }}>
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="text" width="80%" height={36} sx={{ mt: 0.5 }} />
        </Box>
        <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '0.5rem' }} />
      </Box>
      <Skeleton variant="text" width="40%" height={16} />
    </Card>
  );
}

function CompanyPerformanceChartSkeleton() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${CHART_BAR_COUNT}, minmax(0, 1fr))`,
        alignItems: 'flex-end',
        gap: 2,
        height: 220,
        pt: 3,
        pb: 1,
      }}
    >
      {Array.from({ length: CHART_BAR_COUNT }).map((_, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100%',
            justifyContent: 'flex-end',
          }}
        >
          <Skeleton
            variant="rounded"
            width="50%"
            height={`${CHART_BAR_HEIGHTS[index] ?? 60}%`}
            sx={{ borderRadius: '6px 6px 0 0' }}
          />
          <Skeleton variant="text" width="70%" height={16} sx={{ mt: 1 }} />
        </Box>
      ))}
    </Box>
  );
}

export function OrganisationDashboardSkeleton() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'background.default' : '#f8fafc'),
        p: { xs: 2, sm: 2.5, md: 3 },
        pb: { xs: 6, md: 8 },
        minHeight: '100%',
        boxSizing: 'border-box',
      }}
      role="status"
      aria-busy="true"
      aria-label="Loading organisation dashboard"
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton variant="text" width={240} height={32} />
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Skeleton variant="rounded" width={160} height={36} sx={{ borderRadius: '0.5rem' }} />
          <Skeleton variant="rounded" width={120} height={36} sx={{ borderRadius: '0.5rem' }} />
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        {Array.from({ length: KPI_COUNT }).map((_, index) => (
          <KpiCardSkeleton key={index} />
        ))}
      </Box>

      <Card
        variant="outlined"
        sx={{
          borderRadius: '0.75rem',
          p: '1.25rem 1.5rem',
          bgcolor: 'background.paper',
          borderColor: 'divider',
          boxShadow: '0 1px 2px rgb(0 0 0 / 0.04)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Skeleton variant="rounded" width={140} height={32} sx={{ borderRadius: '0.5rem' }} />
          <Skeleton variant="rounded" width={80} height={32} sx={{ borderRadius: '0.375rem' }} />
        </Box>
        <CompanyPerformanceChartSkeleton />
      </Card>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
          gap: 2,
        }}
      >
        <Card
          variant="outlined"
          sx={{
            borderRadius: '0.75rem',
            p: '1.25rem 1.5rem',
            boxShadow: '0 1px 2px rgb(0 0 0 / 0.04)',
            height: 200,
          }}
        >
          <Skeleton variant="text" width={120} height={20} sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            <Skeleton variant="circular" width={120} height={120} />
            <Stack spacing={1} sx={{ flex: 1 }}>
              <Skeleton variant="text" width="90%" height={20} />
              <Skeleton variant="text" width="75%" height={20} />
              <Skeleton variant="text" width="85%" height={20} />
            </Stack>
          </Box>
        </Card>
        <Card
          variant="outlined"
          sx={{
            borderRadius: '0.75rem',
            p: '1.25rem 1.5rem',
            boxShadow: '0 1px 2px rgb(0 0 0 / 0.04)',
            height: 200,
          }}
        >
          <Skeleton variant="text" width={140} height={20} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" width="100%" height={12} sx={{ borderRadius: 9999, mb: 3 }} />
          <Stack spacing={1}>
            <Skeleton variant="text" width="80%" height={20} />
            <Skeleton variant="text" width="70%" height={20} />
            <Skeleton variant="text" width="85%" height={20} />
          </Stack>
        </Card>
      </Box>
    </Box>
  );
}
