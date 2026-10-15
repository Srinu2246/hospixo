'use client';

import Box from '@mui/material/Box';

import type { TableConfigStatus } from '@/features/floor-table-setup/types/floor-table-setup';

export function TableConfigStatusDot({ status }: Readonly<{ status: TableConfigStatus }>) {
  return (
    <Box
      component="span"
      aria-hidden
      sx={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        flexShrink: 0,
        bgcolor: status === 'active' ? 'success.main' : 'error.main',
      }}
    />
  );
}
