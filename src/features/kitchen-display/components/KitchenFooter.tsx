'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export interface KitchenFooterProps {
  printerStatus?: 'Connected' | 'Disconnected';
  posSyncStatus?: 'Active' | 'Syncing' | 'Offline';
  avgPrepTime?: string;
}

export function KitchenFooter({
  printerStatus = 'Connected',
  posSyncStatus = 'Active',
  avgPrepTime = '14m 30s',
}: Readonly<KitchenFooterProps>) {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        pt: 4,
        pb: 1.5,
        mt: 'auto',
      }}
    >
      {/* Left: Device & Sync Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3.5, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: printerStatus === 'Connected' ? '#10B981' : '#EF4444',
            }}
          />
          <Typography
            sx={{
              fontSize: '0.8125rem',
              color: 'text.secondary',
              fontWeight: 500,
            }}
          >
            Printer: {printerStatus}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: posSyncStatus === 'Active' ? '#10B981' : '#F59E0B',
            }}
          />
          <Typography
            sx={{
              fontSize: '0.8125rem',
              color: 'text.secondary',
              fontWeight: 500,
            }}
          >
            POS sync: {posSyncStatus}
          </Typography>
        </Box>
      </Box>

      {/* Right: Avg Prep Time */}
      <Typography
        sx={{
          fontSize: '0.8125rem',
          color: 'text.secondary',
          fontWeight: 500,
        }}
      >
        Avg. Prep Time: {avgPrepTime}
      </Typography>
    </Box>
  );
}
