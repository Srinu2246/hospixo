'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { Card } from '@/components/shared/ui/Card';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import { colors } from '@/lib/theme/mui/colors';
import { ORG_SUBSCRIPTION_USAGE } from '@/lib/mocks/dashboard/dashboard.mocks';

export function SubscriptionUsageCard({
  companiesUsed,
  branchesUsed,
}: Readonly<{ companiesUsed?: number; branchesUsed?: number }> = {}) {
  const metrics = ORG_SUBSCRIPTION_USAGE.metrics.map((metric) => {
    if (metric.label === 'Companies' && companiesUsed != null) {
      return { ...metric, used: companiesUsed };
    }
    if (metric.label === 'Branches' && branchesUsed != null) {
      return { ...metric, used: branchesUsed };
    }
    return metric;
  });
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
        gap: 2.5,
        height: '100%',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: 'text.primary' }}>
          Subscription & Usage
        </Typography>
        <StatusChip label={ORG_SUBSCRIPTION_USAGE.status} variantType="success" pill />
      </Box>

      {/* Plan Info */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
          borderBottom: '1px solid',
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ fontSize: '0.6875rem', color: colors.text.secondary }}>
            Current Plan
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'text.primary' }}>
            {ORG_SUBSCRIPTION_USAGE.planName}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
          <Typography sx={{ fontSize: '0.6875rem', color: colors.text.secondary }}>
            Cycle / Renewal
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.primary' }}>
            {ORG_SUBSCRIPTION_USAGE.billingCycle}
          </Typography>
        </Box>
      </Box>

      {/* Progress Metrics */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {metrics.map((m) => {
          const percent = Math.min(Math.round((m.used / m.total) * 100), 100);

          return (
            <Box key={m.label} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography
                  sx={{ fontSize: '0.75rem', color: colors.text.secondary, fontWeight: 500 }}
                >
                  {m.label}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.primary' }}>
                  {m.used.toLocaleString()} {m.unit ? m.unit : ''} / {m.total.toLocaleString()}{' '}
                  {m.unit ? m.unit : ''}
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={percent}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#E5E7EB',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: colors.primary.default,
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
          );
        })}
      </Box>

      {/* CTA Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
        <ActionButton
          variant="primary"
          size="small"
          sx={{
            bgcolor: colors.primary.default,
            color: '#FFFFFF',
            fontWeight: 700,
            borderRadius: '8px',
            px: 2.5,
            py: 0.75,
            '&:hover': {
              bgcolor: '#1548CA',
            },
          }}
        >
          Manage Plan
        </ActionButton>
      </Box>
    </Card>
  );
}
