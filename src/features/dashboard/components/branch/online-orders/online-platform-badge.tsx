'use client';

import { Box, Typography } from '@mui/material';

import type { BranchOnlinePlatformId } from '@/features/dashboard/types/branch-dashboard';

const platformColorMap: Record<
  BranchOnlinePlatformId,
  { bg: string; color: string; initial: string; defaultLabel: string }
> = {
  zomato: { bg: '#e23744', color: '#ffffff', initial: 'Z', defaultLabel: 'Zomato' },
  swiggy: { bg: '#fc8019', color: '#ffffff', initial: 'S', defaultLabel: 'Swiggy' },
  growthfalcons: { bg: '#4f46e5', color: '#ffffff', initial: 'G', defaultLabel: 'GrowthFalcons' },
};

type OnlinePlatformBadgeProps = Readonly<{
  id: BranchOnlinePlatformId;
  label?: string;
}>;

export function OnlinePlatformBadge({ id, label }: OnlinePlatformBadgeProps) {
  const meta = platformColorMap[id] ?? {
    bg: '#64748b',
    color: '#ffffff',
    initial: id.charAt(0).toUpperCase(),
    defaultLabel: id,
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          width: 22,
          height: 22,
          borderRadius: 1,
          bgcolor: meta.bg,
          color: meta.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '0.6875rem',
        }}
        aria-hidden
      >
        {meta.initial}
      </Box>
      <Typography
        variant="body2"
        sx={{ fontSize: '0.8125rem', fontWeight: 500, color: 'text.primary' }}
      >
        {label ?? meta.defaultLabel}
      </Typography>
    </Box>
  );
}
