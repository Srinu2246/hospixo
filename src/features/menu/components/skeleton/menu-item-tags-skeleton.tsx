'use client';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

const TAG_KEYS = ['tag-1', 'tag-2', 'tag-3', 'tag-4', 'tag-5', 'tag-6'] as const;

export function MenuItemTagsSkeleton() {
  return (
    <Box
      aria-busy="true"
      aria-label="Loading tags"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1.5,
        mt: 1.5,
      }}
    >
      {TAG_KEYS.map((key) => (
        <Skeleton key={key} variant="rounded" width={100} height={32} sx={{ borderRadius: 4 }} />
      ))}
    </Box>
  );
}
