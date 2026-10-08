'use client';

import { Box } from '@mui/material';

import {
  CardSkeleton,
  DashboardHeaderSkeleton,
  KpiGridSkeleton,
} from '@/features/dashboard/components/shared/dashboard-skeleton-parts';

export function BranchDashboardSkeleton() {
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
      aria-label="Loading branch dashboard"
    >
      <DashboardHeaderSkeleton titleWidth={220} />

      <KpiGridSkeleton count={4} height={140} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.2fr 1fr 1fr' },
          gap: 2,
        }}
      >
        <CardSkeleton height={260} />
        <CardSkeleton height={260} />
        <CardSkeleton height={260} />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        {Array.from({ length: 3 }).map((_, index) => (
          <CardSkeleton key={index} height={150} />
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        <CardSkeleton height={240} />
        <CardSkeleton height={240} />
        <CardSkeleton height={240} />
      </Box>
    </Box>
  );
}
