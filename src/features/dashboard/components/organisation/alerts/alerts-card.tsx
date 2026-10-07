'use client';

import Link from 'next/link';
import { Box, Button, Card, Typography } from '@mui/material';

import { organisationDashboardCopy } from '@/features/dashboard/config/organisation/dashboard';
import { formatRelativeTime } from '@/features/dashboard/lib/organisation-dashboard-format';
import type { OrganisationAlert } from '@/features/dashboard/types/organisation-dashboard';

type AlertsCardProps = Readonly<{
  alerts: readonly OrganisationAlert[];
}>;

export function AlertsCard({ alerts }: AlertsCardProps) {
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
      <Typography
        variant="h6"
        sx={{
          fontSize: '0.875rem',
          fontWeight: 700,
          color: 'text.primary',
          mb: 2,
        }}
      >
        {organisationDashboardCopy.alertsTitle}
      </Typography>

      {alerts.length === 0 ? (
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            textAlign: 'center',
            py: 3,
            fontSize: '0.875rem',
          }}
        >
          No pending alerts
        </Typography>
      ) : (
        <Box
          component="ul"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            m: 0,
            p: 0,
            listStyle: 'none',
          }}
        >
          {alerts.map((alert) => (
            <Box
              component="li"
              key={alert.id}
              sx={{
                p: 1.5,
                borderRadius: '0.5rem',
                bgcolor: 'action.hover',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.75,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: alert.severity === 'critical' ? 'error.main' : 'warning.main',
                    flexShrink: 0,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'text.primary',
                    lineHeight: 1.3,
                  }}
                >
                  {alert.title}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  pl: 2,
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                  {formatRelativeTime(alert.occurredAt)}
                </Typography>
                {alert.href ? (
                  <Button
                    component={Link}
                    href={alert.href}
                    size="small"
                    sx={{
                      p: 0,
                      minWidth: 'auto',
                      textTransform: 'none',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'info.main',
                      '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                    }}
                  >
                    {organisationDashboardCopy.view}
                  </Button>
                ) : (
                  <Button
                    size="small"
                    sx={{
                      p: 0,
                      minWidth: 'auto',
                      textTransform: 'none',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'info.main',
                      '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                    }}
                  >
                    {organisationDashboardCopy.view}
                  </Button>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Card>
  );
}
