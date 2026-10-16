'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
import { Card } from '@/components/shared/ui/Card';
import type { PosMetricCardData } from '@/lib/mocks/pos/usePosDashboard.mocks';

export interface PosMetricCardProps {
  data: PosMetricCardData;
}

function renderMetricIcon(type: PosMetricCardData['iconType']) {
  switch (type) {
    case 'orders':
      return (
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(51, 84, 244, 0.18)' : 'rgba(51, 84, 244, 0.1)',
            color: '#3354F4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2" />
            <path d="M15 2v10" />
            <path d="M15 15v7" />
            <path d="M6 2v7a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V2" />
            <path d="M8 11v11" />
          </svg>
        </Box>
      );
    case 'pending':
      return (
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(245, 158, 11, 0.18)'
                : 'rgba(245, 158, 11, 0.1)',
            color: '#F59E0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </Box>
      );
    case 'ready':
      return (
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(16, 185, 129, 0.18)'
                : 'rgba(16, 185, 129, 0.1)',
            color: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
            <line x1="6" y1="17" x2="18" y2="17" />
          </svg>
        </Box>
      );
    case 'bills':
      return (
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(99, 102, 241, 0.18)'
                : 'rgba(99, 102, 241, 0.1)',
            color: '#6366F1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <circle cx="12" cy="12" r="2" />
            <path d="M6 12h.01M18 12h.01" />
          </svg>
        </Box>
      );
  }
}

export function PosMetricCard({ data }: Readonly<PosMetricCardProps>) {
  const isUp = data.trendDirection === 'up';

  return (
    <Card
      variant="outlined"
      padding="24px"
      sx={{
        height: 176,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Header Row: Title & Icon */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.8125rem',
            fontWeight: 700,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {data.title}
        </Typography>
        {renderMetricIcon(data.iconType)}
      </Box>

      {/* Middle: Metric Big Number */}
      <Box sx={{ my: 'auto' }}>
        <Typography
          variant="h3"
          sx={{
            fontSize: '2.5rem',
            fontWeight: 800,
            color: 'text.primary',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          {data.value}
        </Typography>
      </Box>

      {/* Bottom: Trend and Comparison */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
        }}
      >
        {isUp ? (
          <TrendingUpOutlinedIcon sx={{ fontSize: 18, color: '#10B981' }} />
        ) : (
          <TrendingDownOutlinedIcon sx={{ fontSize: 18, color: '#EF4444' }} />
        )}
        <Typography
          component="span"
          sx={{
            fontSize: '0.84375rem',
            fontWeight: 700,
            color: isUp ? '#10B981' : '#EF4444',
          }}
        >
          {data.trend}
        </Typography>
        <Typography
          component="span"
          sx={{
            fontSize: '0.8125rem',
            color: 'text.secondary',
            fontWeight: 500,
          }}
        >
          {data.comparisonText}
        </Typography>
      </Box>
    </Card>
  );
}
