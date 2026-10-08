'use client';

import { Box, Card, Chip, LinearProgress, Typography } from '@mui/material';

import { organisationDashboardCopy } from '@/features/dashboard/config/organisation/dashboard';
import {
  formatRenewalDate,
  formatUsageValue,
} from '@/features/dashboard/lib/organisation-dashboard-format';
import type { OrganisationDashboardOverview } from '@/features/dashboard/types/organisation-dashboard';

type SubscriptionUsageCardProps = Readonly<{
  subscription: OrganisationDashboardOverview['subscription'];
}>;

export function SubscriptionUsageCard({ subscription }: SubscriptionUsageCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: '0.75rem',
        bgcolor: 'background.paper',
        p: { xs: 2, sm: '1.25rem 1.5rem' },
        borderColor: 'divider',
        boxShadow: '0 1px 2px rgb(0 0 0 / 0.04)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: 'text.primary',
          }}
        >
          {organisationDashboardCopy.subscriptionTitle}
        </Typography>
        {subscription.status === 'active' ? (
          <Chip
            size="small"
            label="Active"
            sx={{
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(34, 197, 94, 0.16)'
                  : 'rgba(34, 197, 94, 0.12)',
              color: 'success.main',
              fontWeight: 700,
              fontSize: '0.6875rem',
              height: 22,
            }}
          />
        ) : null}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 2,
          p: 1.5,
          borderRadius: '0.5rem',
          bgcolor: 'action.hover',
          mb: 2.5,
        }}
      >
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.6875rem',
              display: 'block',
              mb: 0.25,
            }}
          >
            {organisationDashboardCopy.currentPlanLabel}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'text.primary',
            }}
          >
            {subscription.plan}
          </Typography>
        </Box>
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.6875rem',
              display: 'block',
              mb: 0.25,
            }}
          >
            {organisationDashboardCopy.cycleRenewal}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'text.primary',
            }}
          >
            {subscription.billingCycle} / {formatRenewalDate(subscription.renewalDate)}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
        {subscription.usage.map((usage) => {
          const percent = Math.min(100, Math.round((usage.used / usage.limit) * 100));

          return (
            <Box key={usage.id}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 0.75,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontSize: '0.8125rem', color: 'text.primary', fontWeight: 500 }}
                >
                  {usage.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    fontWeight: 600,
                  }}
                >
                  {formatUsageValue(usage.used, usage.limit, usage.unit)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={percent}
                sx={{
                  height: 6,
                  borderRadius: 9999,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.06)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 9999,
                    bgcolor: 'info.main',
                  },
                }}
              />
            </Box>
          );
        })}
      </Box>
    </Card>
  );
}
