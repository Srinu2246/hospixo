'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import NotificationsOffOutlinedIcon from '@mui/icons-material/NotificationsOffOutlined';

import type { KitchenStation, KitchenDisplayStats } from '@/types/kitchen-display';
import { colors } from '@/lib/theme/mui/colors';
import { screen } from '@/lib/theme/mui/breakpoints';

export interface KitchenHeaderProps {
  selectedStation: KitchenStation;
  stations: KitchenStation[];
  onSelectStation: (station: KitchenStation) => void;
  currentTime: string;
  stats: KitchenDisplayStats;
  isLiveActive: boolean;
  /** Stream status label (Live, Reconnecting, Offline, …). */
  liveLabel?: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  avatarUrl?: string;
}

export function KitchenHeader({
  selectedStation,
  stations,
  onSelectStation,
  currentTime,
  stats,
  isLiveActive,
  liveLabel = 'Live',
  soundEnabled,
  onToggleSound,
  avatarUrl = '/images/kumar_reddy.jpg',
}: Readonly<KitchenHeaderProps>) {
  const liveDotColor =
    liveLabel === 'Live'
      ? '#10B981'
      : liveLabel === 'Reconnecting' || liveLabel === 'Connecting'
        ? '#F59E0B'
        : '#9CA3AF';
  return (
    <Box
      sx={{
        mt: { [screen.mobile]: -2, [screen.desktop]: -3 },
        mx: { [screen.mobile]: -2, [screen.desktop]: -3 },
        width: {
          [screen.mobile]: 'calc(100% + 32px)',
          [screen.desktop]: 'calc(100% + 48px)',
        },
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? colors.surface.dark : '#FFFFFF'),
        borderRadius: 0,
        border: 'none',
        borderBottom: '1px solid',
        borderColor: (theme) => (theme.palette.mode === 'dark' ? theme.palette.divider : '#E5E7EB'),
        boxShadow: 'none',
        px: { [screen.mobile]: 2, [screen.desktop]: 3 },
        py: 1.5,
        minHeight: 68,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: { xs: 1, sm: 1.5, md: 2 },
        flexWrap: 'nowrap',
        overflow: 'visible',
        mb: 3,
      }}
    >
      {/* 1. Left: Title, Floor Subtitle & Station Pills */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1.5, sm: 2 },
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
      >
        <Box sx={{ flexShrink: 0 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1rem', sm: '1.125rem' },
              color: 'text.primary',
              lineHeight: 1.25,
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
            }}
          >
            Kitchen Display
          </Typography>
          <Typography
            sx={{
              color: 'text.secondary',
              fontSize: '0.75rem',
              mt: 0.25,
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
            }}
          >
            {selectedStation} • Floor 1
          </Typography>
        </Box>

        {/* Station Selector Pill Container */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? colors.surface.darkMuted : '#F1F3F5',
            borderRadius: '9999px',
            p: '3px',
            gap: '2px',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {stations.map((st) => {
            const isActive = st === selectedStation;
            return (
              <Box
                key={st}
                onClick={() => onSelectStation(st)}
                sx={{
                  px: { xs: 1.25, sm: 1.5 },
                  py: 0.4,
                  borderRadius: '9999px',
                  fontSize: '0.8125rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  bgcolor: isActive
                    ? (theme) => (theme.palette.mode === 'dark' ? colors.surface.dark : '#FFFFFF')
                    : 'transparent',
                  color: isActive ? 'text.primary' : 'text.secondary',
                  boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  '&:hover': {
                    color: 'text.primary',
                  },
                }}
              >
                {st}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* 2. Center: Live Digital Clock (Timer) */}
      {currentTime && (
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(30, 58, 138, 0.25)' : '#EFF6FF',
            border: '1px solid',
            borderColor: (theme) => (theme.palette.mode === 'dark' ? '#1E3A8A' : '#DBEAFE'),
            borderRadius: '8px',
            px: { xs: 1.5, sm: 2 },
            py: 0.45,
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          <Typography
            noWrap
            sx={{
              color: (theme) => (theme.palette.mode === 'dark' ? '#60A5FA' : '#1D4ED8'),
              fontWeight: 700,
              fontSize: { xs: '1rem', sm: '1.125rem' },
              letterSpacing: '0.04em',
              fontFamily: 'monospace, sans-serif',
              lineHeight: 1.1,
              whiteSpace: 'nowrap',
            }}
          >
            {currentTime}
          </Typography>
        </Box>
      )}

      {/* 3. Right: Metrics, Live Indicator, Alert Button & Profile Avatar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 0.75, sm: 1, md: 1.25 },
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
      >
        {/* Total Orders 324 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.6,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? colors.surface.darkMuted : '#F3F4F6',
            border: '1px solid',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? theme.palette.divider : '#E5E7EB',
            borderRadius: '8px',
            px: { xs: 1, sm: 1.25 },
            py: 0.4,
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'text.primary',
              whiteSpace: 'nowrap',
            }}
          >
            Total Orders
          </Typography>
          <Typography
            sx={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: '#1B59F8',
              whiteSpace: 'nowrap',
            }}
          >
            {stats.totalOrders}
          </Typography>
        </Box>

        {/* 4 Pending */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.4,
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#EF4444' }}>
            {stats.pendingCount}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Pending</Typography>
        </Box>

        {/* 2 Preparing */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.4,
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#F59E0B' }}>
            {stats.preparingCount}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Preparing</Typography>
        </Box>

        {/* 2 Ready */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.4,
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#10B981' }}>
            {stats.readyCount}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Ready</Typography>
        </Box>

        {/* • Live Badge */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.6,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(6, 95, 70, 0.25)' : '#ECFDF5',
            border: '1px solid',
            borderColor: (theme) => (theme.palette.mode === 'dark' ? '#065F46' : '#A7F3D0'),
            borderRadius: '9999px',
            px: { xs: 1, sm: 1.25 },
            py: 0.35,
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: liveDotColor,
              boxShadow: isLiveActive && liveLabel === 'Live' ? '0 0 6px #10B981' : 'none',
            }}
          />
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: (theme) => (theme.palette.mode === 'dark' ? '#34D399' : '#059669'),
            }}
          >
            {liveLabel}
          </Typography>
        </Box>

        {/* Notification Bell Button */}
        <Tooltip title={soundEnabled ? 'Mute Kitchen Alerts' : 'Unmute Kitchen Alerts'}>
          <IconButton
            onClick={onToggleSound}
            size="small"
            sx={{
              width: 34,
              height: 34,
              border: '1px solid',
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? theme.palette.divider : '#E5E7EB',
              borderRadius: '50%',
              color: soundEnabled ? 'text.secondary' : '#EF4444',
              flexShrink: 0,
            }}
          >
            {soundEnabled ? (
              <NotificationsNoneOutlinedIcon sx={{ fontSize: 18 }} />
            ) : (
              <NotificationsOffOutlinedIcon sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        </Tooltip>

        {/* Profile Avatar (Matching Screenshot 2) */}
        <Tooltip title="Kitchen Operator Profile">
          <Avatar
            src={avatarUrl}
            alt="Kitchen Operator"
            sx={{
              width: 34,
              height: 34,
              border: '1px solid',
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? theme.palette.divider : '#E5E7EB',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          />
        </Tooltip>
      </Box>
    </Box>
  );
}
