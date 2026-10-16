'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import BarChartIcon from '@mui/icons-material/BarChart';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ShowChartIcon from '@mui/icons-material/ShowChart';

import { Card } from '@/components/shared/ui/Card';
import { colors } from '@/lib/theme/mui/colors';
import type { DashboardStatItem } from '../../types/dashboard.types';

export interface DashboardStatCardProps {
  stat: DashboardStatItem;
}

export function DashboardStatCard({ stat }: Readonly<DashboardStatCardProps>) {
  const renderIcon = () => {
    const iconSx = { fontSize: 20, color: colors.primary.default };
    switch (stat.iconType) {
      case 'sales':
        return <ShowChartIcon sx={iconSx} />;
      case 'net':
        return <BarChartIcon sx={iconSx} />;
      case 'companies':
        return <ApartmentIcon sx={iconSx} />;
      case 'branches':
        return <AccountTreeOutlinedIcon sx={iconSx} />;
      case 'online':
        return <LanguageIcon sx={iconSx} />;
      case 'offline':
        return <PointOfSaleIcon sx={iconSx} />;
      default:
        return <ShowChartIcon sx={iconSx} />;
    }
  };

  return (
    <Card
      variant="outlined"
      padding={1.75}
      sx={{
        borderRadius: '14px',
        borderColor: (theme) => (theme.palette.mode === 'dark' ? theme.palette.divider : '#E2E8F0'),
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? colors.surface.dark : '#FFFFFF'),
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 1.25,
        minHeight: { xs: 112, sm: 124 },
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 6px 20px rgba(0,0,0,0.4)'
              : '0 6px 20px rgba(27, 89, 248, 0.08)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Typography
          sx={{
            fontSize: '0.625rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: colors.text.secondary,
            textTransform: 'uppercase',
          }}
        >
          {stat.label}
        </Typography>

        {/* Top-right Icon Badge */}
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: '8px',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(27, 89, 248, 0.15)' : '#EFF4FE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {renderIcon()}
        </Box>
      </Box>

      {/* Main Metric Value */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
        <Typography
          sx={{
            fontSize: { xs: '1.25rem', sm: '1.625rem' },
            fontWeight: 800,
            color: 'text.primary',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}
        >
          {stat.value}
        </Typography>

        {/* Trend Indicator or Sub-value */}
        {stat.trend ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mt: 1.25 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.25,
                color: stat.trend.isPositive ? '#16A34A' : '#EF4444',
                fontWeight: 700,
                fontSize: { xs: '0.6875rem', sm: '0.75rem' },
              }}
            >
              {stat.trend.isPositive ? (
                <TrendingUpIcon sx={{ fontSize: 14 }} />
              ) : (
                <TrendingDownIcon sx={{ fontSize: 14 }} />
              )}
              {stat.trend.value}
            </Box>
            <Typography
              sx={{ fontSize: { xs: '0.6875rem', sm: '0.75rem' }, color: colors.text.secondary }}
            >
              {stat.trend.periodText}
            </Typography>
          </Box>
        ) : stat.subValue ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: '#16A34A',
              }}
            />
            <Typography sx={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>
              {stat.subValue}
            </Typography>
          </Box>
        ) : null}
      </Box>
    </Card>
  );
}
