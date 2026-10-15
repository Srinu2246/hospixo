'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

import { Card } from '@/components/shared/ui/Card';
import { colors } from '@/lib/theme/mui/colors';
import { LEAKAGE_STATS } from '@/lib/mocks/dashboard/dashboard.mocks';

export function LeakageTrackerCard() {
  return (
    <Card
      variant="outlined"
      padding={3}
      sx={{
        borderRadius: '12px',
        borderColor: (theme) =>
          theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? colors.surface.dark : colors.surface.default,
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 2,
        height: '100%',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningAmberOutlinedIcon sx={{ fontSize: 18, color: '#EF4444' }} />
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: colors.primary.default }}>
          Leakage Tracker
        </Typography>
      </Box>

      {/* 1. KOTS Table */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <Typography
          sx={{
            fontSize: '0.625rem',
            fontWeight: 700,
            color: colors.text.secondary,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          KOTS
        </Typography>

        <Box
          sx={{
            p: 1.25,
            borderRadius: '8px',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#F9FAFB',
            border: '1px solid',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 1,
            textAlign: 'center',
          }}
        >
          <Box>
            <Typography sx={{ fontSize: '0.625rem', color: colors.text.secondary }}>
              Cancelled
            </Typography>
            <Typography
              sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'text.primary', mt: 0.25 }}
            >
              {LEAKAGE_STATS.kots.cancelled}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.625rem', color: colors.text.secondary }}>
              Modified
            </Typography>
            <Typography
              sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'text.primary', mt: 0.25 }}
            >
              {LEAKAGE_STATS.kots.modified}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.625rem', color: colors.text.secondary }}>
              Shifted
            </Typography>
            <Typography
              sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'text.primary', mt: 0.25 }}
            >
              {LEAKAGE_STATS.kots.shifted}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.625rem', color: colors.text.secondary }}>
              Not used in bills
            </Typography>
            <Typography
              sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'text.primary', mt: 0.25 }}
            >
              {LEAKAGE_STATS.kots.notUsedInBills}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 2. BILLS Table */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <Typography
          sx={{
            fontSize: '0.625rem',
            fontWeight: 700,
            color: colors.text.secondary,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          BILLS
        </Typography>

        <Box
          sx={{
            p: 1.25,
            borderRadius: '8px',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#F9FAFB',
            border: '1px solid',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1,
            textAlign: 'center',
          }}
        >
          <Box>
            <Typography sx={{ fontSize: '0.625rem', color: colors.text.secondary }}>
              Modified
            </Typography>
            <Typography
              sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'text.primary', mt: 0.25 }}
            >
              {LEAKAGE_STATS.bills.modified}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.625rem', color: colors.text.secondary }}>
              Re-printed
            </Typography>
            <Typography
              sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'text.primary', mt: 0.25 }}
            >
              {LEAKAGE_STATS.bills.reprinted}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.625rem', color: colors.text.secondary }}>
              Knocked off
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#EF4444', mt: 0.25 }}>
              {LEAKAGE_STATS.bills.knockedOffAmount}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
