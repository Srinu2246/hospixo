'use client';

import { Box, Card, Skeleton } from '@mui/material';

export function CardSkeleton({ height = 180 }: Readonly<{ height?: number }>) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: '0.75rem',
        p: '1.25rem 1.5rem',
        bgcolor: 'background.paper',
        borderColor: 'divider',
        boxShadow: '0 1px 2px rgb(0 0 0 / 0.04)',
        height,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Skeleton variant="text" width="50%" height={20} />
      <Skeleton variant="text" width="75%" height={36} />
      <Skeleton variant="text" width="30%" height={16} />
    </Card>
  );
}

export function DashboardHeaderSkeleton({ titleWidth = 220 }: Readonly<{ titleWidth?: number }>) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Skeleton variant="text" width={titleWidth} height={32} />
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Skeleton variant="rounded" width={160} height={36} sx={{ borderRadius: '0.5rem' }} />
        <Skeleton variant="rounded" width={120} height={36} sx={{ borderRadius: '0.5rem' }} />
      </Box>
    </Box>
  );
}

export function KpiGridSkeleton({
  count = 4,
  height = 140,
}: Readonly<{ count?: number; height?: number }>) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: `repeat(${count}, 1fr)` },
        gap: 2,
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} height={height} />
      ))}
    </Box>
  );
}
