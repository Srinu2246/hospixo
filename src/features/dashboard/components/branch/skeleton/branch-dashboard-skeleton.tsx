'use client';

import { Box, Card, Skeleton } from '@mui/material';

function CardSkeleton({ height = 180 }: Readonly<{ height?: number }>) {
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton variant="text" width={220} height={32} />
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
        {Array.from({ length: 4 }).map((_, index) => (
          <CardSkeleton key={index} height={140} />
        ))}
      </Box>

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
