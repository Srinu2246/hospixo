'use client';

import { Box, Card, Stack, Typography } from '@mui/material';
import { AlertTriangle } from 'lucide-react';

import { branchDashboardCopy } from '@/features/dashboard/config/branch/dashboard';
import type { DashboardLeakageGroup } from '@/features/dashboard/types';

type BranchLeakageCardProps = Readonly<{
  kots: DashboardLeakageGroup;
  bills: DashboardLeakageGroup;
}>;

function LeakageTable({ title, group }: Readonly<{ title: string; group: DashboardLeakageGroup }>) {
  return (
    <Box>
      <Typography
        variant="caption"
        sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 1 }}
      >
        {title}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${group.items.length || 1}, minmax(0, 1fr))`,
          gap: 1,
          bgcolor: 'action.hover',
          p: 1.5,
          borderRadius: '0.5rem',
        }}
      >
        {group.items.map((stat) => (
          <Box key={stat.label} sx={{ textAlign: 'center' }}>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontSize: '0.6875rem', display: 'block', mb: 0.25 }}
            >
              {stat.label}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: stat.tone === 'danger' ? 'error.main' : 'text.primary',
              }}
            >
              {stat.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export function BranchLeakageCard({ kots, bills }: BranchLeakageCardProps) {
  const { title, groups } = branchDashboardCopy.leakage;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: '0.75rem',
        p: { xs: 2, sm: '1.25rem 1.5rem' },
        bgcolor: 'background.paper',
        borderColor: 'divider',
        boxShadow: '0 1px 2px rgb(0 0 0 / 0.04)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Box sx={{ color: 'warning.main', display: 'flex' }}>
          <AlertTriangle size={18} aria-hidden />
        </Box>
        <Typography
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'text.secondary',
          }}
        >
          {title}
        </Typography>
      </Box>

      <Stack spacing={2} sx={{ mt: 'auto' }}>
        <LeakageTable title={groups.kots} group={kots} />
        <LeakageTable title={groups.bills} group={bills} />
      </Stack>
    </Card>
  );
}
