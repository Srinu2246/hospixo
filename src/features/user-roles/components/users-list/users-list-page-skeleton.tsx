'use client';

import { Box, Skeleton, Stack } from '@mui/material';

export function UsersListPageSkeleton() {
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto', width: '100%' }}>
      <Stack spacing={3}>
        <Box>
          <Skeleton variant="text" width={220} height={36} />
          <Skeleton variant="text" width="min(420px, 100%)" height={24} />
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} variant="rounded" height={88} sx={{ flex: 1, borderRadius: 2 }} />
          ))}
        </Stack>
        <Skeleton variant="rounded" height={360} sx={{ borderRadius: 2 }} />
      </Stack>
    </Box>
  );
}
