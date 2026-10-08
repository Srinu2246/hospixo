'use client';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Paper from '@mui/material/Paper';

const SIDEBAR_ITEM_KEYS = ['all', 'main', 'starters', 'breads', 'rice'] as const;

export function CategoriesSidebarSkeleton() {
  return (
    <Paper
      variant="outlined"
      component="aside"
      aria-busy="true"
      aria-label="Loading categories"
      sx={{
        p: 2,
        width: { xs: '100%', md: 260 },
        flexShrink: 0,
      }}
    >
      <Skeleton variant="text" width={100} height={28} sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {SIDEBAR_ITEM_KEYS.map((key) => (
          <Skeleton key={key} variant="rounded" height={40} sx={{ borderRadius: 1 }} />
        ))}
      </Box>
      <Skeleton variant="rounded" height={36} sx={{ mt: 2, borderRadius: 1 }} />
    </Paper>
  );
}
