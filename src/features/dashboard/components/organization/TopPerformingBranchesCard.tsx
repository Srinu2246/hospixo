'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import { Card } from '@/components/shared/ui/Card';
import { colors } from '@/lib/theme/mui/colors';
import type { TopPerformingBranch } from '../../types/dashboard.types';

export function TopPerformingBranchesCard({
  branches = [],
}: Readonly<{ branches?: TopPerformingBranch[] }> = {}) {
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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: 'text.primary' }}>
          Top Performing Branches
        </Typography>
        <TrendingUpIcon sx={{ fontSize: 20, color: '#16A34A' }} />
      </Box>

      {/* Ranked List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
        {branches.map((item) => (
          <Box
            key={item.rank}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* Rank Circle Badge */}
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#F3F4F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: colors.text.secondary,
                }}
              >
                {item.rank}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: 'text.primary' }}>
                  {item.name}
                </Typography>
                <Typography sx={{ fontSize: '0.6875rem', color: colors.text.secondary }}>
                  {item.companyName}
                </Typography>
              </Box>
            </Box>

            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: 'text.primary' }}>
              {item.revenue}
            </Typography>
          </Box>
        ))}
      </Box>
    </Card>
  );
}
